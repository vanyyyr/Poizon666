import os
import logging

logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8484976479:AAH-gB39CO4ABKxx0KUkFViNmCFZnox0GwA")
MANAGER_CHAT_ID = os.getenv("MANAGER_CHAT_ID", "709766413")

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"


def send_telegram_message(chat_id: str, text: str, parse_mode: str = "HTML"):
    """Send a message via Telegram Bot API using urllib."""
    if not chat_id:
        logger.warning("No chat_id provided, skipping Telegram notification")
        return
    try:
        import urllib.request
        import json
        data = json.dumps({
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
        }).encode("utf-8")
        req = urllib.request.Request(
            f"{TELEGRAM_API}/sendMessage",
            data=data,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status != 200:
                logger.error(f"Telegram API error: {resp.read()}")
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {e}")


def notify_new_order(order_id: int, total_rubles: float, items: list, user_fullname: str, user_telegram_id: str):
    """Notify managers about a new order."""
    items_text = ""
    for item in items:
        items_text += f"\n  • {item.get('size', '?')} — {item.get('price_yuan', 0)}¥"

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
