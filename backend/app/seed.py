from .database import SessionLocal, init_db
from .models import User, Product, ProductSize, ProductImage, ProductSizeEnum, UserRole
from .services.auth_service import get_password_hash
import uuid

def seed_database():
    init_db()
    
    db = SessionLocal()
    
    try:
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print("Database already seeded. Skipping...")
            from .seed_demo_stats import seed_demo_statistics

            seed_demo_statistics()
            return
        
        print("Creating admin user...")
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@flowershop.com",
            name="Admin",
            phone="+7 (999) 123-45-67",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        db.add(admin)
        
        print("Creating test user...")
        test_user = User(
            id=str(uuid.uuid4()),
            email="user@test.com",
            name="Test User",
            phone="+7 (999) 999-99-99",
            password_hash=get_password_hash("user123"),
            role=UserRole.USER
        )
        db.add(test_user)
        
        print("Creating products...")
        
        products_data = [
            {
                "id": "1",
                "name": "Букет роз \"Романтика\"",
                "description": "Роскошный букет из свежих красных роз премиум-класса. Идеально подходит для романтических свиданий, признаний в любви и особых случаев. Розы выращены в Эквадоре, отличаются крупными бутонами и длительным сроком жизни.",
                "price": 3500,
                "category": "Розы",
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=800&fit=crop",
                "sizes": [
                    {"size": ProductSizeEnum.S, "price": 2500},
                    {"size": ProductSizeEnum.M, "price": 3500},
                    {"size": ProductSizeEnum.L, "price": 4500},
                    {"size": ProductSizeEnum.XL, "price": 6500}
                ],
                "images": [
                    "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop"
                ]
            },
            {
                "id": "2",
                "name": "Композиция \"Весна\"",
                "description": "Нежная весенняя композиция из тюльпанов, нарциссов и гиацинтов. Яркие краски и свежий аромат весны в одном букете. Идеальный подарок для создания весеннего настроения.",
                "price": 2800,
                "category": "Композиции",
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop",
                "sizes": [
                    {"size": ProductSizeEnum.S, "price": 2000},
                    {"size": ProductSizeEnum.M, "price": 2800},
                    {"size": ProductSizeEnum.L, "price": 3800},
                    {"size": ProductSizeEnum.XL, "price": 5200}
                ],
                "images": [
                    "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop"
                ]
            },
            {
                "id": "3",
                "name": "Букет тюльпанов \"Нежность\"",
                "description": "Элегантный букет из голландских тюльпанов пастельных оттенков. Символ весны, обновления и нежных чувств. Тюльпаны доставляются свежими, с гарантией качества.",
                "price": 2200,
                "category": "Тюльпаны",
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&h=800&fit=crop",
                "sizes": [
                    {"size": ProductSizeEnum.S, "price": 1500},
                    {"size": ProductSizeEnum.M, "price": 2200},
                    {"size": ProductSizeEnum.L, "price": 3200},
                    {"size": ProductSizeEnum.XL, "price": 4500}
                ],
                "images": [
                    "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=800&h=800&fit=crop"
                ]
            },
            {
                "id": "4",
                "name": "Орхидея в горшке",
                "description": "Изысканная орхидея фаленопсис в керамическом горшке. Долговечное растение, которое будет радовать своим цветением несколько месяцев. Включает инструкцию по уходу.",
                "price": 5500,
                "category": "Орхидеи",
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1615715616181-6b41c74ebc5d?w=800&h=800&fit=crop",
                "sizes": [],
                "images": [
                    "https://images.unsplash.com/photo-1615715616181-6b41c74ebc5d?w=800&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1550735424-d2d34d119598?w=800&h=800&fit=crop"
                ]
            },
            {
                "id": "5",
                "name": "Букет пионов \"Роскошь\"",
                "description": "Роскошный букет из ароматных пионов. Эти великолепные цветы с пышными бутонами создают атмосферу праздника и изобилия. Доступны в сезон с мая по июль.",
                "price": 4200,
                "category": "Пионы",
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&h=800&fit=crop",
                "sizes": [
                    {"size": ProductSizeEnum.S, "price": 3000},
                    {"size": ProductSizeEnum.M, "price": 4200},
                    {"size": ProductSizeEnum.L, "price": 5500},
                    {"size": ProductSizeEnum.XL, "price": 7500}
                ],
                "images": [
                    "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&h=800&fit=crop"
                ]
            },
            {
                "id": "6",
                "name": "Подарочный набор \"Премиум\"",
                "description": "Эксклюзивный подарочный набор включает букет из роз и пионов, бельгийский шоколад и открытку с персональным поздравлением. Упакован в дизайнерскую коробку.",
                "price": 8900,
                "category": "Подарочные наборы",
                "in_stock": True,
                "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
                "sizes": [
                    {"size": ProductSizeEnum.M, "price": 8900},
                    {"size": ProductSizeEnum.L, "price": 12500}
                ],
                "images": [
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=800&fit=crop"
                ]
            }
        ]
        
        for product_data in products_data:
            sizes_data = product_data.pop("sizes")
            images_data = product_data.pop("images")
            
            product = Product(**product_data)
            db.add(product)
            db.flush()
            
            for size_data in sizes_data:
                size = ProductSize(
                    product_id=product.id,
                    size=size_data["size"],
                    price=size_data["price"]
                )
                db.add(size)
            
            for image_url in images_data:
                image = ProductImage(
                    product_id=product.id,
                    image_url=image_url
                )
                db.add(image)
        
        db.commit()
        print(f"Successfully seeded {len(products_data)} products!")
        print(f"Admin user: admin@flowershop.com / admin123")
        print(f"Test user: user@test.com / user123")

        from .seed_demo_stats import seed_demo_statistics

        seed_demo_statistics()

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
