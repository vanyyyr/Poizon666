import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { Settings2, Save, Users, TrendingUp, PackageSearch, ChevronDown, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import WebApp from '@twa-dev/sdk'

const ADMIN_PASSWORD = 'qwerty'

interface OrderItem {
    product_link: string;
    size: string;
    price_yuan: number;
}

interface Order {
    id: number;
    created_at: string;
    status: string;
    total_price_rubles: number;
    items: OrderItem[];
    user_id: number;
}

const ORDER_STATUSES = [
    'New',
    'Awaiting Payment',
    'Purchased',
    'At China Warehouse',
    'Sent to RF (Russia)',
    'Received',
]

const statusLabels: Record<string, string> = {
    'New': 'Новый',
    'Awaiting Payment': 'Ожидает оплаты',
    'Purchased': 'Выкуплен',
    'At China Warehouse': 'На складе в Китае',
    'Sent to RF (Russia)': 'Отправлен в РФ',
    'Received': 'Получен',
}

const statusColors: Record<string, string> = {
    'New': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Awaiting Payment': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Purchased': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'At China Warehouse': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Sent to RF (Russia)': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Received': 'bg-green-500/20 text-green-400 border-green-500/30',
}

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [passwordInput, setPasswordInput] = useState('')
    const [exchangeRate, setExchangeRate] = useState(0)
    const [commission, setCommission] = useState(0)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [ordersLoading, setOrdersLoading] = useState(true)
    const [orderCount, setOrderCount] = useState(0)

    // Check if already authenticated from session
    useEffect(() => {
        const saved = sessionStorage.getItem('poizon_admin')
        if (saved === 'true') {
            setIsAuthenticated(true)
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) return

        api.get('/settings')
            .then(res => {
                setExchangeRate(res.data.exchange_rate)
                setCommission(res.data.commission)
                setLoading(false)
            })
            .catch(err => {
                console.error('Settings error:', err)
                setLoading(false)
            })

        api.get('/orders')
            .then(res => {
                setOrders(res.data)
                setOrderCount(res.data.length)
                setOrdersLoading(false)
            })
            .catch(err => {
                console.error('Orders error:', err)
                setOrdersLoading(false)
            })
    }, [isAuthenticated])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordInput === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
            sessionStorage.setItem('poizon_admin', 'true')
            toast.success('Доступ разрешён')
            if ((window as any).Telegram?.WebApp) {
                WebApp.HapticFeedback.notificationOccurred('success')
            }
        } else {
            toast.error('Неверный пароль')
            if ((window as any).Telegram?.WebApp) {
                WebApp.HapticFeedback.notificationOccurred('error')
            }
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put('/settings', { exchange_rate: exchangeRate, commission: commission })
            toast.success('Настройки сохранены!')
            if ((window as any).Telegram?.WebApp) {
                WebApp.HapticFeedback.notificationOccurred('success')
            }
        } catch (err) {
            toast.error('Ошибка сохранения настроек')
        } finally {
            setSaving(false)
        }
    }

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus })
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            toast.success(`Статус заказа #${orderId} обновлён`)
            if ((window as any).Telegram?.WebApp) {
                WebApp.HapticFeedback.notificationOccurred('success')
            }
        } catch (err) {
            toast.error('Ошибка обновления статуса')
        }
    }

    // --- Password Gate ---
    if (!isAuthenticated) {
        return (
            <div className="w-full flex flex-col items-center justify-center gap-6 mt-10 stagger-1">
                <div className="glass-panel p-8 w-full max-w-sm">
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="p-4 bg-brand-purple/10 rounded-2xl">
                            <Lock className="text-brand-purple w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Панель Администратора</h2>
                        <p className="text-xs text-zinc-400 text-center">Введите пароль для доступа</p>
                    </div>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input
                            type="password"
                            className="glass-input text-center text-lg tracking-widest"
                            placeholder="••••••"
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="btn-primary flex items-center justify-center gap-2"
                        >
                            <Lock className="w-4 h-4" /> Войти
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // --- Admin Panel ---
    if (loading) {
        return <div className="text-center text-zinc-500 mt-10 animate-pulse">Загрузка панели...</div>
    }

    return (
        <div className="w-full flex flex-col gap-6 stagger-1">

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-cyan/20 blur-xl rounded-full" />
                    <Users className="w-6 h-6 text-brand-cyan mb-2" />
                    <span className="text-2xl font-bold font-display">8.3k</span>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Подписчиков</span>
                </div>
                <div className="glass-panel p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-brand-purple/20 blur-xl rounded-full" />
                    <TrendingUp className="w-6 h-6 text-brand-purple mb-2" />
                    <span className="text-2xl font-bold font-display">{orderCount}</span>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Заказов</span>
                </div>
            </div>

            {/* Global Settings */}
            <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                        <Settings2 className="text-yellow-500 w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Настройки цен</h2>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                            Курс юаня (¥ → ₽)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                className="glass-input text-lg font-bold pr-10"
                                value={exchangeRate}
                                onChange={e => setExchangeRate(parseFloat(e.target.value))}
                                required
                            />
                            <span className="absolute right-4 top-[14px] text-zinc-500 font-bold">₽</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                            Фиксированная комиссия (₽)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                className="glass-input text-lg font-bold pr-10"
                                value={commission}
                                onChange={e => setCommission(parseFloat(e.target.value))}
                                required
                            />
                            <span className="absolute right-4 top-[14px] text-zinc-500 font-bold">₽</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-4 relative overflow-hidden rounded-2xl px-6 py-3 font-bold text-black shadow-lg transition-transform hover:scale-[1.02] active:scale-95 bg-white flex justify-center items-center gap-2"
                    >
                        {saving ? 'Сохранение...' : (
                            <>
                                <Save className="w-4 h-4" /> Сохранить
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Orders Management */}
            <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <div className="p-2 bg-brand-purple/10 rounded-xl">
                        <PackageSearch className="text-brand-purple w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Управление заказами</h2>
                    <span className="ml-auto text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{orderCount}</span>
                </div>

                {ordersLoading ? (
                    <div className="text-center text-zinc-500 animate-pulse py-4">Загрузка...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-zinc-600 py-6">
                        <PackageSearch className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                        <p className="text-sm">Пока нет заказов</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                        {orders.map(order => (
                            <div key={order.id} className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-xs text-zinc-500 font-mono">#{String(order.id).padStart(6, '0')}</span>
                                        <div className="text-sm font-bold text-white mt-0.5">
                                            {order.total_price_rubles.toLocaleString('ru-RU')} ₽
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-zinc-500">
                                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>

                                <div className="mb-3 text-xs text-zinc-400 space-y-1">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span className="truncate max-w-[180px]">{item.product_link}</span>
                                            <span className="text-zinc-500">{item.size}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="relative">
                                    <select
                                        value={order.status}
                                        onChange={e => handleStatusChange(order.id, e.target.value)}
                                        className={`w-full appearance-none rounded-xl px-3 py-2 text-xs font-bold border cursor-pointer transition-colors ${statusColors[order.status] || 'bg-zinc-800 text-white border-zinc-700'}`}
                                    >
                                        {ORDER_STATUSES.map(s => (
                                            <option key={s} value={s}>{statusLabels[s]}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-3 h-3 pointer-events-none text-current" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-center text-[10px] text-zinc-600 px-4">
                Изменения курса применяются мгновенно для всех пользователей.
            </p>
        </div>
    )
}
