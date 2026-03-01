import os
import logging
import httpx

logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8484976479:AAH-gB39CO4ABKxx0KUkFViNmCFZnox0GwA")
# Manager chat/group ID - set this to your manager group or personal chat ID
MANAGER_CHAT_ID = os.getenv("MANAGER_CHAT_ID", "")

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"


def send_telegram_message(chat_id: str, text: str, parse_mode: str = "HTML"):
    """Send a message via Telegram Bot API (synchronous for serverless)."""
    if not chat_id:
        logger.warning("No chat_id provided, skipping Telegram notification")
        return
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.post(f"{TELEGRAM_API}/sendMessage", json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": parse_mode,
            })
            if resp.status_code != 200:
                logger.error(f"Telegram API error: {resp.text}")
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {e}")


def notify_new_order(order_id: int, total_rubles: float, items: list, user_fullname: str, user_telegram_id: str):
    """Notify managers about a new order."""
    items_text = ""
    for item in items:
        items_text += f"\n  • <a href='{item.get('product_link', '#')}'>{item.get('size', '?')}</a> — {item.get('price_yuan', 0)}¥"

    text = (
        f"🛒 <b>Новый заказ #{order_id}</b>\n\n"
        f"👤 {user_fullname} (ID: {user_telegram_id})\n"
        f"💰 Итого: <b>{total_rubles:,.0f} ₽</b>\n"
        f"📦 Товары:{items_text}\n\n"
        f"Откройте панель для управления."
    )
    send_telegram_message(MANAGER_CHAT_ID, text)


def notify_status_change(user_telegram_id: str, order_id: int, new_status: str):
    """Notify the client about their order status change."""
    status_labels = {
        'New': '🆕 Новый',
        'Awaiting Payment': '💳 Ожидает оплаты',
        'Purchased': '✅ Выкуплен',
        'At China Warehouse': '🏭 На складе в Китае',
        'Sent to RF (Russia)': '✈️ Отправлен в Россию',
        'Received': '🎉 Получен',
    }
    label = status_labels.get(new_status, new_status)
    text = (
        f"📦 <b>Обновление заказа #{order_id}</b>\n\n"
        f"Статус: {label}\n\n"
        f"Спасибо, что пользуетесь Poizon666!"
    )
    send_telegram_message(user_telegram_id, text)
