import React from 'react';
import {
    Layout,
    Smartphone,
    BarChart2,
    Globe,
    Zap,
    Share2,
    Palette
} from 'lucide-react';

const colors = ["bg-[#ffdf00]", "bg-[#97cd7a]", "bg-[#ff4757]", "bg-[#1e90ff]"];

const FeatureCard = ({ title, description, icon: Icon, index }: any) => {
    const hoverColor = colors[index % colors.length];

    return (
        <div className={`
            group relative p-8 border-2 border-[#1a1a1a] bg-white transition-all duration-300
            hover:shadow-[8px_8px_0px_0px_rgba(26,26,26,0.2)] hover:-translate-y-1 hover:-translate-x-1
            flex flex-col h-full justify-between items-start
        `}>
            {/* Hover Background */}
            <div className={`absolute inset-0 ${hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>

            <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-lg mb-6 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,0.2)] group-hover:bg-white group-hover:text-black transition-colors">
                <Icon size={32} strokeWidth={2} />
            </div>

            <div>
                <h3 className="text-2xl font-black uppercase mb-3 leading-none group-hover:text-black transition-colors">
                    {title}
                </h3>
                <p className="font-medium text-black/60 group-hover:text-black leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default function PolishedFeatures() {
    const features = [
        {
            title: "Arrasta & Solta",
            description: "Editor visual tão simples que parece mágica. Sem código, apenas criatividade.",
            icon: Palette
        },
        {
            title: "Venda Tudo",
            description: "Produtos digitais, ebooks, presets. Receba direto na sua conta bancária.",
            icon: Zap
        },
        {
            title: "Analytics Pro",
            description: "Entenda sua audiência com dados reais. Cliques, views e conversão.",
            icon: BarChart2
        },
        {
            title: "SEO Otimizado",
            description: "Rankeie melhor no Google e pareça incrível ao compartilhar seu link nas redes.",
            icon: Globe
        },
        {
            title: "Embeds Ricos",
            description: "Spotify, YouTube, Twitch. Tudo roda direto na sua página.",
            icon: Layout
        },
        {
            title: "Mobile First",
            description: "Carrega instantaneamente em qualquer celular, em qualquer lugar.",
            icon: Smartphone
        }
    ];

    return (
        <section className="py-24 px-6 md:px-12 bg-[#f8f8f8]">
            <div className="max-w-[1600px] mx-auto">

                <div className="mb-16 flex flex-col md:flex-row items-end justify-between border-b-2 border-[#1a1a1a] pb-8 gap-8">
                    <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9]">
                        Ferramentas <br />
                        de Poder.
                    </h2>
                    <p className="text-xl font-medium max-w-md text-black/70 mb-2">
                        Tudo que você precisa para transformar seguidores em clientes fiéis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <FeatureCard key={i} {...feature} index={i} />
                    ))}
                </div>

            </div>
        </section>
    );
}
