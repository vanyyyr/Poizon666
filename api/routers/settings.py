from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.database import get_db
from api import models, schemas
import logging
import urllib.request
import json

router = APIRouter()
logger = logging.getLogger(__name__)

CBR_API_URL = "https://www.cbr-xml-daily.ru/daily_json.js"

def fetch_cbr_rate() -> float:
    """Fetch current CNY/RUB rate from Central Bank of Russia."""
    try:
        req = urllib.request.Request(CBR_API_URL)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            cny = data["Valute"]["CNY"]
            # CBR gives rate per Nominal units
            rate = cny["Value"] / cny["Nominal"]
            return round(rate, 4)
    except Exception as e:
        logger.error(f"Failed to fetch CBR rate: {e}")
        return 0

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(exchange_rate=13.5, commission_percent=10.0, use_cbr_rate=False)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    result = {
        "exchange_rate": settings.exchange_rate,
        "commission_percent": settings.commission_percent,
        "use_cbr_rate": settings.use_cbr_rate,
    }

    # If using CBR rate, fetch and return it
    if settings.use_cbr_rate:
        cbr_rate = fetch_cbr_rate()
        if cbr_rate > 0:
            result["exchange_rate"] = cbr_rate
            # Also update in DB
            settings.exchange_rate = cbr_rate
            db.commit()

    return result

@router.put("")
def update_settings(settings_update: schemas.SettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings()
        db.add(settings)

    settings.exchange_rate = settings_update.exchange_rate
    settings.commission_percent = settings_update.commission_percent
    settings.use_cbr_rate = settings_update.use_cbr_rate

    db.commit()
    db.refresh(settings)
    return {
        "exchange_rate": settings.exchange_rate,
        "commission_percent": settings.commission_percent,
        "use_cbr_rate": settings.use_cbr_rate,
    }
