import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { Settings2, Save, Users, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import WebApp from '@twa-dev/sdk'

export default function Admin() {
    const [exchangeRate, setExchangeRate] = useState(0)
    const [commission, setCommission] = useState(0)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        // In a real app, verify Telegram user ID is an admin ID
        // const userId = WebApp.initDataUnsafe?.user?.id
        // For demo MVP purposes, we'll allow all until restricted backend logic is implemented
        setIsAdmin(true)

        api.get('/settings')
            .then(res => {
                setExchangeRate(res.data.exchange_rate)
                setCommission(res.data.commission)
                setLoading(false)
            })
            .catch(console.error)
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put('/settings', { exchange_rate: exchangeRate, commission: commission })
            toast.success('Settings updated successfully!')
            if ((window as any).Telegram?.WebApp) {
                WebApp.HapticFeedback.notificationOccurred('success')
            }
        } catch (err) {
            toast.error('Failed to update settings')
        } finally {
            setSaving(false)
        }
    }

    if (!isAdmin) {
        return <div className="text-center text-red-500 mt-10">Access Denied</div>
    }

    if (loading) {
        return <div className="text-center text-zinc-500 mt-10 animate-pulse">Loading admin panel...</div>
    }

    return (
        <div className="w-full flex flex-col gap-6 stagger-1">

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-cyan/20 blur-xl rounded-full" />
                    <Users className="w-6 h-6 text-brand-cyan mb-2" />
                    <span className="text-2xl font-bold font-display">8.3k</span>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Subscribers</span>
                </div>
                <div className="glass-panel p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-brand-purple/20 blur-xl rounded-full" />
                    <TrendingUp className="w-6 h-6 text-brand-purple mb-2" />
                    <span className="text-2xl font-bold font-display">12</span>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Orders Today</span>
                </div>
            </div>

            {/* Global Settings */}
            <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                        <Settings2 className="text-yellow-500 w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Pricing Variables</h2>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block flex justify-between">
                            Exchange Rate (Yuan to Ruble)
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
                            Fixed Commission (Rubles)
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
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" /> Save Configuration
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Notice */}
            <p className="text-center text-[10px] text-zinc-600 px-4">
                Changes to these variables apply instantly to the calculator for all users.
            </p>

        </div>
    )
}
