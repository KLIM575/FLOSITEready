from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas, models
from ..database import get_db
from ..services import product_service
from ..services.image_service import (
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_EDGE_PRODUCT,
    save_uploaded_image,
)

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=List[schemas.Product])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    products = product_service.get_products(db, category, search, skip, limit)
    
    result = []
    for product in products:
        product_dict = {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
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

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = product_service.get_product_by_slug_or_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_dict = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "in_stock": product.in_stock,
        "image": product.image,
        "sizes": [{"id": s.id, "size": s.size, "price": s.price} for s in product.sizes] if product.sizes else None,
        "images": [img.image_url for img in product.images] if product.images else None
    }
    
    return schemas.Product(**product_dict)

@router.post("", response_model=schemas.Product, status_code=201)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    db_product = product_service.create_product(db, product)
    
    product_dict = {
        "id": db_product.id,
        "name": db_product.name,
        "slug": db_product.slug,
        "description": db_product.description,
        "price": db_product.price,
        "category": db_product.category,
        "in_stock": db_product.in_stock,
        "image": db_product.image,
        "sizes": [{"id": s.id, "size": s.size, "price": s.price} for s in db_product.sizes] if db_product.sizes else None,
        "images": [img.image_url for img in db_product.images] if db_product.images else None
    }
    
    return schemas.Product(**product_dict)

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: str,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db)
):
    db_product = product_service.update_product(db, product_id, product)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_dict = {
        "id": db_product.id,
        "name": db_product.name,
        "slug": db_product.slug,
        "description": db_product.description,
        "price": db_product.price,
        "category": db_product.category,
        "in_stock": db_product.in_stock,
        "image": db_product.image,
        "sizes": [{"id": s.id, "size": s.size, "price": s.price} for s in db_product.sizes] if db_product.sizes else None,
        "images": [img.image_url for img in db_product.images] if db_product.images else None
    }
    
    return schemas.Product(**product_dict)

@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    success = product_service.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None

@router.post("/{product_id}/images")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    product = product_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    filename = await save_uploaded_image(
        file=file,
        output_dir="app/uploads",
        allowed_extensions=ALLOWED_IMAGE_EXTENSIONS,
        default_extension="jpg",
        max_edge=MAX_EDGE_PRODUCT,
        webp_quality=76,
    )
    image_url = f"/uploads/{filename}"
    
    db_image = models.ProductImage(
        product_id=product_id,
        image_url=image_url
    )
    db.add(db_image)
    db.commit()
    
    return {"filename": filename, "url": image_url}
