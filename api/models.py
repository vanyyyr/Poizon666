from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(String, unique=True, index=True)
    fullname = Column(String)
    phone = Column(String, nullable=True)
    delivery_address = Column(String, nullable=True)
    nickname = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="New") # "New", "Awaiting Payment", "Purchased", etc.
    track_rf = Column(String, nullable=True)
    track_china = Column(String, nullable=True)
    weight = Column(Float, nullable=True)
    delivery_cost = Column(Float, nullable=True)
    total_price_rubles = Column(Float)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_link = Column(String)
    size = Column(String)
    price_yuan = Column(Float)
    image_url = Column(String, nullable=True)
    quantity = Column(Integer, default=1)
    comment = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    exchange_rate = Column(Float, default=13.5)
    commission = Column(Float, default=1500.0)
