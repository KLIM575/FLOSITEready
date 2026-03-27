from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class ProductSizeEnum(str, enum.Enum):
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    
    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False, index=True)
    in_stock = Column(Boolean, default=True, nullable=False)
    image = Column(String, nullable=False)
    
    sizes = relationship("ProductSize", back_populates="product", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

class ProductSize(Base):
    __tablename__ = "product_sizes"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    size = Column(Enum(ProductSizeEnum), nullable=False)
    price = Column(Float, nullable=False)
    
    product = relationship("Product", back_populates="sizes")

class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    
    product = relationship("Product", back_populates="images")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    shipping_address = relationship("ShippingAddress", back_populates="order", uselist=False, cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    size = Column(Enum(ProductSizeEnum), nullable=True)
    price = Column(Float, nullable=False)
    
    order = relationship("Order", back_populates="items")

class ShippingAddress(Base):
    __tablename__ = "shipping_addresses"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    city = Column(String, nullable=False)
    postal_code = Column(String, nullable=True)
    address = Column(String, nullable=False)
    comment = Column(String, nullable=True)
    
    order = relationship("Order", back_populates="shipping_address")

class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, default=1)
    data = Column(Text, nullable=False, default='{}')
