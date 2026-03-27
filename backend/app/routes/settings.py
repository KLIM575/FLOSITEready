import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])

SETTINGS_ROW_ID = 1

def _get_or_create_row(db: Session) -> models.SiteSettings:
    row = db.query(models.SiteSettings).filter(models.SiteSettings.id == SETTINGS_ROW_ID).first()
    if not row:
        row = models.SiteSettings(id=SETTINGS_ROW_ID, data=json.dumps({}))
        db.add(row)
        db.commit()
        db.refresh(row)
    return row

@router.get("", response_model=schemas.SiteSettingsData)
def get_settings(db: Session = Depends(get_db)):
    row = _get_or_create_row(db)
    raw = json.loads(row.data) if row.data else {}
    return schemas.SiteSettingsData(**raw)

@router.put("", response_model=schemas.SiteSettingsData)
def update_settings(payload: schemas.SiteSettingsData, db: Session = Depends(get_db)):
    row = _get_or_create_row(db)
    row.data = json.dumps(payload.dict())
    db.commit()
    db.refresh(row)
    return payload
