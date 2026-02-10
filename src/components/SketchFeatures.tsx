import React from 'react';
import { LucideIcon, Zap, Share2, BarChart3, Lock } from 'lucide-react';

interface FeatureProps {
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    rotation: string;
}

const FeatureCard = ({ title, description, icon: Icon, color, rotation }: FeatureProps) => (
    <div className={`bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform ${rotation} hover:scale-105 hover:rotate-0 transition-all duration-300 flex flex-col items-start gap-4 h-full`}>
        <div className={`w-16 h-16 ${color} border-4 border-black flex items-center justify-center rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <Icon size={32} className="text-black" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-black font-sans uppercase tracking-tight">{title}</h3>
        <p className="text-lg font-mono font-bold text-slate-600 leading-tight">{description}</p>
    </div>
);

export default function SketchFeatures() {
    const features = [
        {
            title: "Super Rápido",
            description: "Carregamento instantâneo para ninguém perder tempo.",
            icon: Zap,
            color: "bg-[#ffdf00]",
            rotation: "rotate-1"
        },
        {
            title: "Tudo Conectado",
            description: "Instagram, TikTok, WhatsApp e seus produtos em um só lugar.",
            icon: Share2,
            color: "bg-[#009c3b]",
            rotation: "-rotate-2"
        },
        {
            title: "Dados Reais",
            description: "Saiba exatamente quem clica e o que converte mais.",
            icon: BarChart3,
            color: "bg-[#002776]", // Icon inside will be black, bg is blue
            rotation: "rotate-2"
        },
        {
            title: "Segurança Total",
            description: "Seus dados protegidos com tecnologia de ponta.",
            icon: Lock,
            color: "bg-[#ffdf00]",
            rotation: "-rotate-1"
        }
    ];

    return (
        <section className="py-32 bg-[#fff] relative overflow-hidden">
            {/* Scribble Background */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none rotate-45">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#000" d="M42.7,-62.9C50.9,-52.8,49.6,-34.4,54.6,-18.6C59.6,-2.8,70.9,10.5,70.3,23.3C69.6,36.2,57.1,48.6,44.2,56.5C31.3,64.4,18.1,67.8,3.2,63.4C-11.7,59,-28.3,46.8,-42.1,33.5C-55.9,20.2,-66.9,5.8,-63.9,-6.8C-60.9,-19.4,-43.8,-30.2,-29.7,-38.7C-15.6,-47.2,-4.5,-53.4,9.6,-66.6L23.7,-79.8" transform="translate(100 100)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20 text-center">
                    <h2 className="text-5xl md:text-7xl font-sans font-black uppercase mb-6 relative inline-block">
                        <span className="relative z-10">O Poder do Simples</span>
                        <div className="absolute bottom-2 left-0 w-full h-8 bg-[#ffdf00] -z-0 transform -rotate-1"></div>
                    </h2>
                    <p className="text-xl font-mono font-bold text-slate-500 max-w-2xl mx-auto">
                        Ferramentas poderosas com interface amigável.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}
