import { useState, useEffect, useMemo } from 'react'
import { Calculator as CalcIcon, ShoppingBag, ArrowRight } from 'lucide-react'
import { api } from '../api'
import toast from 'react-hot-toast'
import WebApp from '@twa-dev/sdk'

export default function Home() {
    const [yuanPrice, setYuanPrice] = useState<string>('')
    const [productLink, setProductLink] = useState('')
    const [size, setSize] = useState('')
    const [comment, setComment] = useState('')

    const [exchangeRate, setExchangeRate] = useState(13.5)
    const [commission, setCommission] = useState(1500)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        api.get('/settings')
            .then(res => {
                setExchangeRate(res.data.exchange_rate)
                setCommission(res.data.commission)
            })
            .catch(err => {
                console.error("Failed to load settings", err)
            })
    }, [])

    const finalPrice = useMemo(() => {
        const price = parseFloat(yuanPrice)
        if (isNaN(price) || price <= 0) return 0
        return Math.ceil((price * exchangeRate) + commission)
    }, [yuanPrice, exchangeRate, commission])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!productLink || !size || !yuanPrice) {
            toast.error('Заполните все обязательные поля')
            return
        }

        setIsSubmitting(true)
        try {
            const userData = WebApp.initDataUnsafe?.user

            const payload = {
                total_price_rubles: finalPrice,
                user_telegram_id: userData?.id?.toString() || "test_user_id",
                fullname: userData?.first_name || "Test User",
                items: [
                    {
                        product_link: productLink,
                        size: size,
                        price_yuan: parseFloat(yuanPrice),
                        comment: comment
                    }
                ]
            }

            await api.post('/orders', payload)
            toast.success('Заявка успешно отправлена!')

            setProductLink('')
            setSize('')
            setYuanPrice('')
            setComment('')

            if ((window as any).Telegram?.WebApp) {
                WebApp.HapticFeedback.notificationOccurred('success')
            }

        } catch (error) {
            console.error(error)
            toast.error('Ошибка при отправке заявки')
            if ((window as any).Telegram?.WebApp) {
                WebApp.HapticFeedback.notificationOccurred('error')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            {/* Calculator Section */}
            <div className="glass-panel p-6 stagger-1 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-cyan/20 blur-3xl rounded-full" />
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-brand-cyan/10 rounded-2xl">
                        <CalcIcon className="text-brand-cyan w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Калькулятор</h2>
                        <p className="text-xs text-zinc-400 font-medium">Стоимость без доставки</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Цена на Poizon (¥)</label>
                        <input
                            type="number"
                            inputMode="decimal"
                            className="glass-input text-2xl font-bold font-display"
                            placeholder="0.00"
                            value={yuanPrice}
                            onChange={(e) => setYuanPrice(e.target.value)}
                        />
                        <span className="absolute right-4 top-[38px] text-zinc-500 font-bold">¥</span>
                    </div>

                    <div className="mt-2 p-5 bg-zinc-950/80 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-sm text-zinc-400 font-medium">Итого:</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-display font-bold text-white">
                                {finalPrice.toLocaleString('ru-RU')}
                            </span>
                            <span className="text-brand-cyan font-bold">₽</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Form Section */}
            <div className="glass-panel p-6 stagger-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-brand-purple/10 rounded-2xl">
                        <ShoppingBag className="text-brand-purple w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">Новый заказ</h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Ссылка на товар</label>
                        <input
                            type="url"
                            className="glass-input"
                            placeholder="Вставьте ссылку с Poizon / 1688"
                            value={productLink}
                            onChange={e => setProductLink(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Размер (EU / CM)</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="напр. 42 EU / 26.5 CM"
                            value={size}
                            onChange={e => setSize(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Комментарий (необязательно)</label>
                        <textarea
                            className="glass-input min-h-[80px] resize-none"
                            placeholder="Особые пожелания?"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary mt-2 flex items-center justify-center gap-2 group"
                    >
                        {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                        {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </>
    )
}
