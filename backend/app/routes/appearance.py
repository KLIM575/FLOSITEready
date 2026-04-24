import json
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db
from ..services.image_service import (
    MAX_EDGE_BANNER,
    MAX_EDGE_FAVICON,
    MAX_EDGE_LOGO,
    save_uploaded_image,
)

router = APIRouter(prefix="/api/appearance", tags=["appearance"])

APPEARANCE_ROW_ID = 2


def _get_or_create_row(db: Session) -> models.SiteSettings:
    row = db.query(models.SiteSettings).filter(models.SiteSettings.id == APPEARANCE_ROW_ID).first()
    if not row:
        row = models.SiteSettings(id=APPEARANCE_ROW_ID, data=json.dumps({}))
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("", response_model=schemas.AppearanceSettingsData)
def get_appearance(db: Session = Depends(get_db)):
    row = _get_or_create_row(db)
    raw = json.loads(row.data) if row.data else {}
    return schemas.AppearanceSettingsData(**raw)


@router.put("", response_model=schemas.AppearanceSettingsData)
def update_appearance(payload: schemas.AppearanceSettingsData, db: Session = Depends(get_db)):
    row = _get_or_create_row(db)
    row.data = json.dumps(payload.model_dump())
    db.commit()
    db.refresh(row)
    return payload


def _appearance_upload_allowed(content_type: Optional[str], ext: str) -> bool:
    ct = (content_type or "").lower()
    if ct.startswith("image/"):
        return True
    if ext == "ico" and ct in ("application/octet-stream", "image/x-icon", "image/vnd.microsoft.icon"):
        return True
    return False


@router.post("/upload-asset")
async def upload_appearance_asset(
    file: UploadFile = File(...),
    asset_type: str = Form(...),
):
    if asset_type not in ("logo", "favicon", "banner"):
        raise HTTPException(
            status_code=400,
            detail="asset_type must be logo, favicon, or banner",
        )
    ext = (file.filename or "").rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "png"
    if ext not in ("png", "jpg", "jpeg", "webp", "svg", "gif", "ico"):
        ext = "png"
    if not _appearance_upload_allowed(file.content_type, ext):
        raise HTTPException(status_code=400, detail="File must be an image")
    max_edge = {
        "logo": MAX_EDGE_LOGO,
        "favicon": MAX_EDGE_FAVICON,
        "banner": MAX_EDGE_BANNER,
    }[asset_type]
    filename = await save_uploaded_image(
        file=file,
        output_dir="app/uploads",
        filename_prefix=f"appearance-{asset_type}",
        allowed_extensions=("png", "jpg", "jpeg", "webp", "svg", "gif", "ico"),
        default_extension="png",
        max_edge=max_edge,
        webp_quality=74 if asset_type == "banner" else 78,
    )
    return {"url": f"/uploads/{filename}"}
