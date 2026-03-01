import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCircle, Save, ShieldAlert, CheckCircle2, ExternalLink, BookOpen, DollarSign, Megaphone, FileText, Sun, Moon, Monitor, Globe } from 'lucide-react'
import { t, useLang, type Lang } from '../i18n'
import WebApp from '@twa-dev/sdk'
import toast from 'react-hot-toast'

const INFO_LINKS = [
    { title: 'Этапы заказа с Poizon', titleEn: 'Order Steps', titleZh: '订购步骤', desc: 'Полное руководство', descEn: 'Complete guide', descZh: '完整指南', url: 'https://telegra.ph/EHtapy-zakaza-s-pojzona-10-01', icon: BookOpen },
    { title: 'Из чего складывается цена', titleEn: 'Pricing Breakdown', titleZh: '价格组成', desc: 'Курс, комиссия, доставка', descEn: 'Rate, commission, delivery', descZh: '汇率、佣金、运费', url: 'https://telegra.ph/Iz-chego-skladyvaetsya-cena-10-10', icon: DollarSign },
    { title: 'Канал Poizon666', titleEn: 'Poizon666 Channel', titleZh: 'Poizon666频道', desc: 'Новости, акции, отзывы', descEn: 'News, deals, reviews', descZh: '新闻、优惠、评价', url: 'https://t.me/poizon666_channel/3938', icon: Megaphone },
    { title: 'Гайд по Poizon', titleEn: 'Poizon Guide', titleZh: 'Poizon指南', desc: 'Как пользоваться', descEn: 'How to use', descZh: '如何使用', url: 'https://teletype.in/@bchengga/jASBqSXoZLt', icon: FileText },
]

type ThemeMode = 'dark' | 'light' | 'auto'

const THEME_OPTIONS: { key: ThemeMode; labelKey: string; icon: typeof Sun }[] = [
    { key: 'light', labelKey: 'profile.theme_light', icon: Sun },
    { key: 'dark', labelKey: 'profile.theme_dark', icon: Moon },
    { key: 'auto', labelKey: 'profile.theme_auto', icon: Monitor },
]

const LANG_OPTIONS: { key: Lang; label: string }[] = [
    { key: 'ru', label: '🇷🇺 Русский' },
    { key: 'en', label: '🇬🇧 English' },
    { key: 'zh', label: '🇨🇳 中文' },
]

export default function Profile() {
    const [fullname, setFullname] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('poizon_theme') as ThemeMode) || 'dark')
    const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('poizon_lang') as Lang) || 'ru')

    const tgUser = WebApp.initDataUnsafe?.user

    const ADMIN_IDS = [709766413, 1216235790]

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

        if (tgUser && ADMIN_IDS.includes(tgUser.id)) {
            setIsAdmin(true)
        } else {
            setIsAdmin(false)
        }
    }, [tgUser])

    useEffect(() => {
        localStorage.setItem('poizon_theme', theme)
        const html = document.documentElement
        if (theme === 'light') { html.classList.remove('dark'); html.classList.add('light') }
        else if (theme === 'dark') { html.classList.add('dark'); html.classList.remove('light') }
        else {
            if (WebApp.colorScheme === 'dark') { html.classList.add('dark'); html.classList.remove('light') }
            else { html.classList.remove('dark'); html.classList.add('light') }
        }
    }, [theme])

    useEffect(() => {
        localStorage.setItem('poizon_lang', lang)
        // Force re-render across app
        window.dispatchEvent(new Event('storage'))
    }, [lang])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        localStorage.setItem('poizon_profile', JSON.stringify({ fullname, phone, address }))
        setIsSaved(true)
        toast.success(t('profile.save_success', lang))
        if ((window as any).Telegram?.WebApp) WebApp.HapticFeedback.notificationOccurred('success')
        setTimeout(() => setIsSaved(false), 2000)
    }

    const getLinkTitle = (link: typeof INFO_LINKS[0]) => lang === 'en' ? link.titleEn : lang === 'zh' ? link.titleZh : link.title
    const getLinkDesc = (link: typeof INFO_LINKS[0]) => lang === 'en' ? link.descEn : lang === 'zh' ? link.descZh : link.desc

    return (
        <div className="w-full flex flex-col gap-6 stagger-1">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple p-[2px]">
                    <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center"><UserCircle className="w-8 h-8 text-white" /></div>
                </div>
                <div>
                    <h2 className="text-xl font-bold">{tgUser?.first_name || t('profile.user', lang)}</h2>
                    <span className="text-xs text-brand-cyan font-mono">{tgUser?.username ? `@${tgUser.username}` : `ID: ${tgUser?.id || '—'}`}</span>
                </div>
            </div>

            {/* Delivery fields */}
            <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{t('profile.delivery_info', lang)}</h3>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">{t('profile.fullname', lang)}</label>
                        <input type="text" className="glass-input" placeholder={t('profile.fullname_placeholder', lang)} value={fullname} onChange={e => setFullname(e.target.value)} onFocus={handleFocus} required />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">{t('profile.phone', lang)}</label>
                        <input type="tel" className="glass-input" placeholder="+7 (999) 000-00-00" value={phone} onChange={e => setPhone(e.target.value)} onFocus={handleFocus} required />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">{t('profile.address', lang)}</label>
                        <textarea className="glass-input min-h-[80px] resize-none" placeholder={t('delivery.address_placeholder', lang)} value={address} onChange={e => setAddress(e.target.value)} onFocus={handleFocus} required />
                    </div>
                    <button type="submit" className={`mt-2 flex justify-center items-center gap-2 rounded-2xl px-6 py-4 font-bold transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-white text-black hover:scale-[1.02] active:scale-95'}`}>
                        {isSaved ? <><CheckCircle2 className="w-5 h-5" /> {t('profile.saved', lang)}</> : <><Save className="w-5 h-5" /> {t('profile.save', lang)}</>}
                    </button>
                </form>
            </div>

            {/* Theme */}
            <div className="glass-panel p-5">
                <div className="flex items-center gap-3 mb-4"><Sun className="w-4 h-4 text-yellow-400" /><h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('profile.theme', lang)}</h3></div>
                <div className="grid grid-cols-3 gap-2">
                    {THEME_OPTIONS.map(opt => {
                        const Icon = opt.icon; const active = theme === opt.key
                        return (
                            <button key={opt.key} onClick={() => setTheme(opt.key)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-bold border transition-all"
                                style={active ? { backgroundColor: 'rgba(0,242,254,0.12)', color: '#00f2fe', borderColor: 'rgba(0,242,254,0.3)' } : { backgroundColor: 'rgba(24,24,27,0.8)', color: '#71717a', borderColor: 'rgba(39,39,42,1)' }}>
                                <Icon className="w-4 h-4" /><span>{t(opt.labelKey, lang)}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Language */}
            <div className="glass-panel p-5">
                <div className="flex items-center gap-3 mb-4"><Globe className="w-4 h-4 text-brand-purple" /><h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('profile.language', lang)}</h3></div>
                <div className="grid grid-cols-3 gap-2">
                    {LANG_OPTIONS.map(opt => (
                        <button key={opt.key} onClick={() => setLang(opt.key)} className="flex items-center justify-center gap-1 p-3 rounded-xl text-xs font-bold border transition-all"
                            style={lang === opt.key ? { backgroundColor: 'rgba(79,172,254,0.12)', color: '#4facfe', borderColor: 'rgba(79,172,254,0.3)' } : { backgroundColor: 'rgba(24,24,27,0.8)', color: '#71717a', borderColor: 'rgba(39,39,42,1)' }}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Admin */}
            {isAdmin && (
                <div className="glass-panel p-5 border-brand-purple/30 bg-brand-purple/5">
                    <div className="flex items-center gap-3 mb-3"><ShieldAlert className="text-brand-purple w-5 h-5" /><h3 className="font-bold text-white">{t('profile.admin_title', lang)}</h3></div>
                    <p className="text-xs text-zinc-400 mb-4">{t('profile.admin_desc', lang)}</p>
                    <Link to="/admin" className="w-full flex justify-center items-center py-3 rounded-xl bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-purple/30 text-white font-bold hover:from-brand-purple/40 hover:to-brand-cyan/40 transition-colors">
                        {t('profile.admin_open', lang)}
                    </Link>
                </div>
            )}

            {/* Info Links */}
            <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{t('profile.info', lang)}</h3>
                <div className="flex flex-col gap-3">
                    {INFO_LINKS.map((link, i) => {
                        const Icon = link.icon
                        return (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all group">
                                <div className="p-2 bg-white/5 rounded-lg"><Icon className="w-4 h-4 text-zinc-400" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{getLinkTitle(link)}</p>
                                    <p className="text-[10px] text-zinc-500">{getLinkDesc(link)}</p>
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
