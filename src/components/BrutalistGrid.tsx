import React from 'react';
import {
    Layout,
    Smartphone,
    BarChart2,
    Globe,
    Zap,
    Share2,
    MoveRight
} from 'lucide-react';

const FeatureItem = ({ number, title, description, icon: Icon }: any) => (
    <div className="group border-b-2 border-black p-8 hover:bg-[#ffdf00] transition-colors duration-0 cursor-default flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="font-mono text-4xl font-black opacity-20 group-hover:opacity-100 transition-opacity">
            {number}
        </div>
        <div className="flex-1">
            <h3 className="text-2xl font-black uppercase mb-2 flex items-center gap-4">
                {title}
                <Icon size={24} strokeWidth={3} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="font-mono text-sm leading-relaxed max-w-xl border-l-2 border-black pl-4">
                {description}
            </p>
        </div>
        <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
            <MoveRight size={48} strokeWidth={1} />
        </div>
    </div>
);

export default function BrutalistGrid() {
    const features = [
        {
            number: "01",
            title: "LINK IN BIO",
            description: "CENTRALIZE SEU CONTEÚDO. VÍDEO, ÁUDIO E TEXTO EM UM SÓ LUGAR. SEM LIMITES.",
            icon: Layout
        },
        {
            number: "02",
            title: "LOJA VIRTUAL",
            description: "VENDA SEUS PRODUTOS DIGITAIS E FÍSICOS. RECEBA PAGAMENTOS DIRETO NA CONTA.",
            icon: Zap
        },
        {
            number: "03",
            title: "ANALYTICS",
            description: "DADOS REAIS DA SUA AUDIÊNCIA. SAIBA O QUE FUNCIONA E CRESÇA MAIS RÁPIDO.",
            icon: BarChart2
        },
        {
            number: "04",
            title: "DOMÍNIO PRO",
            description: "CONECTE SEU PRÓPRIO DOMÍNIO .COM.BR E FORTALEÇA SUA MARCA PESSOAL.",
            icon: Globe
        },
        {
            number: "05",
            title: "MOBILE FIRST",
            description: "PERFEITO EM QUALQUER CELULAR. CARREGAMENTO INSTANTÂNEO PARA SEUS SEGUIDORES.",
            icon: Smartphone
        }
    ];

    return (
        <section className="bg-white border-b-2 border-black">
            <div className="border-b-2 border-black bg-black text-white p-4 font-mono text-xs uppercase tracking-widest flex justify-between">
                <span>/// TUDO QUE VOCÊ PRECISA</span>
                <span>PRONTO PARA USAR</span>
            </div>

            <div className="flex flex-col">
                {features.map((feature, index) => (
                    <FeatureItem key={index} {...feature} />
                ))}
            </div>

            <div className="p-12 md:p-24 bg-[#f0f0f0] flex flex-col items-center justify-center text-center gap-8 group hover:bg-[#009c3b] hover:text-white transition-colors border-t-2 border-black cursor-pointer">
                <h2 className="text-5xl md:text-8xl font-black uppercase leading-[0.8]">
                    Comece <br /> Agora.
                </h2>
                <div className="w-full max-w-md h-4 bg-black group-hover:bg-white mt-4"></div>
            </div>
        </section>
    );
}
