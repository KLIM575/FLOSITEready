import uuid
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from .. import models, schemas


def list_zones(db: Session) -> List[dict]:
    zones = (
        db.query(models.DeliveryZone)
        .order_by(models.DeliveryZone.sort_order, models.DeliveryZone.name)
        .all()
    )
    return [
        {"id": z.id, "name": z.name, "price": z.price, "sort_order": z.sort_order}
        for z in zones
    ]


def get_zone(db: Session, zone_id: str) -> Optional[models.DeliveryZone]:
    return db.query(models.DeliveryZone).filter(models.DeliveryZone.id == zone_id).first()


def create_zone(db: Session, data: schemas.DeliveryZoneCreate) -> dict:
    zid = str(uuid.uuid4())
    sort_order = data.sort_order
    if sort_order is None:
        max_so = db.query(func.max(models.DeliveryZone.sort_order)).scalar()
        sort_order = (max_so or 0) + 1
    zone = models.DeliveryZone(
        id=zid,
        name=data.name.strip(),
        price=float(data.price),
        sort_order=sort_order,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return {"id": zone.id, "name": zone.name, "price": zone.price, "sort_order": zone.sort_order}


def update_zone(db: Session, zone_id: str, data: schemas.DeliveryZoneUpdate) -> Optional[dict]:
    zone = get_zone(db, zone_id)
    if not zone:
        return None
    if data.name is not None:
        zone.name = data.name.strip()
    if data.price is not None:
        zone.price = float(data.price)
    if data.sort_order is not None:
        zone.sort_order = data.sort_order
    db.commit()
    db.refresh(zone)
    return {"id": zone.id, "name": zone.name, "price": zone.price, "sort_order": zone.sort_order}


def delete_zone(db: Session, zone_id: str) -> bool:
    zone = get_zone(db, zone_id)
    if not zone:
        return False
    db.delete(zone)
    db.commit()
    return True


def zone_count(db: Session) -> int:
    return db.query(models.DeliveryZone).count()
