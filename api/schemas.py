from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime
from enum import Enum


class CommissionType(str, Enum):
    INSURANCE = "insurance"
    NO_INSURANCE = "no_insurance"
    WHOLESALE = "wholesale"


class OrderItemBase(BaseModel):
    product_link: str = Field(..., min_length=1, max_length=2048)
    size: str = Field(..., min_length=1, max_length=100)
    price_yuan: float = Field(..., gt=0)
    image_url: Optional[str] = None
    quantity: int = Field(default=1, ge=1)
    comment: Optional[str] = Field(default=None, max_length=500)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    total_price_rubles: float = Field(..., ge=0)


class OrderCreate(OrderBase):
    user_telegram_id: str = Field(..., min_length=1)
    fullname: str = Field(..., min_length=1, max_length=200)
    username: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    delivery_address: Optional[str] = Field(default=None, max_length=500)
    commission_type: Optional[CommissionType] = Field(default=CommissionType.INSURANCE)
    items: List[OrderItemCreate] = Field(..., min_length=1)


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
    track_rf: Optional[str] = Field(default=None, max_length=100)
    track_china: Optional[str] = Field(default=None, max_length=100)
    weight: Optional[float] = Field(default=None, ge=0)
    delivery_cost: Optional[float] = Field(default=None, ge=0)


class SettingsUpdate(BaseModel):
    exchange_rate: float = Field(..., gt=0)
    commission_percent: float = Field(..., ge=0, le=100)
    use_cbr_rate: bool = False


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)


class SettingsResponse(BaseModel):
    exchange_rate: float
    commission_percent: float
    use_cbr_rate: bool
    support_username: Optional[str] = None


class BroadcastMessage(BaseModel):
    chat_id: str
    message: str = Field(..., min_length=1, max_length=4096)


class BroadcastToAll(BaseModel):
    message: str = Field(..., min_length=1, max_length=4096)
    chat_ids: List[str] = []


class UploadResponse(BaseModel):
    url: str
    filename: str


class HealthResponse(BaseModel):
    status: str
    message: str


class StatsResponse(BaseModel):
    subscribers: int
    unique_users: int
