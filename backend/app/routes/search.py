from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..database import get_db
from ..services import product_service

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("", response_model=List[schemas.Product])
def search_products(
    q: str,
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    products = product_service.search_products(db, q, limit=limit)
    
    result = []
    for product in products:
        product_dict = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "in_stock": product.in_stock,
            "image": product.image,
            "sizes": [{"id": s.id, "size": s.size, "price": s.price} for s in product.sizes] if product.sizes else None,
            "images": [img.image_url for img in product.images] if product.images else None
        }
        result.append(schemas.Product(**product_dict))
    
    return result
