import { useState, useEffect, useMemo, useRef } from 'react'
import { Calculator as CalcIcon, ShoppingBag, ArrowRight, Plus, Trash2, Shield, Zap, Package, Headphones, MapPin } from 'lucide-react'
import { api } from '../api'
import { t, useLang } from '../i18n'
import toast from 'react-hot-toast'
import WebApp from '@twa-dev/sdk'

interface CartItem {
    id: number;
    productLink: string;
    size: string;
    priceYuan: string;
    comment: string;
    imageUrl: string;
}

const COMMISSION_OPTIONS = [
    { key: 'insurance', labelKey: 'calc.insurance', descKey: 'calc.insurance_desc', rate: 10, icon: Shield, activeColor: '#00f2fe', activeBg: 'rgba(0,242,254,0.15)', activeBorder: 'rgba(0,242,254,0.3)' },
    { key: 'no_insurance', labelKey: 'calc.no_insurance', descKey: 'calc.no_insurance_desc', rate: 7, icon: Zap, activeColor: '#facc15', activeBg: 'rgba(250,204,21,0.15)', activeBorder: 'rgba(250,204,21,0.3)' },
    { key: 'wholesale', labelKey: 'calc.wholesale', descKey: 'calc.wholesale_desc', rate: 5, icon: Package, activeColor: '#4ade80', activeBg: 'rgba(74,222,128,0.15)', activeBorder: 'rgba(74,222,128,0.3)' },
]

let nextId = 1

export default function Home() {
    const lang = useLang()
    const [commissionType, setCommissionType] = useState('insurance')
    const [exchangeRate, setExchangeRate] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [supportUsername, setSupportUsername] = useState('s1pport')
    const [deliveryType, setDeliveryType] = useState<'address' | 'pickup_msk' | 'pickup_spb'>('address')
    const [cart, setCart] = useState<CartItem[]>([
        { id: nextId++, productLink: '', size: '', priceYuan: '', comment: '', imageUrl: '' }
    ])
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        api.get('/settings')
            .then(res => {
                setExchangeRate(res.data.exchange_rate)
                if (res.data.support_username) setSupportUsername(res.data.support_username)
            })
            .catch(() => { setExchangeRate(13.5) })
    }, [])

    // Auto-scroll when input focused
    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
    }

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

    const addItem = () => setCart(prev => [...prev, { id: nextId++, productLink: '', size: '', priceYuan: '', comment: '', imageUrl: '' }])
    const removeItem = (id: number) => { if (cart.length > 1) setCart(prev => prev.filter(item => item.id !== id)) }
    const updateItem = (id: number, field: keyof CartItem, value: string) => setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const validItems = cart.filter(item => item.productLink && item.size && item.priceYuan)
        if (validItems.length === 0) { toast.error(t('order.add_item_error', lang)); return }
        setIsSubmitting(true)
        try {
            const userData = WebApp.initDataUnsafe?.user
            const savedProfile = localStorage.getItem('poizon_profile')
            const profile = savedProfile ? JSON.parse(savedProfile) : {}

            let deliveryAddress = profile.address || ''
            if (deliveryType === 'pickup_msk') deliveryAddress = 'Самовывоз — Москва'
            else if (deliveryType === 'pickup_spb') deliveryAddress = 'Самовывоз — Санкт-Петербург'

            await api.post('/orders', {
                total_price_rubles: grandTotal,
                user_telegram_id: userData?.id?.toString() || "unknown",
                fullname: profile.fullname || userData?.first_name || "User",
                username: userData?.username || null,
                phone: profile.phone || null,
                delivery_address: deliveryAddress,
                commission_type: commissionType,
                items: validItems.map(item => ({
                    product_link: item.productLink,
                    size: item.size,
                    price_yuan: parseFloat(item.priceYuan),
                    comment: item.comment || null,
                    image_url: item.imageUrl || null,
                }))
            })
            toast.success(t('order.success', lang))
            setCart([{ id: nextId++, productLink: '', size: '', priceYuan: '', comment: '', imageUrl: '' }])
            if ((window as any).Telegram?.WebApp) WebApp.HapticFeedback.notificationOccurred('success')
        } catch (error) {
            console.error(error)
            toast.error(t('order.error', lang))
        } finally { setIsSubmitting(false) }
    }

    return (
        <>
            {/* Calculator */}
            <div className="glass-panel p-6 stagger-1 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-cyan/20 blur-3xl rounded-full" />
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-brand-cyan/10 rounded-2xl"><CalcIcon className="text-brand-cyan w-6 h-6" /></div>
                    <div>
                        <h2 className="text-xl font-bold">{t('calc.title', lang)}</h2>
                    </div>
                </div>

                <div className="flex flex-col gap-2 mb-5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('calc.commission', lang)}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {COMMISSION_OPTIONS.map(opt => {
                            const Icon = opt.icon
                            const active = commissionType === opt.key
                            return (
                                <button key={opt.key} type="button" onClick={() => setCommissionType(opt.key)}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold border transition-all"
                                    style={active ? { backgroundColor: opt.activeBg, color: opt.activeColor, borderColor: opt.activeBorder } : { backgroundColor: 'rgba(24,24,27,0.8)', color: '#71717a', borderColor: 'rgba(39,39,42,1)' }}>
                                    <Icon className="w-4 h-4" />
                                    <span>{t(opt.labelKey, lang)}</span>
                                    <span className="text-sm font-display">{opt.rate}%</span>
                                </button>
                            )
                        })}
                    </div>
                    <p className="text-[9px] text-zinc-600 text-center mt-1">
                        {t(COMMISSION_OPTIONS.find(o => o.key === commissionType)?.descKey || '', lang)}
                    </p>
                </div>

                <div className="p-5 bg-zinc-950/80 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                        <span className="text-sm text-zinc-400 font-medium block">{t('calc.total', lang)}:</span>
                        {totalYuan > 0 && <span className="text-[10px] text-zinc-600">{totalYuan.toFixed(0)}¥ × {exchangeRate.toFixed(2)} + {commissionRate}%</span>}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-bold text-white">{grandTotal.toLocaleString('ru-RU')}</span>
                        <span className="text-brand-cyan font-bold">₽</span>
                    </div>
                </div>
            </div>

            {/* Order Form */}
            <div className="glass-panel p-6 stagger-2">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-brand-purple/10 rounded-2xl"><ShoppingBag className="text-brand-purple w-6 h-6" /></div>
                    <div>
                        <h2 className="text-xl font-bold">{t('order.title', lang)}</h2>
                        <p className="text-xs text-zinc-400">{cart.length} {cart.length === 1 ? t('order.items_one', lang) : cart.length < 5 ? t('order.items_few', lang) : t('order.items_many', lang)}</p>
                    </div>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {cart.map((item, idx) => (
                        <div key={item.id} className="bg-zinc-900/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
                            {cart.length > 1 && (
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-zinc-500">{t('order.item', lang)} {idx + 1}</span>
                                    <button type="button" onClick={() => removeItem(item.id)} className="text-red-400/60 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">{t('order.price_yuan', lang)}</label>
                                <input type="number" inputMode="decimal" className="glass-input text-lg font-bold" placeholder="0" value={item.priceYuan} onChange={e => updateItem(item.id, 'priceYuan', e.target.value)} onFocus={handleFocus} required />
                                {itemTotals[idx] > 0 && <p className="text-[10px] text-brand-cyan mt-1 text-right">≈ {itemTotals[idx].toLocaleString('ru-RU')} ₽</p>}
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">{t('order.link', lang)}</label>
                                <textarea className="glass-input min-h-[60px] resize-none text-xs" placeholder={t('order.link_placeholder', lang)} value={item.productLink} onChange={e => updateItem(item.id, 'productLink', e.target.value)} onFocus={handleFocus} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">{t('order.size', lang)}</label>
                                <input type="text" className="glass-input" placeholder={t('order.size_placeholder', lang)} value={item.size} onChange={e => updateItem(item.id, 'size', e.target.value)} onFocus={handleFocus} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">{t('order.comment', lang)}</label>
                                <input type="text" className="glass-input text-sm" placeholder={t('order.comment_placeholder', lang)} value={item.comment} onChange={e => updateItem(item.id, 'comment', e.target.value)} onFocus={handleFocus} />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">📷 {t('order.image', lang)}</label>
                                {item.imageUrl ? (
                                    <div className="relative mt-1">
                                        <img src={item.imageUrl} alt="" className="w-full max-h-40 object-cover rounded-xl border border-white/10" />
                                        <button type="button" onClick={() => updateItem(item.id, 'imageUrl', '')}
                                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 transition-colors">✕</button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 glass-input cursor-pointer text-xs text-zinc-400 hover:text-brand-cyan hover:border-brand-cyan/30 transition-colors py-4">
                                        <span>📷</span> {t('order.image_placeholder', lang)}
                                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            // Compress image client-side
                                            const compressed = await new Promise<Blob>((resolve) => {
                                                const canvas = document.createElement('canvas')
                                                const ctx = canvas.getContext('2d')!
                                                const img = new Image()
                                                img.onload = () => {
                                                    const maxSize = 800
                                                    let w = img.width, h = img.height
                                                    if (w > maxSize || h > maxSize) {
                                                        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize }
                                                        else { w = Math.round(w * maxSize / h); h = maxSize }
                                                    }
                                                    canvas.width = w; canvas.height = h
                                                    ctx.drawImage(img, 0, 0, w, h)
                                                    canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.75)
                                                }
                                                img.src = URL.createObjectURL(file)
                                            })
                                            // Show local preview immediately
                                            const localUrl = URL.createObjectURL(compressed)
                                            updateItem(item.id, 'imageUrl', localUrl)
                                            // Upload to server
                                            try {
                                                const formData = new FormData()
                                                formData.append('file', compressed, 'photo.jpg')
                                                const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                                                updateItem(item.id, 'imageUrl', res.data.url)
                                            } catch {
                                                toast.error(t('order.image_error', lang))
                                            }
                                        }} />
                                    </label>
                                )}
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addItem} className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-zinc-500 text-sm font-medium flex items-center justify-center gap-2 hover:border-brand-cyan/30 hover:text-brand-cyan transition-colors">
                        <Plus className="w-4 h-4" /> {t('order.add_item', lang)}
                    </button>

                    {/* Delivery / Pickup selector */}
                    <div className="bg-zinc-900/40 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-brand-cyan" />
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('delivery.title', lang)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button type="button" onClick={() => setDeliveryType('pickup_msk')}
                                className="p-2.5 rounded-xl text-xs font-bold border transition-all text-center"
                                style={deliveryType === 'pickup_msk' ? { backgroundColor: 'rgba(0,242,254,0.12)', color: '#00f2fe', borderColor: 'rgba(0,242,254,0.3)' } : { backgroundColor: 'rgba(24,24,27,0.8)', color: '#71717a', borderColor: 'rgba(39,39,42,1)' }}>
                                {t('delivery.pickup_msk', lang)}
                            </button>
                            <button type="button" onClick={() => setDeliveryType('pickup_spb')}
                                className="p-2.5 rounded-xl text-xs font-bold border transition-all text-center"
                                style={deliveryType === 'pickup_spb' ? { backgroundColor: 'rgba(0,242,254,0.12)', color: '#00f2fe', borderColor: 'rgba(0,242,254,0.3)' } : { backgroundColor: 'rgba(24,24,27,0.8)', color: '#71717a', borderColor: 'rgba(39,39,42,1)' }}>
                                {t('delivery.pickup_spb', lang)}
                            </button>
                        </div>
                        <button type="button" onClick={() => setDeliveryType('address')}
                            className="w-full p-2.5 rounded-xl text-xs font-bold border transition-all text-center mb-2"
                            style={deliveryType === 'address' ? { backgroundColor: 'rgba(79,172,254,0.12)', color: '#4facfe', borderColor: 'rgba(79,172,254,0.3)' } : { backgroundColor: 'rgba(24,24,27,0.8)', color: '#71717a', borderColor: 'rgba(39,39,42,1)' }}>
                            📦 {t('delivery.address', lang)}
                        </button>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 flex items-center justify-center gap-2 group">
                        {isSubmitting ? t('order.submitting', lang) : `${t('order.submit', lang)} (${grandTotal.toLocaleString('ru-RU')} ₽)`}
                        {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>

            {/* Support */}
            <a href={`https://t.me/${supportUsername}`} target="_blank" rel="noopener noreferrer" className="glass-panel p-4 flex items-center gap-3 stagger-3 hover:border-brand-purple/30 transition-colors">
                <div className="p-2.5 bg-brand-purple/10 rounded-xl"><Headphones className="text-brand-purple w-5 h-5" /></div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white">{t('support.title', lang)}</p>
                    <p className="text-[10px] text-zinc-500">@{supportUsername}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
            </a>
        </>
    )
}
