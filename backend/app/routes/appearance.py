import json
import shutil
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db

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
    filename = f"appearance-{asset_type}-{uuid.uuid4()}.{ext}"
    file_path = f"app/uploads/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/uploads/{filename}"}
