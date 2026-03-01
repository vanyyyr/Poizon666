from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    product_link: str
    size: str
    price_yuan: float
    image_url: Optional[str] = None
    quantity: int = 1
    comment: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_price_rubles: float

class OrderCreate(OrderBase):
    user_telegram_id: str
    fullname: str
    username: Optional[str] = None
    phone: Optional[str] = None
    delivery_address: Optional[str] = None
    commission_type: Optional[str] = "insurance"  # insurance | no_insurance | wholesale
    items: List[OrderItemCreate]

class OrderResponse(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    status: str
    track_rf: Optional[str]
    track_china: Optional[str]
    weight: Optional[float]
    delivery_cost: Optional[float]
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    track_rf: Optional[str] = None
    track_china: Optional[str] = None
    weight: Optional[float] = None
    delivery_cost: Optional[float] = None

class SettingsUpdate(BaseModel):
    exchange_rate: float
    commission_percent: float
    use_cbr_rate: bool = False

class OrderStatusUpdate(BaseModel):
    status: str
