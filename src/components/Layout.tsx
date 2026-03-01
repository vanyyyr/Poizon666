import { Link, useLocation } from 'react-router-dom'
import { Home, PackageSearch, User as UserIcon } from 'lucide-react'
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
        <div className="flex flex-col min-h-screen pb-20">
            <header className="px-6 py-4 pt-[max(1rem,env(safe-area-inset-top,1rem))] glass-panel rounded-none border-t-0 border-x-0 sticky top-0 z-50 flex items-center justify-center">
                <h1 className="font-display font-bold text-xl uppercase tracking-[0.2em] bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
                    Poizon666
                </h1>
            </header>

            <main className="flex-1 flex flex-col items-center w-full px-4 pt-6 pb-8">
                <div className="w-full max-w-md animate-fade-in-up flex flex-col gap-6">
                    {children}
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 glass-panel rounded-none border-x-0 border-b-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
                <ul className="flex items-center justify-around px-4 py-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex flex-col items-center p-2 rounded-xl transition-all duration-300",
                                        isActive ? "text-brand-cyan scale-110" : "text-zinc-500 hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[10px] font-medium tracking-wider">{t(item.nameKey, lang)}</span>
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
