import { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 300)
        const t2 = setTimeout(() => setPhase(2), 800)
        const t3 = setTimeout(() => setPhase(3), 1400)
        const t4 = setTimeout(() => onFinish(), 2200)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
    }, [onFinish])

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] overflow-hidden">
            {/* Animated background glows */}
            <div className="absolute w-[300px] h-[300px] bg-brand-cyan/30 rounded-full blur-[120px] animate-pulse"
                style={{ top: '20%', left: '10%', animationDuration: '2s' }} />
            <div className="absolute w-[250px] h-[250px] bg-brand-purple/30 rounded-full blur-[100px] animate-pulse"
                style={{ bottom: '20%', right: '10%', animationDuration: '2.5s' }} />
            <div className="absolute w-[200px] h-[200px] bg-pink-500/20 rounded-full blur-[80px] animate-pulse"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDuration: '3s' }} />

            {/* Logo */}
            <div className={`transition-all duration-700 ease-out ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                <h1 className="font-display font-bold text-5xl uppercase tracking-[0.3em] bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-cyan bg-[length:200%] bg-clip-text text-transparent animate-gradient">
                    Poizon
                </h1>
                <div className={`text-center transition-all duration-500 delay-200 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <span className="font-display font-bold text-6xl bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent tracking-[0.2em]">
                        666
                    </span>
                </div>
            </div>

            {/* Tagline */}
            <p className={`mt-8 text-zinc-500 text-sm font-medium tracking-widest uppercase transition-all duration-500 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Доставка из Китая
            </p>

            {/* Loading bar */}
            <div className={`mt-10 w-48 h-[2px] bg-zinc-800 rounded-full overflow-hidden transition-opacity duration-300 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                <div className={`h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full transition-all duration-1000 ease-out ${phase >= 3 ? 'w-full' : 'w-0'}`} />
            </div>

            {/* Fade out */}
            <div className={`absolute inset-0 bg-[#09090b] pointer-events-none transition-opacity duration-500 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    )
}
