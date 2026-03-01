from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from api import models, schemas
from api.database import get_db
from api.notifier import notify_new_order, notify_status_change
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

COMMISSION_RATES = {
    "insurance": 10,
    "no_insurance": 7,
    "wholesale": 5,
}

@router.post("", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(exchange_rate=13.5, commission_percent=10.0, use_cbr_rate=False)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    # Get or create user
    user = db.query(models.User).filter(models.User.telegram_id == order.user_telegram_id).first()
    if not user:
        user = models.User(
            telegram_id=order.user_telegram_id,
            fullname=order.fullname,
            phone=order.phone,
            delivery_address=order.delivery_address,
            nickname=order.username,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.fullname = order.fullname
        user.phone = order.phone or user.phone
        user.delivery_address = order.delivery_address or user.delivery_address
        user.nickname = order.username or user.nickname
        db.commit()

    # Calculate total using commission type
    rate = settings.exchange_rate
    commission_pct = COMMISSION_RATES.get(order.commission_type or "insurance", 10)
    total_rubles = 0
    for item in order.items:
        item_rubles = item.price_yuan * item.quantity * rate
        commission_amount = item_rubles * (commission_pct / 100)
        total_rubles += item_rubles + commission_amount

    total_rubles = round(total_rubles)

    # Create Order
    db_order = models.Order(
        user_id=user.id,
        total_price_rubles=total_rubles,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Create Items
    items_data = []
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
        items_data.append({
            "product_link": item.product_link,
            "size": item.size,
            "price_yuan": item.price_yuan,
            "comment": item.comment,
        })

    db.commit()
    db.refresh(db_order)

    # Send Telegram notification
    try:
        notify_new_order(
            order_id=db_order.id,
            total_rubles=total_rubles,
            items=items_data,
            user_fullname=order.fullname,
            user_telegram_id=order.user_telegram_id,
            username=order.username,
            commission_type=order.commission_type or "insurance",
            phone=order.phone,
            delivery_address=order.delivery_address,
        )
    except Exception as e:
        logger.error(f"Notification failed: {e}")

    return db_order

@router.get("", response_model=List[schemas.OrderResponse])
def get_orders(telegram_id: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Order)
    if telegram_id:
        user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
        if not user:
            return []
        query = query.filter(models.Order.user_id == user.id)

    return query.order_by(models.Order.created_at.desc()).all()

@router.patch("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, status_update: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    valid_statuses = ['New', 'Awaiting Payment', 'Purchased', 'At China Warehouse', 'Sent to RF (Russia)', 'Received']
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_update.status
    db.commit()
    db.refresh(order)

    try:
        user = db.query(models.User).filter(models.User.id == order.user_id).first()
        if user and user.telegram_id:
            notify_status_change(user.telegram_id, order.id, status_update.status)
    except Exception as e:
        logger.error(f"Status notification failed: {e}")

    return order

@router.patch("/{order_id}", response_model=schemas.OrderResponse)
def update_order(order_id: int, update: schemas.OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if update.track_rf is not None:
        order.track_rf = update.track_rf
    if update.track_china is not None:
        order.track_china = update.track_china
    if update.weight is not None:
        order.weight = update.weight
    if update.delivery_cost is not None:
        order.delivery_cost = update.delivery_cost

    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"ok": True, "deleted": order_id}
