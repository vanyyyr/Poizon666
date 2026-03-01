import { useState, useEffect, useMemo } from 'react'
import { Calculator as CalcIcon, ShoppingBag, ArrowRight, Plus, Trash2, Shield, Zap, Package } from 'lucide-react'
import { api } from '../api'
import toast from 'react-hot-toast'
import WebApp from '@twa-dev/sdk'

interface CartItem {
    id: number;
    productLink: string;
    size: string;
    priceYuan: string;
    comment: string;
}

const COMMISSION_OPTIONS = [
    { key: 'insurance', label: 'Со страховкой', rate: 10, icon: Shield, color: 'brand-cyan' },
    { key: 'no_insurance', label: 'Без страховки', rate: 7, icon: Zap, color: 'yellow-400' },
    { key: 'wholesale', label: 'Опт (от 8000¥)', rate: 5, icon: Package, color: 'green-400' },
]

let nextId = 1

export default function Home() {
    const [commissionType, setCommissionType] = useState('insurance')
    const [exchangeRate, setExchangeRate] = useState(13.5)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cart, setCart] = useState<CartItem[]>([
        { id: nextId++, productLink: '', size: '', priceYuan: '', comment: '' }
    ])

    useEffect(() => {
        api.get('/settings')
            .then(res => setExchangeRate(res.data.exchange_rate))
            .catch(err => console.error("Failed to load settings", err))
    }, [])

    const commissionRate = COMMISSION_OPTIONS.find(o => o.key === commissionType)?.rate || 10

    const { itemTotals, grandTotal, totalYuan } = useMemo(() => {
        let grand = 0
        let yuan = 0
        const totals = cart.map(item => {
            const price = parseFloat(item.priceYuan)
            if (isNaN(price) || price <= 0) return 0
            yuan += price
            const base = price * exchangeRate
            const total = base + base * (commissionRate / 100)
            grand += total
            return Math.ceil(total)
        })
        return { itemTotals: totals, grandTotal: Math.ceil(grand), totalYuan: yuan }
    }, [cart, exchangeRate, commissionRate])

    const addItem = () => {
        setCart(prev => [...prev, { id: nextId++, productLink: '', size: '', priceYuan: '', comment: '' }])
    }

    const removeItem = (id: number) => {
        if (cart.length <= 1) return
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const updateItem = (id: number, field: keyof CartItem, value: string) => {
        setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const validItems = cart.filter(item => item.productLink && item.size && item.priceYuan)
        if (validItems.length === 0) {
            toast.error('Добавьте хотя бы один товар')
            return
        }

        setIsSubmitting(true)
        try {
            const userData = WebApp.initDataUnsafe?.user

            const payload = {
                total_price_rubles: grandTotal,
                user_telegram_id: userData?.id?.toString() || "unknown",
                fullname: userData?.first_name || "User",
                username: userData?.username || null,
                commission_type: commissionType,
                items: validItems.map(item => ({
                    product_link: item.productLink,
                    size: item.size,
                    price_yuan: parseFloat(item.priceYuan),
                    comment: item.comment || null,
                }))
            }

            await api.post('/orders', payload)
            toast.success('Заявка отправлена!')
            setCart([{ id: nextId++, productLink: '', size: '', priceYuan: '', comment: '' }])

            if ((window as any).Telegram?.WebApp) {
                WebApp.HapticFeedback.notificationOccurred('success')
            }
        } catch (error) {
            console.error(error)
            toast.error('Ошибка при отправке заявки')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            {/* Calculator */}
            <div className="glass-panel p-6 stagger-1 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-cyan/20 blur-3xl rounded-full" />
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-brand-cyan/10 rounded-2xl">
                        <CalcIcon className="text-brand-cyan w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Калькулятор</h2>
                        <p className="text-xs text-zinc-400">Курс: {exchangeRate.toFixed(2)} ₽/¥</p>
                    </div>
                </div>

                {/* Commission selector */}
                <div className="flex flex-col gap-2 mb-5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Выберите комиссию</label>
                    <div className="grid grid-cols-3 gap-2">
                        {COMMISSION_OPTIONS.map(opt => {
                            const Icon = opt.icon
                            const active = commissionType === opt.key
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setCommissionType(opt.key)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold border transition-all ${active
                                            ? `bg-${opt.color}/20 text-${opt.color} border-${opt.color}/30`
                                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                                        }`}
                                    style={active ? { backgroundColor: `var(--color-${opt.color}, rgba(255,255,255,0.1))` } : {}}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{opt.label}</span>
                                    <span className={`text-sm font-display ${active ? '' : 'text-zinc-600'}`}>{opt.rate}%</span>
                                </button>
                            )
                        })}
                    </div>
                    <p className="text-[9px] text-zinc-600 text-center mt-1">
                        {commissionType === 'insurance' && '🛡️ Если в процессе доставки появится потерь — вернём всю сумму'}
                        {commissionType === 'no_insurance' && '⚡ Выгоднее, но без компенсации при потере'}
                        {commissionType === 'wholesale' && '📦 Для заказов от 8000¥ (единица или общая сумма)'}
                    </p>
                </div>

                {/* Total */}
                <div className="p-5 bg-zinc-950/80 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                        <span className="text-sm text-zinc-400 font-medium block">Итого:</span>
                        {totalYuan > 0 && <span className="text-[10px] text-zinc-600">{totalYuan.toFixed(0)}¥ × {exchangeRate.toFixed(2)} + {commissionRate}%</span>}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-bold text-white">
                            {grandTotal.toLocaleString('ru-RU')}
                        </span>
                        <span className="text-brand-cyan font-bold">₽</span>
                    </div>
                </div>
            </div>

            {/* Order Form */}
            <div className="glass-panel p-6 stagger-2">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-purple/10 rounded-2xl">
                            <ShoppingBag className="text-brand-purple w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Заказ</h2>
                            <p className="text-xs text-zinc-400">{cart.length} {cart.length === 1 ? 'товар' : 'товара'}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {cart.map((item, idx) => (
                        <div key={item.id} className="bg-zinc-900/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-3 relative">
                            {cart.length > 1 && (
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-zinc-500">Товар {idx + 1}</span>
                                    <button type="button" onClick={() => removeItem(item.id)} className="text-red-400/60 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Цена (¥)</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    className="glass-input text-lg font-bold"
                                    placeholder="0"
                                    value={item.priceYuan}
                                    onChange={e => updateItem(item.id, 'priceYuan', e.target.value)}
                                    required
                                />
                                {itemTotals[idx] > 0 && (
                                    <p className="text-[10px] text-brand-cyan mt-1 text-right">≈ {itemTotals[idx].toLocaleString('ru-RU')} ₽</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Ссылка на товар</label>
                                <textarea
                                    className="glass-input min-h-[60px] resize-none text-xs"
                                    placeholder="Вставьте ссылку с Poizon / 1688 / Taobao (любой формат)"
                                    value={item.productLink}
                                    onChange={e => updateItem(item.id, 'productLink', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Размер / Цвет</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="42 EU, бело-серо-розовые"
                                    value={item.size}
                                    onChange={e => updateItem(item.id, 'size', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Комментарий</label>
                                <input
                                    type="text"
                                    className="glass-input text-sm"
                                    placeholder="Особые пожелания"
                                    value={item.comment}
                                    onChange={e => updateItem(item.id, 'comment', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Add item button */}
                    <button
                        type="button"
                        onClick={addItem}
                        className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-zinc-500 text-sm font-medium flex items-center justify-center gap-2 hover:border-brand-cyan/30 hover:text-brand-cyan transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Добавить ещё товар
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary mt-2 flex items-center justify-center gap-2 group"
                    >
                        {isSubmitting ? 'Отправка...' : `Отправить заявку (${grandTotal.toLocaleString('ru-RU')} ₽)`}
                        {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </>
    )
}
