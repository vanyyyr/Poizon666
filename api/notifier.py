import os
import logging

logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8484976479:AAH-gB39CO4ABKxx0KUkFViNmCFZnox0GwA")
MANAGER_CHAT_ID = os.getenv("MANAGER_CHAT_ID", "709766413")

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

COMMISSION_LABELS = {
    "insurance": "🛡️ Со страховкой (10%)",
    "no_insurance": "⚡ Без страховки (7%)",
    "wholesale": "📦 Опт (5%)",
}


def send_telegram_message(chat_id: str, text: str, parse_mode: str = "HTML"):
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


def notify_new_order(
    order_id: int,
    total_rubles: float,
    items: list,
    user_fullname: str,
    user_telegram_id: str,
    username: str = None,
    commission_type: str = "insurance",
    phone: str = None,
    delivery_address: str = None,
):
    """Notify managers about a new order with clickable username and full info."""
    items_text = ""
    for i, item in enumerate(items, 1):
        items_text += f"\n  {i}. Размер: {item.get('size', '?')} — {item.get('price_yuan', 0)}¥"
        link = item.get('product_link', '')
        if link:
            items_text += f"\n     🔗 {link}"
        comment = item.get('comment', '')
        if comment:
            items_text += f"\n     💬 {comment}"

    # Build clickable user link
    if username:
        user_link = f'<a href="https://t.me/{username}">@{username}</a>'
    else:
        user_link = f'<a href="tg://user?id={user_telegram_id}">{user_fullname}</a>'

    commission_label = COMMISSION_LABELS.get(commission_type, commission_type)

    delivery_line = ""
    if delivery_address:
        delivery_line = f"\n📍 Доставка: {delivery_address}"

    phone_line = ""
    if phone:
        phone_line = f"\n📞 Телефон: {phone}"

    text = (
        f"🛒 <b>Новый заказ #{order_id}</b>\n\n"
        f"👤 {user_fullname}\n"
        f"💬 Написать: {user_link}"
        f"{phone_line}"
        f"{delivery_line}\n\n"
        f"💰 Итого: <b>{total_rubles:,.0f} ₽</b>\n"
        f"📊 Тариф: {commission_label}\n\n"
        f"📦 Товары ({len(items)} шт.):{items_text}"
    )
    send_telegram_message(MANAGER_CHAT_ID, text)


def notify_status_change(user_telegram_id: str, order_id: int, new_status: str):
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
