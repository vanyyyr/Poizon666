from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=schemas.SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        # Create default
        settings = models.Settings(exchange_rate=13.5, commission=1500.0)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/", response_model=schemas.SettingsResponse)
def update_settings(settings_update: schemas.SettingsUpdate, db: Session = Depends(get_db)):
    # Note: In a real app, protect this route with authentication/authorization
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings()
        db.add(settings)
        
    settings.exchange_rate = settings_update.exchange_rate
    settings.commission = settings_update.commission
    
    db.commit()
    db.refresh(settings)
    return settings
