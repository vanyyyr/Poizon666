import { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 400)
        const t2 = setTimeout(() => setPhase(2), 1200)
        const t3 = setTimeout(() => setPhase(3), 2200)
        const t4 = setTimeout(() => setPhase(4), 3000)
        const t5 = setTimeout(() => onFinish(), 3600)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
    }, [onFinish])

    return (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${phase >= 4 ? 'opacity-0' : 'opacity-100'}`}
            style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 30%, #121830 60%, #0a0a0f 100%)' }}>

            {/* Animated orbs */}
            <div className="absolute w-[400px] h-[400px] rounded-full blur-[150px] transition-all duration-[2000ms]"
                style={{
                    top: '15%', left: '-5%',
                    background: 'radial-gradient(circle, rgba(0,242,254,0.4) 0%, transparent 70%)',
                    animation: 'float-1 4s ease-in-out infinite',
                }} />
            <div className="absolute w-[350px] h-[350px] rounded-full blur-[130px]"
                style={{
                    bottom: '10%', right: '-5%',
                    background: 'radial-gradient(circle, rgba(79,172,254,0.35) 0%, transparent 70%)',
                    animation: 'float-2 5s ease-in-out infinite',
                }} />
            <div className="absolute w-[250px] h-[250px] rounded-full blur-[100px]"
                style={{
                    top: '40%', left: '40%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
                    animation: 'float-3 6s ease-in-out infinite',
                }} />

            {/* Decorative rings */}
            <div className={`absolute w-48 h-48 rounded-full border border-white/5 transition-all duration-1000 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                style={{ animation: 'spin 20s linear infinite' }} />
            <div className={`absolute w-72 h-72 rounded-full border border-white/[0.03] transition-all duration-1000 delay-300 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                style={{ animation: 'spin 30s linear infinite reverse' }} />

            {/* Small floating particles */}
            {[...Array(6)].map((_, i) => (
                <div key={i}
                    className={`absolute w-1 h-1 rounded-full bg-brand-cyan/50 transition-opacity duration-1000 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        top: `${20 + (i * 12)}%`,
                        left: `${15 + (i * 13)}%`,
                        animation: `float-particle ${3 + i}s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`,
                    }} />
            ))}

            {/* Logo */}
            <div className={`relative z-10 transition-all duration-1000 ease-out ${phase >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8'}`}>
                {/* Glow behind logo */}
                <div className="absolute inset-0 blur-3xl opacity-50"
                    style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.3) 0%, transparent 60%)' }} />

                <h1 className="font-display font-bold text-5xl uppercase tracking-[0.3em] bg-gradient-to-r from-brand-cyan via-white to-brand-purple bg-[length:200%] bg-clip-text text-transparent animate-gradient relative">
                    Poizon
                </h1>
                <div className={`text-center transition-all duration-700 delay-300 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <span className="font-display font-bold text-6xl bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple bg-[length:200%] bg-clip-text text-transparent tracking-[0.2em] animate-gradient"
                        style={{ animationDelay: '0.5s' }}>
                        666
                    </span>
                </div>
            </div>

            {/* Tagline */}
            <p className={`mt-8 text-zinc-400 text-sm font-medium tracking-[0.25em] uppercase transition-all duration-700 relative z-10 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Доставка из Китая
            </p>

            {/* Subtitle */}
            <p className={`mt-2 text-zinc-600 text-[10px] tracking-widest uppercase transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                Оригиналы • Быстро • Надёжно
            </p>

            {/* Loading bar */}
            <div className={`mt-12 w-56 h-[2px] bg-zinc-800/50 rounded-full overflow-hidden transition-opacity duration-500 relative z-10 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                <div className={`h-full rounded-full transition-all ease-out ${phase >= 3 ? 'w-full duration-[1200ms]' : 'w-[15%] duration-500'}`}
                    style={{ background: 'linear-gradient(90deg, #00f2fe, #4facfe, #a855f7)' }} />
            </div>
        </div>
    )
}
