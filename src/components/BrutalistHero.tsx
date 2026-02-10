import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

export default function BrutalistHero() {
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
        <section className="relative w-full min-h-screen bg-[#f0f0f0] text-black font-sans flex flex-col pt-20 border-b-2 border-black">

            {/* Top Bar / Ticker Placeholder */}
            <div className="w-full border-y-2 border-black bg-[#ffdf00] overflow-hidden py-2">
                <div className="whitespace-nowrap animate-marquee flex gap-8 font-mono font-bold uppercase text-sm tracking-widest">
                    <span>/// SUA BIO, SEU IMPÉRIO /// VENDA MAIS /// DESIGN PREMIUM /// NODUS ///</span>
                    <span>/// SUA BIO, SEU IMPÉRIO /// VENDA MAIS /// DESIGN PREMIUM /// NODUS ///</span>
                    <span>/// SUA BIO, SEU IMPÉRIO /// VENDA MAIS /// DESIGN PREMIUM /// NODUS ///</span>
                    <span>/// SUA BIO, SEU IMPÉRIO /// VENDA MAIS /// DESIGN PREMIUM /// NODUS ///</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row">

                {/* Left Col: Impact Typography */}
                <div className="lg:w-2/3 p-6 md:p-12 lg:p-24 flex flex-col justify-center border-r-2 border-black">
                    <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black leading-[0.85] tracking-tighter mb-12 uppercase">
                        Sua <br />
                        Identidade <br />
                        <span className="text-transparent bg-clip-text bg-black text-stroke-1 text-stroke-black hover:bg-black hover:text-white transition-colors cursor-default">Digital.</span>
                    </h1>

                    <p className="font-mono text-xl md:text-2xl font-bold max-w-xl mb-12 leading-tight">
                        A ferramenta definitiva para criadores. <br />
                        Simples. Rápido. Brutal.
                    </p>

                    <form onSubmit={handleClaim} className="w-full max-w-2xl flex flex-col md:flex-row border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                        <div className="flex-1 flex items-center px-6 h-20 md:h-24 border-b-2 md:border-b-0 md:border-r-2 border-black">
                            <span className="font-black text-2xl md:text-3xl text-black/40">nodus.cc/</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="USERNAME"
                                className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-black text-black placeholder-black/20 ml-2 uppercase"
                            />
                        </div>
                        <button type="submit" className="h-20 md:h-24 px-12 bg-[#009c3b] text-white text-2xl font-black uppercase hover:bg-black hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2">
                            CRIAR <ArrowRight size={32} strokeWidth={3} />
                        </button>
                    </form>
                </div>

                {/* Right Col: Raw Visuals */}
                <div className="lg:w-1/3 border-t-2 lg:border-t-0 border-black bg-white relative overflow-hidden flex flex-col">
                    <div className="flex-1 border-b-2 border-black p-8 flex items-center justify-center bg-[#00ff88] group">
                        <Star size={120} strokeWidth={1} className="text-black fill-transparent group-hover:fill-black transition-all duration-300 animate-spin-slow" />
                    </div>
                    <div className="flex-1 p-8 font-mono text-sm leading-relaxed flex flex-col justify-between">
                        <div>
                            <p className="font-bold border-b-2 border-black pb-2 mb-4">/// SPECS</p>
                            <ul className="space-y-2 uppercase font-bold text-xs">
                                <li className="flex justify-between"><span>Latency</span> <span>&lt;10ms</span></li>
                                <li className="flex justify-between"><span>Uptime</span> <span>99.9%</span></li>
                                <li className="flex justify-between"><span>Framework</span> <span>REACT 19</span></li>
                            </ul>
                        </div>
                        <div className="mt-8 pt-4 border-t-2 border-black">
                            <p className="font-bold text-xs uppercase opacity-50">Authorized Personnel Only</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
