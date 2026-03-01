import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCircle, Save, ShieldAlert, CheckCircle2, ExternalLink, BookOpen, DollarSign, Megaphone, FileText } from 'lucide-react'
import WebApp from '@twa-dev/sdk'
import toast from 'react-hot-toast'

const INFO_LINKS = [
    {
        title: 'Этапы заказа с Poizon',
        desc: 'Полное руководство от А до Я',
        url: 'https://telegra.ph/EHtapy-zakaza-s-pojzona-10-01',
        icon: BookOpen,
        color: 'brand-cyan',
    },
    {
        title: 'Из чего складывается цена',
        desc: 'Курс, комиссия, доставка',
        url: 'https://telegra.ph/Iz-chego-skladyvaetsya-cena-10-10',
        icon: DollarSign,
        color: 'green-400',
    },
    {
        title: 'Канал Poizon666',
        desc: 'Новости, акции, отзывы',
        url: 'https://t.me/poizon666_channel/3938',
        icon: Megaphone,
        color: 'brand-purple',
    },
    {
        title: 'Гайд по Poizon',
        desc: 'Как пользоваться приложением',
        url: 'https://teletype.in/@bchengga/jASBqSXoZLt',
        icon: FileText,
        color: 'yellow-400',
    },
]

export default function Profile() {
    const [fullname, setFullname] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const tgUser = WebApp.initDataUnsafe?.user

    useEffect(() => {
        const savedProfile = localStorage.getItem('poizon_profile')
        if (savedProfile) {
            const data = JSON.parse(savedProfile)
            setFullname(data.fullname || '')
            setPhone(data.phone || '')
            setAddress(data.address || '')
        } else if (tgUser) {
            setFullname(tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''))
        }
        setIsAdmin(true)
    }, [tgUser])

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        localStorage.setItem('poizon_profile', JSON.stringify({ fullname, phone, address }))
        setIsSaved(true)
        toast.success('Профиль сохранён!')
        if ((window as any).Telegram?.WebApp) {
            WebApp.HapticFeedback.notificationOccurred('success')
        }
        setTimeout(() => setIsSaved(false), 2000)
    }

    return (
        <div className="w-full flex flex-col gap-6 stagger-1">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple p-[2px]">
                    <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-white" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold">{tgUser?.first_name || 'Пользователь'}</h2>
                    <span className="text-xs text-brand-cyan font-mono">
                        {tgUser?.username ? `@${tgUser.username}` : `ID: ${tgUser?.id || '—'}`}
                    </span>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Данные для доставки</h3>

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">ФИО (Полностью)</label>
                        <input type="text" className="glass-input" placeholder="Иванов Иван Иванович" value={fullname} onChange={e => setFullname(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Телефон</label>
                        <input type="tel" className="glass-input" placeholder="+7 (999) 000-00-00" value={phone} onChange={e => setPhone(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Адрес (ПВЗ СДЭК или Почта)</label>
                        <textarea className="glass-input min-h-[80px] resize-none" placeholder="г. Москва, ул. Пушкина, ПВЗ СДЭК" value={address} onChange={e => setAddress(e.target.value)} required />
                    </div>
                    <button type="submit" className={`mt-2 flex justify-center items-center gap-2 rounded-2xl px-6 py-4 font-bold transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-white text-black hover:scale-[1.02] active:scale-95'}`}>
                        {isSaved ? <><CheckCircle2 className="w-5 h-5" /> Сохранено</> : <><Save className="w-5 h-5" /> Сохранить профиль</>}
                    </button>
                </form>
            </div>

            {/* Admin Panel Access */}
            {isAdmin && (
                <div className="glass-panel p-5 border-brand-purple/30 bg-brand-purple/5">
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldAlert className="text-brand-purple w-5 h-5" />
                        <h3 className="font-bold text-white">Доступ Менеджера</h3>
                    </div>
                    <p className="text-xs text-zinc-400 mb-4">Управление курсом, заказами и рассылкой.</p>
                    <Link to="/admin" className="w-full flex justify-center items-center py-3 rounded-xl bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-purple/30 text-white font-bold hover:from-brand-purple/40 hover:to-brand-cyan/40 transition-colors">
                        Открыть Панель Администратора
                    </Link>
                </div>
            )}

            {/* Info Links */}
            <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Полезная информация</h3>
                <div className="flex flex-col gap-3">
                    {INFO_LINKS.map((link, i) => {
                        const Icon = link.icon
                        return (
                            <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all group"
                            >
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Icon className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{link.title}</p>
                                    <p className="text-[10px] text-zinc-500">{link.desc}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-brand-cyan transition-colors flex-shrink-0" />
                            </a>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
