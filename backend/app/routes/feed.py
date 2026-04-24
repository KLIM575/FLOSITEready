"""Фид товаров: Яндекс.Маркет YML и настройки фида."""
from __future__ import annotations

import html
import json
import os
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db

router = APIRouter(tags=["feed"])

FEED_SETTINGS_ROW_ID = 3


class FeedSettings(BaseModel):
    # Магазин
    shopName: str = ""
    companyName: str = ""
    currency: str = "RUR"
    enableFeed: bool = True

    # Товары
    includeOutOfStock: bool = True
    priceType: str = "min"          # "min" | "base"
    excludedProductIds: list[str] = []   # ID товаров, исключённых из фида

    # Доставка
    enableDelivery: bool = False
    deliveryCost: float = 0.0       # 0 = бесплатно
    deliveryDays: int = 1
    orderBefore: int = 0            # 0 = не указывать; N = заказать до N часов

    # UTM-метки
    utmSource: str = ""
    utmMedium: str = ""
    utmCampaign: str = ""


def _get_or_create_row(db: Session) -> models.SiteSettings:
    row = db.query(models.SiteSettings).filter(
        models.SiteSettings.id == FEED_SETTINGS_ROW_ID
    ).first()
    if not row:
        row = models.SiteSettings(id=FEED_SETTINGS_ROW_ID, data=json.dumps({}))
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def _load_feed_settings(db: Session) -> FeedSettings:
    row = _get_or_create_row(db)
    raw = json.loads(row.data) if row.data else {}
    known = {k: v for k, v in raw.items() if k in FeedSettings.model_fields}
    return FeedSettings(**known)


def _get_site_origin(request: Request) -> str:
    env = os.getenv("SITE_URL", "").strip().rstrip("/")
    if env:
        return env
    scheme = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = (
        request.headers.get("x-forwarded-host")
        or request.headers.get("host")
        or request.url.netloc
    )
    return f"{scheme}://{host}".rstrip("/")


def _resolve_media(url: Optional[str], origin: str) -> str:
    if not url:
        return ""
    if url.startswith(("http://", "https://")):
        return url
    if url.startswith("//"):
        return f"https:{url}"
    if url.startswith("/"):
        return f"{origin}{url}"
    return url


def _load_site_settings(db: Session) -> dict:
    row = db.query(models.SiteSettings).filter(models.SiteSettings.id == 1).first()
    if not row or not row.data:
        return {}
    try:
        return json.loads(row.data)
    except (ValueError, TypeError):
        return {}


def _build_utm_suffix(fs: FeedSettings) -> str:
    params: dict[str, str] = {}
    if fs.utmSource:
        params["utm_source"] = fs.utmSource
    if fs.utmMedium:
        params["utm_medium"] = fs.utmMedium
    if fs.utmCampaign:
        params["utm_campaign"] = fs.utmCampaign
    if not params:
        return ""
    return "?" + urlencode(params)


def _build_yml(request: Request, db: Session, fs: FeedSettings) -> str:
    origin = _get_site_origin(request)
    site_settings = _load_site_settings(db)

    shop_name = fs.shopName or site_settings.get("shopName") or "Магазин"
    company_name = fs.companyName or site_settings.get("shopName") or "Компания"
    currency = fs.currency or "RUR"
    utm_suffix = _build_utm_suffix(fs)

    products = db.query(models.Product).all()
    if not fs.includeOutOfStock:
        products = [p for p in products if p.in_stock]
    excluded = set(fs.excludedProductIds)
    if excluded:
        products = [p for p in products if p.id not in excluded]

    # Уникальные категории
    categories_set: dict[str, int] = {}
    cat_counter = 1
    for p in products:
        cat = (p.category or "Другое").strip()
        if cat not in categories_set:
            categories_set[cat] = cat_counter
            cat_counter += 1

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")

    categories_xml = "\n".join(
        f'      <category id="{cid}">{html.escape(name)}</category>'
        for name, cid in categories_set.items()
    )

    # Блок delivery-options (опционально)
    delivery_block = ""
    if fs.enableDelivery:
        cost_str = "0" if fs.deliveryCost == 0 else f"{fs.deliveryCost:.0f}"
        ob_attr = f' order-before="{fs.orderBefore}"' if fs.orderBefore > 0 else ""
        delivery_block = (
            "\n        <delivery-options>"
            f'\n          <option cost="{cost_str}" days="{fs.deliveryDays}"{ob_attr}/>'
            "\n        </delivery-options>"
        )

    offers_parts: list[str] = []
    for p in products:
        cat_id = categories_set.get((p.category or "Другое").strip(), 1)

        # Цена
        if fs.priceType == "min" and p.sizes:
            price = min((s.price for s in p.sizes), default=p.price)
        else:
            price = p.price

        product_path = f"/catalog/{p.slug or p.id}"
        product_url = html.escape(f"{origin}{product_path}{utm_suffix}")

        picture = _resolve_media(p.image, origin)
        picture_tag = f"\n        <picture>{html.escape(picture)}</picture>" if picture else ""

        extra_pictures = ""
        if p.images:
            for img in p.images:
                img_url = _resolve_media(img.image_url, origin)
                if img_url and img_url != picture:
                    extra_pictures += f"\n        <picture>{html.escape(img_url)}</picture>"

        description = (p.description or "").strip()
        description_tag = (
            f"\n        <description>{html.escape(description[:3000])}</description>"
            if description
            else ""
        )

        available = "true" if p.in_stock else "false"
        offers_parts.append(
            f'      <offer id="{html.escape(str(p.id))}" available="{available}">\n'
            f"        <name>{html.escape(p.name)}</name>\n"
            f"        <url>{product_url}</url>\n"
            f"        <price>{price:.2f}</price>\n"
            f"        <currencyId>{currency}</currencyId>\n"
            f"        <categoryId>{cat_id}</categoryId>"
            f"{picture_tag}"
            f"{extra_pictures}"
            f"{description_tag}"
            f"{delivery_block}\n"
            f"      </offer>"
        )

    offers_xml = "\n".join(offers_parts)
    shop_url = html.escape(origin)

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<!DOCTYPE yml_catalog SYSTEM "shops.dtd">\n'
        f'<yml_catalog date="{now}">\n'
        "  <shop>\n"
        f"    <name>{html.escape(shop_name)}</name>\n"
        f"    <company>{html.escape(company_name)}</company>\n"
        f"    <url>{shop_url}</url>\n"
        "    <currencies>\n"
        f'      <currency id="{currency}" rate="1"/>\n'
        "    </currencies>\n"
        "    <categories>\n"
        f"{categories_xml}\n"
        "    </categories>\n"
        "    <offers>\n"
        f"{offers_xml}\n"
        "    </offers>\n"
        "  </shop>\n"
        "</yml_catalog>\n"
    )


@router.get("/api/feed/yml")
def get_yml_feed(request: Request, db: Session = Depends(get_db)) -> Response:
    """Фид Яндекс.Маркет YML (публичный)."""
    fs = _load_feed_settings(db)
    if not fs.enableFeed:
        return Response(status_code=404)
    body = _build_yml(request, db, fs)
    return Response(
        content=body,
        media_type="application/xml; charset=UTF-8",
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.get("/api/feed/settings")
def get_feed_settings(db: Session = Depends(get_db)) -> FeedSettings:
    return _load_feed_settings(db)


@router.put("/api/feed/settings")
def update_feed_settings(payload: FeedSettings, db: Session = Depends(get_db)) -> FeedSettings:
    row = _get_or_create_row(db)
    row.data = json.dumps(payload.model_dump())
    db.commit()
    return payload
