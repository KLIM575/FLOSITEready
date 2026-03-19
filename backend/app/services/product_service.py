from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
import uuid

def get_products(
    db: Session, 
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Product]:
    query = db.query(models.Product)
    
    if category:
        query = query.filter(models.Product.category == category)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Product.name.ilike(search_term)) | 
            (models.Product.description.ilike(search_term))
        )
    
    return query.offset(skip).limit(limit).all()

def get_product_by_id(db: Session, product_id: str) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(
        id=str(uuid.uuid4()),
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category,
        in_stock=product.in_stock,
        image=product.image
    )
    
    db.add(db_product)
    db.flush()
    
    if product.sizes:
        for size_data in product.sizes:
            db_size = models.ProductSize(
                product_id=db_product.id,
                size=size_data.size,
                price=size_data.price
            )
            db.add(db_size)
    
    if product.images:
        for image_url in product.images:
            db_image = models.ProductImage(
                product_id=db_product.id,
                image_url=image_url
            )
            db.add(db_image)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(
    db: Session, 
    product_id: str, 
    product_update: schemas.ProductUpdate
) -> Optional[models.Product]:
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    
    if 'sizes' in update_data:
        db.query(models.ProductSize).filter(
            models.ProductSize.product_id == product_id
        ).delete()
        
        for size_data in update_data['sizes']:
            db_size = models.ProductSize(
                product_id=product_id,
                size=size_data['size'],
                price=size_data['price']
            )
            db.add(db_size)
        del update_data['sizes']
    
    if 'images' in update_data:
        db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product_id
        ).delete()
        
        for image_url in update_data['images']:
            db_image = models.ProductImage(
                product_id=product_id,
                image_url=image_url
            )
            db.add(db_image)
        del update_data['images']
    
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: str) -> bool:
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return False
    
    db.delete(db_product)
    db.commit()
    return True

def search_products(db: Session, query: str) -> List[models.Product]:
    search_term = f"%{query}%"
    return db.query(models.Product).filter(
        (models.Product.name.ilike(search_term)) | 
        (models.Product.description.ilike(search_term)) |
        (models.Product.category.ilike(search_term))
    ).all()
