"""SEO-роуты: sitemap.xml и prerender мета-тегов для краулеров и соц.сетей.

Зачем prerender:
SPA на React отрисовывает мета-теги и JSON-LD только после выполнения JS.
Боты вроде VK, Facebook, Telegram и части поисковиков делают снапшот до
запуска скриптов и видят только заглушечные мета из index.html.
Мы детектируем user-agent краулера и подменяем мета в index.html на реальные.
"""
from __future__ import annotations

import html
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, PlainTextResponse, Response
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db

router = APIRouter(tags=["seo"])

_DIST = Path(__file__).resolve().parent.parent.parent.parent / "dist"

# User-agents, для которых отдаём prerender-версию HTML с реальными мета-тегами.
_BOT_UA_RE = re.compile(
    r"googlebot|bingbot|yandex|duckduckbot|baiduspider|slurp|facebookexternalhit|"
    r"twitterbot|telegrambot|vkshare|whatsapp|linkedinbot|discordbot|slackbot|"
    r"applebot|petalbot|semrushbot|ahrefsbot|mj12bot|rogerbot",
    re.IGNORECASE,
)


def _is_bot(user_agent: Optional[str]) -> bool:
    if not user_agent:
        return False
    return bool(_BOT_UA_RE.search(user_agent))


def _get_site_origin(request: Request) -> str:
    env = os.getenv("SITE_URL", "").strip().rstrip("/")
    if env:
        return env
    scheme = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.netloc
    return f"{scheme}://{host}".rstrip("/")


def _load_settings(db: Session, row_id: int) -> dict:
    row = db.query(models.SiteSettings).filter(models.SiteSettings.id == row_id).first()
    if not row or not row.data:
        return {}
    try:
        return json.loads(row.data)
    except (ValueError, TypeError):
        return {}


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


@router.get("/robots.txt", response_class=PlainTextResponse)
def robots_txt(request: Request) -> PlainTextResponse:
    """Fallback для /robots.txt, если в dist/ файла нет."""
    origin = _get_site_origin(request)
    body = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin\n"
        "Disallow: /admin/\n"
        "Disallow: /profile\n"
        "Disallow: /checkout\n"
        "Disallow: /cart\n"
        "Disallow: /api/\n\n"
        f"Sitemap: {origin}/sitemap.xml\n"
    )
    return PlainTextResponse(body, headers={"Cache-Control": "public, max-age=3600"})


@router.get("/sitemap.xml")
def sitemap_xml(request: Request, db: Session = Depends(get_db)) -> Response:
    """Динамическая карта сайта: статические страницы + все товары."""
    origin = _get_site_origin(request)
    now = datetime.now(timezone.utc).date().isoformat()

    static_pages = [
        ("/", "1.0", "daily"),
        ("/catalog", "0.9", "daily"),
        ("/about", "0.5", "monthly"),
        ("/contacts", "0.5", "monthly"),
    ]

    urls_xml: list[str] = []
    for path, priority, changefreq in static_pages:
        urls_xml.append(
            f"  <url>\n"
            f"    <loc>{html.escape(origin + path)}</loc>\n"
            f"    <lastmod>{now}</lastmod>\n"
            f"    <changefreq>{changefreq}</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            f"  </url>"
        )

    products = db.query(models.Product.id, models.Product.image).all()
    for prod_id, image in products:
        loc = html.escape(f"{origin}/product/{prod_id}")
        image_tag = ""
        if image:
            image_url = _resolve_media(image, origin)
            if image_url:
                image_tag = (
                    f"\n    <image:image>\n"
                    f"      <image:loc>{html.escape(image_url)}</image:loc>\n"
                    f"    </image:image>"
                )
        urls_xml.append(
            f"  <url>\n"
            f"    <loc>{loc}</loc>\n"
            f"    <lastmod>{now}</lastmod>\n"
            f"    <changefreq>weekly</changefreq>\n"
            f"    <priority>0.8</priority>{image_tag}\n"
            f"  </url>"
        )

    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:image="http://www.google.com/schemas/sitemaps-image/1.1">\n'
        + "\n".join(urls_xml)
        + "\n</urlset>\n"
    )
    return Response(
        content=body,
        media_type="application/xml",
        headers={"Cache-Control": "public, max-age=1800"},
    )


def _build_product_meta(prod: models.Product, origin: str) -> dict:
    name = prod.name or "Товар"
    description = (prod.description or "")[:300].strip() or name
    image = _resolve_media(prod.image, origin)
    url = f"{origin}/product/{prod.id}"
    return {
        "title": f"{name} — купить с доставкой",
        "description": description,
        "image": image,
        "url": url,
        "og_type": "product",
        "price": prod.price,
        "in_stock": prod.in_stock,
    }


def _inject_meta(index_html: str, meta: dict) -> str:
    """Подменяет title, description и OG-теги в готовом index.html."""
    def esc(value: str) -> str:
        return html.escape(str(value), quote=True)

    title = esc(meta["title"])
    description = esc(meta["description"])
    url = esc(meta["url"])
    image = esc(meta.get("image") or "")
    og_type = esc(meta.get("og_type") or "website")

    def replace_meta(pattern: str, replacement: str, source: str) -> str:
        new_source, count = re.subn(pattern, replacement, source, count=1, flags=re.IGNORECASE)
        if count == 0:
            new_source = source.replace("</head>", f"    {replacement}\n  </head>", 1)
        return new_source

    out = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", index_html, count=1, flags=re.IGNORECASE | re.DOTALL)

    out = replace_meta(
        r'<meta\s+name="description"[^>]*>',
        f'<meta name="description" content="{description}" />',
        out,
    )
    out = replace_meta(
        r'<meta\s+property="og:title"[^>]*>',
        f'<meta property="og:title" content="{title}" />',
        out,
    )
    out = replace_meta(
        r'<meta\s+property="og:description"[^>]*>',
        f'<meta property="og:description" content="{description}" />',
        out,
    )
    out = replace_meta(
        r'<meta\s+property="og:type"[^>]*>',
        f'<meta property="og:type" content="{og_type}" />',
        out,
    )

    extras = [f'<meta property="og:url" content="{url}" />', f'<link rel="canonical" href="{url}" />']
    if image:
        extras.append(f'<meta property="og:image" content="{image}" />')
        extras.append(f'<meta name="twitter:image" content="{image}" />')
    extras.append(f'<meta name="twitter:title" content="{title}" />')
    extras.append(f'<meta name="twitter:description" content="{description}" />')

    jsonld: Optional[dict] = None
    if meta.get("og_type") == "product" and meta.get("price") is not None:
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": meta["title"],
            "description": meta["description"],
            "url": meta["url"],
            "offers": {
                "@type": "Offer",
                "price": meta["price"],
                "priceCurrency": "RUB",
                "availability": "https://schema.org/InStock" if meta.get("in_stock") else "https://schema.org/OutOfStock",
                "url": meta["url"],
            },
        }
        if meta.get("image"):
            jsonld["image"] = meta["image"]

    injection = "\n    ".join(extras)
    if jsonld is not None:
        injection += '\n    <script type="application/ld+json">' + json.dumps(jsonld, ensure_ascii=False) + "</script>"

    out = out.replace("</head>", f"    {injection}\n  </head>", 1)
    return out


def maybe_prerender_for_bot(request: Request, full_path: str, db: Session) -> Optional[HTMLResponse]:
    """Возвращает prerendered HTML для ботов, иначе None (каллер отдаёт обычный SPA)."""
    if not _is_bot(request.headers.get("user-agent")):
        return None

    index_path = _DIST / "index.html"
    if not index_path.is_file():
        return None

    try:
        index_html = index_path.read_text(encoding="utf-8")
    except OSError:
        return None

    origin = _get_site_origin(request)
    path = "/" + full_path.strip("/")
    if path == "/":
        path = "/"

    meta: Optional[dict] = None

    product_match = re.match(r"^/product/([^/]+)/?$", path)
    if product_match:
        prod = db.query(models.Product).filter(models.Product.id == product_match.group(1)).first()
        if prod:
            meta = _build_product_meta(prod, origin)

    if meta is None:
        settings = _load_settings(db, row_id=1)
        appearance = _load_settings(db, row_id=2)

        brand = (settings.get("shopName") or "").strip() or "Цветочный магазин"
        route_labels = {
            "/": settings.get("seoTitle") or brand,
            "/catalog": f"Каталог — {brand}",
            "/about": f"О нас — {brand}",
            "/contacts": f"Контакты — {brand}",
        }
        title = route_labels.get(path) or brand
        description = (
            (settings.get("seoDescription") or "").strip()
            or (settings.get("shopTagline") or "").strip()
            or "Свежие цветы и букеты с доставкой."
        )
        image_src = appearance.get("bannerBgImage") or appearance.get("logoUrl") or ""
        meta = {
            "title": title,
            "description": description,
            "image": _resolve_media(image_src, origin),
            "url": f"{origin}{path}",
            "og_type": "website",
        }

    rendered = _inject_meta(index_html, meta)
    return HTMLResponse(
        content=rendered,
        headers={"Cache-Control": "public, max-age=300", "X-Prerender": "1"},
    )
