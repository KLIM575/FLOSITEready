import json
from fastapi import APIRouter, Depends
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
