from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from api import models, schemas
from api.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Calculate price internally to prevent client spoofing
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(exchange_rate=13.5, commission=1500.0)
        
    # Get or create user
    user = db.query(models.User).filter(models.User.telegram_id == order.user_telegram_id).first()
    if not user:
        user = models.User(
            telegram_id=order.user_telegram_id,
            fullname=order.fullname,
            phone=order.phone,
            delivery_address=order.delivery_address
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update details if changed
        user.fullname = order.fullname
        user.phone = order.phone or user.phone
        user.delivery_address = order.delivery_address or user.delivery_address
        db.commit()

    # Calculate total elements
    total_rubles = 0
    for item in order.items:
        total_rubles += (item.price_yuan * item.quantity * settings.exchange_rate) + settings.commission

    # Create Order
    db_order = models.Order(
        user_id=user.id,
        total_price_rubles=total_rubles,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Create Items
    for item in order.items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_link=item.product_link,
            size=item.size,
            price_yuan=item.price_yuan,
            image_url=item.image_url,
            quantity=item.quantity,
            comment=item.comment
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    
    # TODO: Implement Aiogram bot notification to Manager Group here
    return db_order

@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(telegram_id: str = None, db: Session = Depends(get_db)):
    # Note: Protect this route in production. If telegram_id is provided, filter. If admin, return all.
    query = db.query(models.Order)
    if telegram_id:
        user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
        if not user:
            return []
        query = query.filter(models.Order.user_id == user.id)
        
    return query.order_by(models.Order.created_at.desc()).all()
