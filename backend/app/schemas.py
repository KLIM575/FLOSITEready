from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ProductSizeEnum(str, Enum):
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class ProductSizePrice(BaseModel):
    size: ProductSizeEnum
    price: float

class ProductSizePriceResponse(ProductSizePrice):
    id: int
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    in_stock: bool = True
    image: str
    slug: Optional[str] = None

class ProductCreate(ProductBase):
    sizes: Optional[List[ProductSizePrice]] = None
    images: Optional[List[str]] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    in_stock: Optional[bool] = None
    image: Optional[str] = None
    sizes: Optional[List[ProductSizePrice]] = None
    images: Optional[List[str]] = None

class Product(ProductBase):
    id: str
    sizes: Optional[List[ProductSizePriceResponse]] = None
    images: Optional[List[str]] = None
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    role: UserRole
    
    class Config:
        from_attributes = True

class ShippingAddressBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    city: str
    postal_code: Optional[str] = None
    address: str
    comment: Optional[str] = None
    delivery_zone_name: Optional[str] = None

class ShippingAddress(ShippingAddressBase):
    id: int
    order_id: str
    
    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: str
    quantity: int
    size: Optional[ProductSizeEnum] = None
    price: float

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int
    size: Optional[ProductSizeEnum] = None

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: str
    
    class Config:
        from_attributes = True

class OrderItem(OrderItemBase):
    id: int
    order_id: str
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: ShippingAddressBase

class OrderCreate(OrderBase):
    user_id: Optional[str] = None
    delivery_zone_id: Optional[str] = None


class DeliveryZoneBase(BaseModel):
    name: str
    price: float = Field(ge=0)


class DeliveryZoneCreate(DeliveryZoneBase):
    sort_order: Optional[int] = None


class DeliveryZoneUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    sort_order: Optional[int] = None


class DeliveryZone(DeliveryZoneBase):
    id: str
    sort_order: int

    class Config:
        from_attributes = True

class Order(BaseModel):
    id: str
    user_id: Optional[str] = None
    total_amount: float
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
    shipping_address: Optional[ShippingAddress] = None
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class SiteSettingsData(BaseModel):
    shopName: str = ""
    shopTagline: str = ""
    contactPhone: str = ""
    contactEmail: str = ""
    contactAddress: str = ""
    socialInstagram: str = ""
    socialVk: str = ""
    socialTelegram: str = ""
    bannerTitle: str = ""
    bannerSubtitle: str = ""
    bannerEnabled: bool = True
    deliveryInfo: str = ""
    paymentInfo: str = ""
    freeDeliveryFrom: str = ""
    seoTitle: str = ""
    seoDescription: str = ""
    seoKeywords: str = ""


class AppearanceSettingsData(BaseModel):
    colorTheme: str = "rose"
    fontPair: str = "default"
    logoUrl: str = ""
    faviconUrl: str = ""
    bannerBgImage: str = ""
    bannerBgColor: str = ""
    bannerButtonText: str = ""
    bannerButtonLink: str = ""
    darkModeEnabled: bool = False
    catalogColumns: str = "3"
    productCardStyle: str = "default"
    footerCopyright: str = ""


class PageViewCreate(BaseModel):
    path: str = Field(..., min_length=1, max_length=500)


class SalesDayRow(BaseModel):
    date: str
    order_count: int
    revenue: float


class OrderStatusCount(BaseModel):
    status: str
    count: int


class SalesStatsResponse(BaseModel):
    period_days: int
    total_orders: int
    revenue_total: float
    by_day: List[SalesDayRow]
    by_status: List[OrderStatusCount]


class VisitsDayRow(BaseModel):
    date: str
    views: int


class PathCount(BaseModel):
    path: str
    count: int


class VisitsStatsResponse(BaseModel):
    period_days: int
    total_views: int
    by_day: List[VisitsDayRow]
    top_paths: List[PathCount]
