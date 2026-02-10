import React from 'react';
import { Layout, Smartphone, BarChart2, Globe } from 'lucide-react';

export default function MinimalFeatures() {
    const features = [
        {
            title: "Simplicidade",
            description: "Crie em minutos, não horas.",
            icon: Smartphone,
            colSpan: "md:col-span-1"
        },
        {
            title: "Analytics Poderoso",
            description: "Saiba de onde vêm seus cliques.",
            icon: BarChart2,
            colSpan: "md:col-span-1"
        },
        {
            title: "Personalização Total",
            description: "Seu estilo, suas regras. Cores, fontes e layouts infinitos.",
            icon: Layout,
            colSpan: "md:col-span-2"
        },
        {
            title: "Domínio Próprio",
            description: "Conecte seu .com.br pro.",
            icon: Globe,
            colSpan: "md:col-span-2"
        },
    ];

    return (
        <section className="py-24 bg-[#f8fafc] px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#004d29] mb-4">
                        Tudo que você precisa.
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto font-light text-lg">
                        Ferramentas essenciais para crescer sua audiência sem complicar sua vida.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className={`${feature.colSpan} bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 flex flex-col justify-between h-64 group`}>
                            <div className="w-12 h-12 bg-[#dcfce7] rounded-2xl flex items-center justify-center text-[#004d29] group-hover:scale-110 transition-transform">
                                <feature.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-500 font-light">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
