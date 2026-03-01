import { useEffect, useState } from 'react'
import { api } from '../api'
import { t, useLang } from '../i18n'
import { PackageSearch, Clock, MapPin, Truck, CheckCircle, HelpCircle } from 'lucide-react'
import WebApp from '@twa-dev/sdk'

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
    track_rf: string | null;
    track_china: string | null;
    items: OrderItem[];
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    'New': { color: 'text-yellow-500', icon: Clock },
    'Awaiting Payment': { color: 'text-orange-500', icon: Clock },
    'Purchased': { color: 'text-brand-purple', icon: CheckCircle },
    'At China Warehouse': { color: 'text-blue-500', icon: MapPin },
    'Sent to RF (Russia)': { color: 'text-brand-cyan', icon: Truck },
    'Received': { color: 'text-green-500', icon: CheckCircle },
}

export default function Orders() {
    const lang = useLang()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userId = WebApp.initDataUnsafe?.user?.id?.toString() || "test_user_id"
                const res = await api.get('/orders', { params: { telegram_id: userId } })
                setOrders(res.data)
            } catch (err) {
                console.error('Failed to fetch orders:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    if (loading) {
        return <div className="text-center text-zinc-500 mt-10 animate-pulse">{t('orders.loading', lang)}</div>
    }

    return (
        <div className="w-full flex flex-col gap-4 stagger-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <PackageSearch className="w-5 h-5 text-brand-purple" />
                    {t('orders.title', lang)}
                </h2>
                <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-3 py-1 rounded-full">
                    {orders.length}
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="glass-panel p-8 text-center flex flex-col items-center justify-center opacity-80">
                    <PackageSearch className="w-12 h-12 text-zinc-700 mb-3" />
                    <p className="text-zinc-400 font-medium">{t('orders.empty', lang)}</p>
                    <p className="text-xs text-zinc-600 mt-1">{t('orders.empty_desc', lang)}</p>
                </div>
            ) : (
                orders.map((order) => {
                    const config = statusConfig[order.status] || { color: 'text-zinc-500', icon: HelpCircle }
                    const StatusIcon = config.icon

                    return (
                        <div key={order.id} className="glass-panel p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs text-zinc-500 font-medium font-mono">
                                        #{String(order.id).padStart(6, '0')}
                                    </span>
                                    <div className={`mt-1 flex items-center gap-1.5 text-sm font-bold ${config.color}`}>
                                        <StatusIcon className="w-4 h-4" />
                                        {t(`status.${order.status}`, lang)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-display font-bold text-lg">{order.total_price_rubles.toLocaleString('ru-RU')} ₽</div>
                                    <div className="text-[10px] text-zinc-500">{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                                </div>
                            </div>

                            {/* Track numbers */}
                            {(order.track_rf || order.track_china) && (
                                <div className="mb-3 text-[10px] text-zinc-500 space-y-0.5">
                                    {order.track_rf && <div>🇷🇺 Трек: <span className="font-mono text-white">{order.track_rf}</span></div>}
                                    {order.track_china && <div>🇨🇳 Трек: <span className="font-mono text-white">{order.track_china}</span></div>}
                                </div>
                            )}

                            <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col gap-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="truncate max-w-[200px] text-zinc-400 text-xs">{item.product_link}</span>
                                        <span className="font-medium text-white text-xs bg-zinc-800 px-2 py-0.5 rounded-lg">{item.size}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}
