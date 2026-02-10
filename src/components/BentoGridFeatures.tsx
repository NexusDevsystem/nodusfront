import React from 'react';
import {
    Layout,
    Smartphone,
    BarChart2,
    Globe,
    Zap,
    Share2
} from 'lucide-react';

const BentoCard = ({ title, description, icon: Icon, className = "", delay = 0, variant = "default" }: any) => {
    // Variants: default (white card), colored (green card), dark (black card)
    const bgClass = variant === "colored" ? "bg-[#004d29] text-white" :
        variant === "dark" ? "bg-black text-white" :
            "bg-[#f8fafc] text-slate-900 border-slate-200";

    const textClass = variant === "default" ? "text-slate-500" : "text-white/70";
    const titleClass = variant === "default" ? "text-slate-900" : "text-white";
    const iconBg = variant === "colored" ? "bg-white/10 text-[#00ff88]" : "bg-[#00ff88]/10 text-[#006633]";

    return (
        <div className={`
            group relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-300 
            hover:shadow-xl hover:-translate-y-1
            ${bgClass} ${variant === 'default' ? 'border-slate-200' : 'border-transparent'}
            ${className}
        `} style={{ animationDelay: `${delay}ms` }}>

            <div className="relative z-10 flex h-full flex-col justify-between">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${iconBg}`}>
                    <Icon size={28} />
                </div>

                <div>
                    <h3 className={`mb-3 font-sans text-xl font-bold ${titleClass}`}>{title}</h3>
                    <p className={`text-base font-medium leading-relaxed ${textClass}`}>{description}</p>
                </div>
            </div>
        </div>
    );
};

export default function BentoGridFeatures() {
    return (
        <section className="relative bg-white py-32 px-6">
            <div className="mx-auto max-w-7xl">

                {/* Section Header */}
                <div className="mb-20 text-center">
                    <span className="text-[#004d29] font-bold tracking-widest uppercase text-sm mb-4 block">Funcionalidades</span>
                    <h2 className="mb-6 font-sans text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                        Poderoso. <br />
                        <span className="text-[#004d29]">E incrivelmente simples.</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg font-medium text-slate-500">
                        Cada pixel foi pensado para destacar o que importa: você e seu conteúdo.
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-6 md:grid-cols-3">

                    {/* Large Featured Item - Green Block */}
                    <BentoCard
                        title="Link in Bio Definitivo"
                        description="Centralize sua presença digital. Vídeos, músicas, links e muito mais em um único lugar visualmente impactante."
                        icon={Layout}
                        variant="colored"
                        className="md:col-span-2 md:row-span-2 min-h-[450px]"
                    />

                    {/* Analytics */}
                    <BentoCard
                        title="Analytics Reais"
                        description="Métricas detalhadas para você crescer."
                        icon={BarChart2}
                        className="md:col-span-1 md:row-span-1"
                    />

                    {/* Products - Highlight */}
                    <BentoCard
                        title="Loja Integrada"
                        description="Venda produtos digitais e físicos sem sair da bio."
                        icon={Zap}
                        className="md:col-span-1 md:row-span-1 border-2 border-[#ffdf00]"
                    />

                    {/* Custom Domain */}
                    <BentoCard
                        title="Domínio Próprio"
                        description="Conecte seu .com.br em segundos."
                        icon={Globe}
                        className="md:col-span-1 md:row-span-1"
                    />

                    {/* Social Integration */}
                    <BentoCard
                        title="Multi-Plataforma"
                        description="Integração nativa com todas as redes."
                        icon={Share2}
                        className="md:col-span-1 md:row-span-1"
                    />

                    {/* Mobile Optimized */}
                    <BentoCard
                        title="Mobile First"
                        description="Carregamento instantâneo no 4G/5G."
                        icon={Smartphone}
                        className="md:col-span-1 md:row-span-1"
                    />
                </div>

            </div>
        </section>
    );
}
