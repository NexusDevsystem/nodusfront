import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MinimalHero() {
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
        <section className="relative w-full min-h-screen bg-[#004d29] flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
            {/* Background Gradient Blend - Subtle */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#004d29] to-[#00381e] pointer-events-none"></div>

            {/* Glowing Aura Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ff88] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

            {/* Content Container */}
            <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-8">

                {/* Badge/Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-4 animate-fade-in-up">
                    <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium text-[#dcfce7] tracking-wide uppercase">O futuro do seu link na bio</span>
                </div>

                {/* Main Headline - Editorial Style */}
                <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-medium text-white leading-[0.9] tracking-tight mb-4">
                    Tudo que você é, <br />
                    <span className="italic text-[#00ff88] font-light">em um só link.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-2xl text-[#dcfce7]/80 max-w-2xl font-light leading-relaxed mb-10">
                    Junte seu conteúdo, produtos e redes sociais em uma página única. <br className="hidden md:block" /> Simples, bonito e incrivelmente rápido.
                </p>

                {/* Minimalist Input Form */}
                <form onSubmit={handleClaim} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-xl transition-all focus-within:bg-white/10 focus-within:border-white/30 hover:bg-white/10">
                    <div className="flex-1 flex items-center px-6 h-16 w-full">
                        <span className="text-xl font-medium text-[#00ff88]/70 whitespace-nowrap">nodus.cc/</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="seu-nome"
                            className="w-full bg-transparent border-none outline-none text-xl font-medium text-white placeholder-white/20 ml-1"
                        />
                    </div>
                    <button type="submit" className="w-full sm:w-auto h-16 px-8 rounded-[1.5rem] bg-[#dcfce7] text-[#004d29] text-lg font-bold hover:bg-white transition-all transform hover:scale-105 shadow-lg shadow-black/20">
                        Começar
                    </button>
                </form>

                {/* Social Proof / Trusted By */}
                <div className="mt-16 flex flex-col items-center gap-4 opacity-60">
                    <p className="text-sm uppercase tracking-widest text-[#dcfce7]">Usado por criadores em todo o mundo</p>
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#004d29] bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                U{i}
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-[#004d29] bg-[#00ff88] flex items-center justify-center text-xs font-bold text-[#004d29]">
                            +1k
                        </div>
                    </div>
                </div>

            </div>

            {/* Abstract Floating UI Elements (3D look) */}
            <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-[#dcfce7] to-[#00ff88] rounded-2xl rotate-12 blur-sm opacity-20 animate-float-slow hidden lg:block"></div>
            <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-bl from-[#00ff88] to-[#004d29] rounded-full blur-md opacity-20 animate-float-delayed hidden lg:block"></div>

        </section>
    );
}
