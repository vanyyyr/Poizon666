from fastapi import APIRouter
from pydantic import BaseModel
from api.notifier import send_telegram_message
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class BroadcastMessage(BaseModel):
    chat_id: str
    message: str


class BroadcastToAll(BaseModel):
    message: str
    chat_ids: list[str] = []


@router.post("")
def send_broadcast(data: BroadcastToAll):
    """Send a broadcast message to multiple users."""
    sent = 0
    failed = 0
    for chat_id in data.chat_ids:
        try:
            send_telegram_message(chat_id, data.message)
            sent += 1
        except Exception as e:
            logger.error(f"Failed to send to {chat_id}: {e}")
            failed += 1
    
    return {"sent": sent, "failed": failed, "total": len(data.chat_ids)}
