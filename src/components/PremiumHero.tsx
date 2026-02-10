import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grainient from './Grainient';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function PremiumHero() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    const handleClaim = (e: React.FormEvent) => {
        e.preventDefault();
        if (username) {
            navigate(`/onboarding?username=${username}`);
        } else {
            navigate('/onboarding');
        }
    };

    return (
        <section className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center pt-20">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 bg-[#020a05]">
                <Grainient
                    color1="#004d29"  // Deep Green
                    color2="#00ff88"  // Neon Green
                    color3="#ffdf00"  // Yellow
                    timeSpeed={0.2}
                    warpStrength={2.0}
                    warpFrequency={3.0}
                    warpAmplitude={40.0}
                    blendSoftness={0.2}
                    grainAmount={0.15}
                    gamma={0.8}
                    opacity={0.6} // Make it subtle so text pops
                />
                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020a05]/80 via-transparent to-[#020a05] z-10 pointer-events-none"></div>
            </div>

            {/* Content Contentier */}
            <div className="relative z-20 max-w-6xl mx-auto px-6 text-center flex flex-col items-center gap-10">

                {/* Floating Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-xl animate-fade-in-up hover:border-[#00ff88]/50 transition-colors cursor-default">
                    <Sparkles size={16} className="text-[#ffdf00]" />
                    <span className="text-xs font-bold tracking-widest uppercase text-white/80">O Novo Nodus Está Aqui</span>
                </div>

                {/* Animated Headline */}
                <h1 className="text-5xl md:text-8xl font-sans font-bold text-white tracking-tight leading-[0.95] drop-shadow-2xl">
                    Sua identidade, <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00ff88] via-[#eaff00] to-[#00ff88] animate-gradient-x">
                        Elevada ao Máximo.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/60 max-w-2xl font-medium leading-relaxed">
                    A plataforma definitiva para organizar sua vida digital. <br className="hidden md:block" />
                    Simples como deve ser, poderoso como você precisa.
                </p>

                {/* Premium Input Form */}
                <div className="w-full max-w-md mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] to-[#ffdf00] rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <form onSubmit={handleClaim} className="relative flex items-center bg-[#05100c] border border-white/10 rounded-2xl p-2 shadow-2xl">
                        <div className="flex-1 flex items-center px-4 h-14">
                            <span className="text-lg font-bold text-white/40 select-none">nodus.cc/</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="seunome"
                                className="w-full bg-transparent border-none outline-none text-lg font-bold text-white placeholder-white/20 ml-1 caret-[#00ff88]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-12 w-12 flex items-center justify-center bg-white text-black rounded-xl hover:bg-[#00ff88] transition-colors"
                        >
                            <ArrowRight size={24} strokeWidth={3} />
                        </button>
                    </form>
                </div>

                {/* Status/Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-8 mt-8 text-xs font-bold tracking-widest uppercase text-white/40">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                        Links Ilimitados
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#ffdf00] rounded-full animate-pulse delay-100"></div>
                        Analytics em Tempo Real
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse delay-200"></div>
                        Personalização Total
                    </div>
                </div>

            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/30">
                <ArrowRight className="rotate-90" size={24} />
            </div>

        </section>
    );
}
