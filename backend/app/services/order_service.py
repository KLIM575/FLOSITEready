from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from .. import models, schemas
import uuid
from datetime import datetime

def create_order(db: Session, order: schemas.OrderCreate) -> dict:
    total_amount = 0.0
    
    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()
        
        if not product:
            raise ValueError(f"Product {item.product_id} not found")
        
        price = product.price
        if item.size and product.sizes:
            size_price = next(
                (s.price for s in product.sizes if s.size == item.size),
                None
            )
            if size_price:
                price = size_price
        
        total_amount += price * item.quantity
    
    order_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    db.execute(
        text("INSERT INTO orders (id, user_id, total_amount, status, created_at, updated_at) VALUES (:id, :user_id, :total_amount, :status, :created_at, :updated_at)"),
        {
            "id": order_id,
            "user_id": order.user_id,
            "total_amount": total_amount,
            "status": "PENDING",
            "created_at": now,
            "updated_at": now
        }
    )
    
    items_data = []
    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()
        
        price = product.price
        if item.size and product.sizes:
            size_price = next(
                (s.price for s in product.sizes if s.size == item.size),
                None
            )
            if size_price:
                price = size_price
        
        result = db.execute(
            text("INSERT INTO order_items (order_id, product_id, quantity, size, price) VALUES (:order_id, :product_id, :quantity, :size, :price) RETURNING id"),
            {
                "order_id": order_id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "size": item.size.value if item.size else None,
                "price": price
            }
        )
        item_id = result.fetchone()[0]
        
        items_data.append({
            "id": item_id,
            "order_id": order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "size": item.size.value if item.size else None,
            "price": price
        })
    
    result = db.execute(
        text("INSERT INTO shipping_addresses (order_id, name, phone, email, city, postal_code, address, comment) VALUES (:order_id, :name, :phone, :email, :city, :postal_code, :address, :comment) RETURNING id"),
        {
            "order_id": order_id,
            "name": order.shipping_address.name,
            "phone": order.shipping_address.phone,
            "email": order.shipping_address.email,
            "city": order.shipping_address.city,
            "postal_code": order.shipping_address.postal_code,
            "address": order.shipping_address.address,
            "comment": order.shipping_address.comment
        }
    )
    shipping_id = result.fetchone()[0]
    
    db.commit()
    
    return {
        "id": order_id,
        "user_id": order.user_id,
        "total_amount": total_amount,
        "status": "PENDING",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "items": items_data,
        "shipping_address": {
            "id": shipping_id,
            "order_id": order_id,
            "name": order.shipping_address.name,
            "phone": order.shipping_address.phone,
            "email": order.shipping_address.email,
            "city": order.shipping_address.city,
            "postal_code": order.shipping_address.postal_code,
            "address": order.shipping_address.address,
            "comment": order.shipping_address.comment
        }
    }

def _serialize_order_dict(db: Session, db_order: models.Order) -> dict:
    items = db.query(models.OrderItem).filter(
        models.OrderItem.order_id == db_order.id
    ).all()
    
    shipping = db.query(models.ShippingAddress).filter(
        models.ShippingAddress.order_id == db_order.id
    ).first()
    
    serialized_items = []
    for item in items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()
        serialized_items.append({
            "id": item.id,
            "order_id": item.order_id,
            "product_id": item.product_id,
            "product_name": product.name if product else item.product_id,
            "product_image": product.image if product else None,
            "quantity": item.quantity,
            "size": item.size.value if item.size else None,
            "price": item.price
        })
    
    return {
        "id": db_order.id,
        "user_id": db_order.user_id,
        "total_amount": db_order.total_amount,
        "status": db_order.status.value,
        "created_at": db_order.created_at.isoformat(),
        "updated_at": db_order.updated_at.isoformat(),
        "items": serialized_items,
        "shipping_address": {
            "id": shipping.id,
            "order_id": shipping.order_id,
            "name": shipping.name,
            "phone": shipping.phone,
            "email": shipping.email,
            "city": shipping.city,
            "postal_code": shipping.postal_code,
            "address": shipping.address,
            "comment": shipping.comment
        } if shipping else None
    }

def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return [_serialize_order_dict(db, order) for order in orders]

def get_orders_by_user(db: Session, user_id: str) -> List[dict]:
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).all()
    return [_serialize_order_dict(db, order) for order in orders]

def get_order_by_id(db: Session, order_id: str) -> Optional[dict]:
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        return None
    return _serialize_order_dict(db, order)

def update_order_status(
    db: Session, 
    order_id: str, 
    status
) -> Optional[dict]:
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        return None
    
    status_value = status.value if hasattr(status, 'value') else str(status)
    status_upper = status_value.upper()
    db.execute(
        text("UPDATE orders SET status = :status, updated_at = :updated_at WHERE id = :id"),
        {"status": status_upper, "updated_at": datetime.utcnow(), "id": order_id}
    )
    db.commit()
    db.refresh(db_order)
    return _serialize_order_dict(db, db_order)
