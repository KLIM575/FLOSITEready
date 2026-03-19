from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from .. import schemas
from ..database import get_db
from ..services import order_service
import json

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("", status_code=201, response_model=None)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        order_dict = order_service.create_order(db, order)
        return Response(
            content=json.dumps(order_dict),
            media_type="application/json",
            status_code=201
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=None)
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    orders = order_service.get_orders(db, skip, limit)
    return Response(
        content=json.dumps(orders),
        media_type="application/json"
    )

@router.get("/user/{user_id}", response_model=None)
def get_user_orders(user_id: str, db: Session = Depends(get_db)):
    orders = order_service.get_orders_by_user(db, user_id)
    return Response(
        content=json.dumps(orders),
        media_type="application/json"
    )

@router.get("/{order_id}", response_model=None)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = order_service.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Response(
        content=json.dumps(order),
        media_type="application/json"
    )

@router.patch("/{order_id}/status", response_model=None)
def update_order_status(
    order_id: str,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    order = order_service.update_order_status(db, order_id, status_update.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Response(
        content=json.dumps(order),
        media_type="application/json"
    )
