import React from 'react';

export default function PolishedHero() {

    return (
        <section className="w-full min-h-[calc(100vh-80px)] bg-white text-black font-sans flex flex-col">

            <div className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-0 border-x-2 border-[#1a1a1a] border-b-2">

                {/* Left: Copy & Value Prop */}
                <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center border-b-2 lg:border-b-0 lg:border-r-2 border-[#1a1a1a] bg-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    <div className="relative z-10">


                        <h1 className="text-5xl md:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight mb-8">
                            Sua Bio.<br />
                            Seu Negócio.<br />
                            <span className="text-[#97cd7a]">Seu Império.</span>
                        </h1>

                        <p className="text-lg md:text-xl font-medium text-black/70 mb-10 max-w-lg leading-relaxed">
                            Nodus é o construtor de páginas para quem leva a internet a sério.
                            Design de estúdio, vendas integradas e zero código.
                        </p>

                        {/* Input Form Removed */}


                    </div>
                </div>

                {/* Right: Visual Showcase */}
                <div className="bg-[#f0f0f0] relative overflow-hidden flex items-center justify-center p-8 lg:p-0">
                    <div className="absolute inset-0 bg-[#97cd7a]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}></div>

                    {/* Mockup Composition */}
                    <div className="relative z-10 transform lg:translate-x-12">
                        {/* Phone Frame */}
                        <div className="relative w-[340px] h-[680px] bg-black rounded-[3.5rem] border-[14px] border-[#1a1a1a] shadow-[25px_25px_0px_0px_rgba(26,26,26,0.2)] overflow-hidden ring-1 ring-white/20">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-2xl z-20"></div>

                            {/* Screen Content */}
                            <div className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center rounded-[3rem]">
                                <img src="/landingpage/iPhone-13-PRO-www.noduscc.com.br.png"
                                    alt="Nodus Mobile Preview"
                                    className="w-full h-full object-cover transform scale-105" loading="lazy" decoding="async" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>


        </section>
    );
}
