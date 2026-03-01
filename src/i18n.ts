export type Lang = 'ru' | 'en' | 'zh'

const translations: Record<string, Record<Lang, string>> = {
    // Layout / Nav
    'nav.home': { ru: 'Главная', en: 'Home', zh: '首页' },
    'nav.orders': { ru: 'Заказы', en: 'Orders', zh: '订单' },
    'nav.profile': { ru: 'Профиль', en: 'Profile', zh: '个人资料' },

    // Home
    'calc.title': { ru: 'Калькулятор', en: 'Calculator', zh: '计算器' },
    'calc.rate': { ru: 'Курс', en: 'Rate', zh: '汇率' },
    'calc.commission': { ru: 'Выберите комиссию', en: 'Select commission', zh: '选择佣金' },
    'calc.insurance': { ru: 'Со страховкой', en: 'With insurance', zh: '含保险' },
    'calc.no_insurance': { ru: 'Без страховки', en: 'No insurance', zh: '不含保险' },
    'calc.wholesale': { ru: 'Опт (от 8000¥)', en: 'Wholesale (8000¥+)', zh: '批发 (8000¥+)' },
    'calc.insurance_desc': { ru: '🛡️ Если в процессе доставки появится потерь — вернём всю сумму', en: '🛡️ Full refund if lost during delivery', zh: '🛡️ 运输过程中如有损失，全额退款' },
    'calc.no_insurance_desc': { ru: '⚡ Выгоднее, но без компенсации при потере', en: '⚡ Cheaper, no compensation for loss', zh: '⚡ 更便宜，但无损失赔偿' },
    'calc.wholesale_desc': { ru: '📦 Для заказов от 8000¥ (единица или общая сумма)', en: '📦 For orders from 8000¥ total', zh: '📦 订单总额8000¥起' },
    'calc.total': { ru: 'Итого', en: 'Total', zh: '合计' },
    'calc.without_delivery': { ru: 'Стоимость без доставки', en: 'Price without delivery', zh: '不含运费价格' },

    // Order form
    'order.title': { ru: 'Заказ', en: 'Order', zh: '订单' },
    'order.item': { ru: 'Товар', en: 'Item', zh: '商品' },
    'order.items_one': { ru: 'товар', en: 'item', zh: '件商品' },
    'order.items_few': { ru: 'товара', en: 'items', zh: '件商品' },
    'order.items_many': { ru: 'товаров', en: 'items', zh: '件商品' },
    'order.price_yuan': { ru: 'Цена (¥)', en: 'Price (¥)', zh: '价格 (¥)' },
    'order.link': { ru: 'Ссылка на товар', en: 'Product link', zh: '商品链接' },
    'order.link_placeholder': { ru: 'Вставьте ссылку с Poizon / 1688 / Taobao (любой формат)', en: 'Paste link from Poizon / 1688 / Taobao', zh: '粘贴Poizon / 1688 / 淘宝链接' },
    'order.size': { ru: 'Размер / Цвет', en: 'Size / Color', zh: '尺码 / 颜色' },
    'order.size_placeholder': { ru: '42 EU, бело-серо-розовые', en: '42 EU, white-grey-pink', zh: '42 EU，白灰粉' },
    'order.comment': { ru: 'Комментарий', en: 'Comment', zh: '备注' },
    'order.comment_placeholder': { ru: 'Особые пожелания', en: 'Special requests', zh: '特殊要求' },
    'order.add_item': { ru: 'Добавить ещё товар', en: 'Add another item', zh: '添加更多商品' },
    'order.submit': { ru: 'Отправить заявку', en: 'Submit order', zh: '提交订单' },
    'order.submitting': { ru: 'Отправка...', en: 'Submitting...', zh: '提交中...' },
    'order.success': { ru: 'Заявка отправлена!', en: 'Order submitted!', zh: '订单已提交！' },
    'order.error': { ru: 'Ошибка при отправке заявки', en: 'Error submitting order', zh: '提交订单出错' },
    'order.add_item_error': { ru: 'Добавьте хотя бы один товар', en: 'Add at least one item', zh: '请至少添加一件商品' },
    'order.image': { ru: 'Фото товара', en: 'Product photo', zh: '商品图片' },
    'order.image_placeholder': { ru: 'Нажмите, чтобы сделать или выбрать фото', en: 'Tap to take or choose photo', zh: '点击拍照或选择图片' },
    'order.image_error': { ru: 'Ошибка загрузки фото', en: 'Photo upload error', zh: '图片上传错误' },

    // Delivery
    'delivery.title': { ru: 'Доставка', en: 'Delivery', zh: '配送' },
    'delivery.address': { ru: 'Свой адрес из Профиля', en: 'Address from Profile', zh: '个人资料中的地址' },
    'delivery.pickup': { ru: 'Самовывоз', en: 'Pickup', zh: '自提' },
    'delivery.pickup_msk': { ru: 'Самовывоз МСК', en: 'Pickup Moscow', zh: '莫斯科自提' },
    'delivery.pickup_spb': { ru: 'Самовывоз СПБ', en: 'Pickup SPb', zh: '圣彼得堡自提' },
    'delivery.or_address': { ru: 'Или введите адрес:', en: 'Or enter address:', zh: '或输入地址：' },
    'delivery.address_placeholder': { ru: 'г. Москва, ул. Пушкина, ПВЗ СДЭК', en: 'City, Street, Pickup Point', zh: '城市，街道，取货点' },

    // Support
    'support.title': { ru: 'Поддержка', en: 'Support', zh: '客服' },

    // Profile
    'profile.delivery_info': { ru: 'Данные для доставки', en: 'Delivery Info', zh: '配送信息' },
    'profile.fullname': { ru: 'ФИО (Полностью)', en: 'Full Name', zh: '全名' },
    'profile.fullname_placeholder': { ru: 'Иванов Иван Иванович', en: 'Full Name', zh: '全名' },
    'profile.phone': { ru: 'Телефон', en: 'Phone', zh: '电话' },
    'profile.address': { ru: 'Адрес (ПВЗ СДЭК или Почта)', en: 'Address (Pickup Point)', zh: '地址（取货点）' },
    'profile.save': { ru: 'Сохранить профиль', en: 'Save Profile', zh: '保存资料' },
    'profile.saved': { ru: 'Сохранено', en: 'Saved', zh: '已保存' },
    'profile.save_success': { ru: 'Профиль сохранён!', en: 'Profile saved!', zh: '资料已保存！' },
    'profile.theme': { ru: 'Тема', en: 'Theme', zh: '主题' },
    'profile.theme_light': { ru: 'Светлая', en: 'Light', zh: '浅色' },
    'profile.theme_dark': { ru: 'Тёмная', en: 'Dark', zh: '深色' },
    'profile.theme_auto': { ru: 'Авто', en: 'Auto', zh: '自动' },
    'profile.language': { ru: 'Язык', en: 'Language', zh: '语言' },
    'profile.admin_title': { ru: 'Доступ Менеджера', en: 'Manager Access', zh: '管理员权限' },
    'profile.admin_desc': { ru: 'Управление курсом, заказами и рассылкой.', en: 'Manage rates, orders and broadcasts.', zh: '管理汇率、订单和广播。' },
    'profile.admin_open': { ru: 'Открыть Панель Администратора', en: 'Open Admin Panel', zh: '打开管理面板' },
    'profile.info': { ru: 'Полезная информация', en: 'Useful Info', zh: '有用信息' },
    'profile.user': { ru: 'Пользователь', en: 'User', zh: '用户' },

    // Orders page
    'orders.title': { ru: 'Мои заказы', en: 'My Orders', zh: '我的订单' },
    'orders.empty': { ru: 'У вас пока нет заказов', en: 'No orders yet', zh: '暂无订单' },
    'orders.empty_desc': { ru: 'Оформите заявку на главной странице', en: 'Submit an order on the home page', zh: '在首页提交订单' },
    'orders.loading': { ru: 'Загрузка...', en: 'Loading...', zh: '加载中...' },

    // Statuses
    'status.New': { ru: 'Новый', en: 'New', zh: '新订单' },
    'status.Awaiting Payment': { ru: 'Ожидает оплаты', en: 'Awaiting Payment', zh: '等待付款' },
    'status.Purchased': { ru: 'Выкуплен', en: 'Purchased', zh: '已采购' },
    'status.At China Warehouse': { ru: 'На складе в Китае', en: 'At China Warehouse', zh: '中国仓库' },
    'status.Sent to RF (Russia)': { ru: 'Отправлен в РФ', en: 'Shipped to Russia', zh: '已发往俄罗斯' },
    'status.Received': { ru: 'Получен', en: 'Received', zh: '已收货' },
}

export function useLang(): Lang {
    if (typeof window === 'undefined') return 'ru'
    return (localStorage.getItem('poizon_lang') as Lang) || 'ru'
}

export function t(key: string, lang?: Lang): string {
    const l = lang || useLang()
    return translations[key]?.[l] || translations[key]?.['ru'] || key
}
