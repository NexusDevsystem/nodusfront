import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfiniteMarquee from './InfiniteMarquee';

export default function BrazilianHero() {
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
        <section className="relative w-full min-h-screen bg-[#009c3b] overflow-hidden flex flex-col pt-20">
            {/* Background Texture - Tropical Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #ffdf00 2px, transparent 2px)',
                    backgroundSize: '30px 30px'
                }}>
            </div>

            {/* Floating Vector Elements (Leaves/Shapes) */}
            <div className="absolute top-20 left-10 w-32 h-32 opacity-20 animate-float-slow hidden md:block">
                <svg viewBox="0 0 100 100" fill="#ffdf00">
                    <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z" />
                </svg>
            </div>
            <div className="absolute bottom-40 right-10 w-48 h-48 opacity-20 animate-float-delayed hidden md:block">
                <svg viewBox="0 0 100 100" fill="#002776">
                    <rect x="10" y="10" width="80" height="80" transform="rotate(15 50 50)" />
                </svg>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 text-center">

                {/* Brand Header */}
                <div className="mb-8 inline-block bg-white border-4 border-black box-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-6 py-2 transform -rotate-2">
                    <span className="font-serif font-black text-xl md:text-2xl text-[#002776] tracking-tighter">
                        ORGULHOSAMENTE BRASILEIRO 🇧🇷
                    </span>
                </div>

                <h1 className="text-5xl md:text-8xl lg:text-[7rem] font-sans font-black text-white leading-[0.9] tracking-tighter drop-shadow-[4px_4px_0px_#002776] mb-8">
                    SEU LINK <br />
                    <span className="text-[#ffdf00] text-stroke-black">TROPICAL.</span>
                </h1>

                <p className="text-xl md:text-2xl font-mono font-bold text-white max-w-2xl mx-auto mb-12 bg-black/20 p-4 rounded-xl border-2 border-white/30 backdrop-blur-sm">
                    A plataforma definitiva para criadores que querem <br className="hidden md:block" />
                    dominar o mundo digital com borogodó.
                </p>

                {/* Input Area - Sketch Style */}
                <form onSubmit={handleClaim} className="flex flex-col md:flex-row gap-4 items-center justify-center w-full max-w-3xl">
                    <div className="flex-1 w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-2 pl-6 flex items-center h-20 transform hover:-rotate-1 transition-transform">
                        <span className="font-black text-2xl md:text-3xl text-[#009c3b] whitespace-nowrap">nodus.cc/</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="VOCE"
                            className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-black text-slate-900 placeholder-slate-300 ml-2 uppercase"
                        />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-[#002776] text-[#ffdf00] border-4 border-black h-20 px-10 text-2xl font-black uppercase tracking-widest hover:bg-[#ffdf00] hover:text-[#002776] transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                        CRIAR
                    </button>
                </form>

            </div>

            {/* Marquee Section at Hero Bottom */}
            <div className="mt-12 rotate-[-1deg] scale-105 z-20">
                <InfiniteMarquee text="• TECNOLOGIA TROPICAL • FEITO NO BRASIL • 100% SEGURO" speed={15} />
            </div>
            <div className="rotate-[1deg] scale-105 z-10 -mt-8">
                <InfiniteMarquee text="• CRIE SEU PERFIL • VENDA PRODUTOS • ANALISE DADOS" speed={20} direction="right" bgColor="bg-[#002776]" textColor="text-white" />
            </div>

        </section>
    );
}
