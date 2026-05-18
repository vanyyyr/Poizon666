import { Link, useLocation } from 'react-router-dom'
import { Home, PackageSearch, User as UserIcon, Sparkles } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { t, useLang } from '../i18n'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation()
    const lang = useLang()

    const navItems = [
        { nameKey: 'nav.home', path: '/', icon: Home },
        { nameKey: 'nav.orders', path: '/orders', icon: PackageSearch },
        { nameKey: 'nav.profile', path: '/profile', icon: UserIcon },
    ]

    return (
        <div className="flex flex-col min-h-screen pb-20 relative">
            {/* Animated background gradient */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[128px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-cyan/10 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-brand-pink/8 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>
            
            <header className="px-6 py-4 pt-[max(1rem,env(safe-area-inset-top,1rem))] glass-panel rounded-none border-t-0 border-x-0 sticky top-0 z-50 flex items-center justify-between backdrop-blur-2xl">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-cyan animate-pulse" />
                    <h1 className="font-display font-bold text-xl uppercase tracking-[0.3em] bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink bg-[length:200%] bg-clip-text text-transparent animate-gradient neon-text-cyan">
                        Poizon666
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center w-full px-4 pt-6 pb-8 relative z-10">
                <div className="w-full max-w-md animate-fade-in-up flex flex-col gap-6">
                    {children}
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 glass-panel rounded-none border-x-0 border-b-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-purple/5 to-transparent pointer-events-none" />
                <ul className="flex items-center justify-around px-4 py-3 relative z-10">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex flex-col items-center p-3 rounded-2xl transition-all duration-500 group relative",
                                        isActive ? "text-brand-cyan scale-110" : "text-zinc-500 hover:text-white hover:scale-105"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-brand-cyan/10 rounded-2xl blur-md" />
                                    )}
                                    <item.icon className={`w-6 h-6 mb-1 relative z-10 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[10px] font-medium tracking-wider relative z-10">{t(item.nameKey, lang)}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </div>
    )
}

export default Layout
