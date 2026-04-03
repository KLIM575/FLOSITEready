from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..database import get_db
from ..services import delivery_service

router = APIRouter(prefix="/api/delivery-zones", tags=["delivery-zones"])


@router.get("", response_model=List[schemas.DeliveryZone])
def list_delivery_zones(db: Session = Depends(get_db)):
    return delivery_service.list_zones(db)


@router.post("", response_model=schemas.DeliveryZone, status_code=201)
def create_delivery_zone(payload: schemas.DeliveryZoneCreate, db: Session = Depends(get_db)):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Название района не может быть пустым")
    return delivery_service.create_zone(db, payload)


@router.put("/{zone_id}", response_model=schemas.DeliveryZone)
def update_delivery_zone(
    zone_id: str,
    payload: schemas.DeliveryZoneUpdate,
    db: Session = Depends(get_db),
):
    if payload.name is not None and not payload.name.strip():
        raise HTTPException(status_code=400, detail="Название района не может быть пустым")
    updated = delivery_service.update_zone(db, zone_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Район не найден")
    return updated


@router.delete("/{zone_id}", status_code=204)
def delete_delivery_zone(zone_id: str, db: Session = Depends(get_db)):
    if not delivery_service.delete_zone(db, zone_id):
        raise HTTPException(status_code=404, detail="Район не найден")
