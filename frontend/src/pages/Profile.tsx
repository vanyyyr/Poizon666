import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCircle, Save, ShieldAlert, CheckCircle2 } from 'lucide-react'
import WebApp from '@twa-dev/sdk'
import toast from 'react-hot-toast'

export default function Profile() {
    const [fullname, setFullname] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const tgUser = WebApp.initDataUnsafe?.user

    useEffect(() => {
        // Basic mock of fetching user profile. In production this calls GET /api/users/me
        const savedProfile = localStorage.getItem('poizon_profile')
        if (savedProfile) {
            const data = JSON.parse(savedProfile)
            setFullname(data.fullname || '')
            setPhone(data.phone || '')
            setAddress(data.address || '')
        } else if (tgUser) {
            setFullname(tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''))
        }

        // For demo purposes, we automatically make the current user an admin to show you the panel
        setIsAdmin(true)
    }, [tgUser])

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock save to local storage (would be PUT /api/users/me)
        localStorage.setItem('poizon_profile', JSON.stringify({ fullname, phone, address }))
        setIsSaved(true)
        toast.success('Profile saved!')
        if (window.Telegram?.WebApp) {
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
                    <h2 className="text-xl font-bold">{tgUser?.first_name || 'Секретный Агент'}</h2>
                    <span className="text-xs text-brand-cyan font-mono">ID: {tgUser?.id || '123456789'}</span>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Данные для доставки</h3>

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">ФИО (Полностью)</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Иванов Иван Иванович"
                            value={fullname}
                            onChange={e => setFullname(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Телефон</label>
                        <input
                            type="tel"
                            className="glass-input"
                            placeholder="+7 (999) 000-00-00"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Адрес (ПВЗ СДЭК или Почта)</label>
                        <textarea
                            className="glass-input min-h-[80px] resize-none"
                            placeholder="г. Москва, ул. Пушкина, д. Колотушкина, ПВЗ СДЭК"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`mt-2 flex justify-center items-center gap-2 group relative overflow-hidden rounded-2xl px-6 py-4 font-bold transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-white text-black hover:scale-[1.02] active:scale-95'}`}
                    >
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
                    <p className="text-xs text-zinc-400 mb-4">
                        Вы вошли как администратор. Вы можете изменять курс юаня и управлять комиссиями.
                    </p>
                    <Link
                        to="/admin"
                        className="w-full flex justify-center items-center py-3 rounded-xl bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-purple/30 text-white font-bold hover:from-brand-purple/40 hover:to-brand-cyan/40 transition-colors"
                    >
                        Открыть Панель Администратора
                    </Link>
                </div>
            )}
        </div>
    )
}
