import { useState, useEffect } from 'react'
import { Sparkles, Zap } from 'lucide-react'

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 300)
        const t2 = setTimeout(() => setPhase(2), 900)
        const t3 = setTimeout(() => setPhase(3), 1800)
        const t4 = setTimeout(() => setPhase(4), 2400)
        const t5 = setTimeout(() => onFinish(), 3000)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
    }, [onFinish])

    return (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${phase >= 4 ? 'opacity-0' : 'opacity-100'}`}
            style={{ background: 'linear-gradient(135deg, #030712 0%, #0f172a 40%, #1e1b4b 70%, #030712 100%)' }}>

            {/* Animated orbs with enhanced blur */}
            <div className="absolute w-[500px] h-[500px] rounded-full blur-[200px] transition-all duration-[2500ms]"
                style={{
                    top: '10%', left: '-10%',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.5) 0%, transparent 70%)',
                    animation: 'float-1 5s ease-in-out infinite',
                }} />
            <div className="absolute w-[450px] h-[450px] rounded-full blur-[180px]"
                style={{
                    bottom: '5%', right: '-10%',
                    background: 'radial-gradient(circle, rgba(0, 242, 254, 0.45) 0%, transparent 70%)',
                    animation: 'float-2 6s ease-in-out infinite',
                }} />
            <div className="absolute w-[350px] h-[350px] rounded-full blur-[150px]"
                style={{
                    top: '35%', left: '35%',
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%)',
                    animation: 'float-3 7s ease-in-out infinite',
                }} />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" 
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 242, 254, 0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 242, 254, 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                }} />

            {/* Decorative rings with glow */}
            <div className={`absolute w-56 h-56 rounded-full border border-brand-cyan/10 transition-all duration-1000 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                style={{ animation: 'spin 25s linear infinite', boxShadow: '0 0 60px rgba(0, 242, 254, 0.2)' }} />
            <div className={`absolute w-80 h-80 rounded-full border border-brand-purple/10 transition-all duration-1000 delay-300 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                style={{ animation: 'spin 35s linear infinite reverse', boxShadow: '0 0 80px rgba(124, 58, 237, 0.15)' }} />
            <div className={`absolute w-96 h-96 rounded-full border border-brand-pink/5 transition-all duration-1000 delay-500 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                style={{ animation: 'spin 45s linear infinite' }} />

            {/* Floating particles with sparkle effect */}
            {[...Array(8)].map((_, i) => (
                <div key={i}
                    className={`absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-opacity duration-1000 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        top: `${15 + (i * 10)}%`,
                        left: `${10 + (i * 12)}%`,
                        animation: `float-particle ${4 + i}s ease-in-out infinite`,
                        animationDelay: `${i * 0.4}s`,
                        boxShadow: '0 0 20px rgba(0, 242, 254, 0.8)',
                    }} />
            ))}

            {/* Logo with enhanced effects */}
            <div className={`relative z-10 transition-all duration-1000 ease-out ${phase >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8'}`}>
                {/* Multi-layer glow behind logo */}
                <div className="absolute inset-0 blur-[80px] opacity-60"
                    style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.4) 0%, rgba(124,58,237,0.3) 50%, transparent 70%)' }} />
                <div className="absolute inset-0 blur-[40px] opacity-40"
                    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 60%)' }} />

                {/* Icon badge */}
                <div className={`absolute -top-16 left-1/2 -translate-x-1/2 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 border border-white/10 backdrop-blur-sm">
                        <Sparkles className="w-8 h-8 text-brand-cyan animate-pulse" />
                    </div>
                </div>

                <h1 className="font-display font-bold text-6xl uppercase tracking-[0.4em] bg-gradient-to-r from-brand-cyan via-white to-brand-purple bg-[length:300%] bg-clip-text text-transparent animate-gradient relative neon-text-cyan drop-shadow-[0_0_30px_rgba(0,242,254,0.5)]">
                    Poizon
                </h1>
                
                {/* "666" with fire effect */}
                <div className={`text-center transition-all duration-700 delay-300 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div className="relative inline-block">
                        <span className="font-display font-black text-7xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan bg-[length:300%] bg-clip-text text-transparent tracking-[0.3em] animate-gradient drop-shadow-[0_0_40px_rgba(236,72,153,0.6)]"
                            style={{ animationDelay: '0.5s' }}>
                            666
                        </span>
                        {/* Fire glow underneath */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-t from-brand-pink/40 to-transparent blur-xl" />
                    </div>
                </div>
            </div>

            {/* Tagline with shimmer */}
            <p className={`mt-10 text-zinc-300 text-xs font-semibold tracking-[0.35em] uppercase transition-all duration-700 relative z-10 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <span className="relative">
                    Доставка из Китая
                    <span className="absolute -inset-1 bg-gradient-to-r from-brand-cyan/0 via-brand-cyan/20 to-brand-cyan/0 blur-sm animate-pulse" />
                </span>
            </p>

            {/* Subtitle with icons */}
            <div className={`mt-3 flex items-center gap-3 text-zinc-500 text-[9px] tracking-widest uppercase transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                <Zap className="w-3 h-3 text-brand-cyan" />
                <span>Оригиналы</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span>Быстро</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span>Надёжно</span>
                <Zap className="w-3 h-3 text-brand-purple" />
            </div>

            {/* Enhanced loading bar */}
            <div className={`mt-14 w-64 h-1 bg-zinc-800/60 rounded-full overflow-hidden transition-opacity duration-500 relative z-10 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                {/* Glow track */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 via-brand-purple/20 to-brand-pink/20 blur-[2px]" />
                <div className={`h-full rounded-full transition-all ease-out relative overflow-hidden ${phase >= 3 ? 'w-full duration-[1500ms]' : 'w-[20%] duration-700'}`}
                    style={{ background: 'linear-gradient(90deg, #00f2fe, #7c3aed, #ec4899, #00f2fe)', backgroundSize: '200% 100%' }}>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[gradient-shift_1s_ease_infinite]" />
                </div>
            </div>

            {/* Loading percentage */}
            <p className={`mt-4 text-[10px] text-zinc-600 font-mono transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                {phase >= 3 ? '100%' : phase >= 2 ? '75%' : '25%'}
            </p>
        </div>
    )
}
