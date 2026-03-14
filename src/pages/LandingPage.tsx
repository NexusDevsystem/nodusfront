import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PolishedHero from '../components/PolishedHero';
import PolishedFeatures from '../components/PolishedFeatures';
import ShowcaseCards from '../components/ShowcaseCards';

import VectorFooter from '../components/VectorFooter';
import { ChevronDown, ArrowRight, Instagram, Youtube, Twitter } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const faqs = [
        {
            q: "O que é o Nodus.my e para que ele serve?",
            a: "O Nodus.my é uma plataforma de gerenciamento de links que permite centralizar toda a sua presença digital em uma única página. Como redes sociais como Instagram e TikTok limitam a biografia a apenas um link externo, o Nodus resolve esse problema criando um \"hub\" onde você pode agrupar seu site, WhatsApp, vídeos, produtos e outras redes sociais de forma organizada e visualmente atraente."
        },
        {
            q: "O Nodus.my substitui um site tradicional?",
            a: "Para muitos profissionais e criadores, sim. O Nodus funciona como um \"cartão de visita digital\" ou um \"mini-site\" de alta conversão. Ele é focado em direcionar seu público para ações específicas (comprar, agendar, assistir) sem a complexidade e o custo de manutenção de um site convencional."
        },
        {
            q: "Para quem a plataforma é indicada?",
            a: "O Nodus foi desenhado para qualquer pessoa ou empresa que queira profissionalizar sua presença online. Isso inclui criadores de conteúdo, influenciadores, pequenas empresas, lojas virtuais, profissionais liberais (advogados, médicos, consultores) e artistas."
        },
        {
            q: "Preciso saber programação ou design para usar?",
            a: "De forma alguma. Nossa plataforma foi desenvolvida com o conceito \"No-Code\" (sem código). Você conta com um editor intuitivo onde pode adicionar botões, alterar cores, inserir imagens e organizar seu layout apenas arrastando e soltando elementos. Sua página fica pronta em minutos."
        },
        {
            q: "Posso vender produtos ou serviços diretamente pelo meu link?",
            a: "Sim. O Nodus.my oferece funcionalidades de integração para lojas e catálogos. Você pode destacar seus produtos principais, criar links diretos para checkout ou vitrines virtuais, facilitando a jornada de compra do seu cliente."
        },
        {
            q: "Como funciona o recurso de QR Code?",
            a: "Cada perfil criado no Nodus gera automaticamente um QR Code exclusivo e personalizado. Você pode baixá-lo e utilizá-lo em materiais offline, como cardápios, cartões de visita impressos, embalagens ou banners, conectando o mundo físico ao seu digital instantaneamente."
        },
        {
            q: "O Nodus.my é gratuito?",
            a: "Sim, oferecemos um plano gratuito robusto que permite criar sua página, adicionar links ilimitados e personalizar o visual básico. Também oferecemos planos Pro para usuários que desejam recursos avançados, como remoção da marca Nodus, análises detalhadas de tráfego (analytics), domínios personalizados e suporte prioritário."
        },
        {
            q: "Consigo acompanhar quantas pessoas clicaram nos meus links?",
            a: "Com certeza. Entender sua audiência é fundamental. Disponibilizamos um painel de métricas onde você pode visualizar o número de visitas, cliques por botão e o desempenho geral da sua página, permitindo que você tome decisões baseadas em dados."
        },
        {
            q: "Posso usar o Nodus em mais de uma rede social?",
            a: "Sim! O seu link (ex: nodus.my/voce) é único e universal. Você pode (e deve) utilizá-lo no Instagram, TikTok, Twitter, LinkedIn, na assinatura do seu e-mail e até no WhatsApp Business."
        },
        {
            q: "Meus dados e os dos meus visitantes estão seguros?",
            a: "A segurança é nossa prioridade. Utilizamos criptografia de ponta e seguimos as melhores práticas de proteção de dados para garantir que sua conta e as informações de quem acessa seu perfil estejam sempre protegidas."
        },
        {
            q: "O que acontece se eu precisar de ajuda?",
            a: "Nossa equipe de suporte está pronta para auxiliar. Você pode acessar nossa Central de Ajuda com tutoriais detalhados ou entrar em contato diretamente com nosso time de atendimento através do e-mail ou chat na plataforma."
        }
    ];

    return (
        <div className="min-h-screen w-full bg-white font-sans text-black selection:bg-black selection:text-[#ffdf00]">

            {/* Nav V2 - Clean & Sticky */}
            <nav className="sticky top-0 w-full z-[100] border-b-2 border-[#1a1a1a] bg-white md:bg-white/90 md:backdrop-blur-md">
                <div className="flex items-center justify-between h-20 px-6 max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src="/icons/logo.png"
                            alt="NODUS"
                            className="h-16 w-auto object-contain transition-transform group-hover:scale-105" loading="lazy" decoding="async" />
                    </div>

                    <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-wide">
                        {['Features', 'Showcase', 'Preços'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="hover:bg-[#ffdf00] px-2 py-1 transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => navigate('/onboarding')}
                            className="bg-[#97cd7a] text-white font-bold text-sm px-6 py-3 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all uppercase"
                        >
                            Começar
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero V2 */}
            <PolishedHero />



            {/* Features V2 */}
            <div id="features">
                <PolishedFeatures />
            </div>



            {/* Showcase Section - Pop Color Block */}
            <section id="showcase" className="border-y-2 border-[#1a1a1a] bg-[#ffdf00] py-24 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
                </div>

                <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <span className="bg-black text-white px-3 py-1 font-bold text-xs uppercase mb-6 inline-block transform -rotate-2">
                            Showcase
                        </span>
                        <h2 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] mb-8 text-black">
                            Faça <br />
                            Bonito.
                        </h2>
                        <p className="text-xl font-bold max-w-md border-l-4 border-[#1a1a1a] pl-6 mb-8">
                            Não é só sobre links. É sobre expressar quem você é com as melhores ferramentas de design da web.
                        </p>
                        <button className="text-xl font-black uppercase flex items-center gap-3 border-b-4 border-[#1a1a1a] pb-1 hover:text-white transition-colors">
                            Ver Exemplos <ArrowRight size={24} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="relative lg:h-[700px] h-[680px] flex items-center justify-center">
                        <ShowcaseCards />
                    </div>
                </div>
            </section>

            {/* FAQ V2 - Clean Accordion */}
            <section className="bg-white py-24 px-6 border-b-2 border-[#1a1a1a]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black uppercase mb-4">Dúvidas?</h2>
                        <div className="w-24 h-2 bg-[#97cd7a] mx-auto"></div>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((item, i) => (
                            <div key={i} className="group border-2 border-[#1a1a1a] bg-white hover:shadow-[8px_8px_0px_0px_#000] transition-all cursor-pointer rounded-lg" onClick={() => setOpenIndex(openIndex === i.toString() ? null : i.toString())}>
                                <div className="p-6 flex justify-between items-center">
                                    <h3 className="text-xl font-bold uppercase">{item.q}</h3>
                                    <ChevronDown className={`transition-transform duration-300 border-2 border-[#1a1a1a] rounded-full p-1 bg-[#ffdf00] ${openIndex === i.toString() ? 'rotate-180' : ''}`} size={32} />
                                </div>
                                <div className={`overflow-hidden transition-all duration-300 ${openIndex === i.toString() ? 'max-h-96 border-t-2 border-[#1a1a1a] bg-[#f9f9f9]' : 'max-h-0'}`}>
                                    <p className="p-6 font-medium text-lg leading-relaxed text-black/80">{item.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Strip - Brutalist */}
            <div className="bg-[#97cd7a] border-y-2 border-[#1a1a1a] py-32 text-center px-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '24px 24px' }}>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-block bg-black text-white px-4 py-1 font-bold text-sm uppercase mb-8 transform -rotate-2">
                        Não perca tempo
                    </div>

                    <h2 className="text-6xl md:text-8xl font-black uppercase mb-12 tracking-tighter leading-[0.9] text-black drop-shadow-sm">
                        Comece <span className="text-white text-stroke-black">Agora.</span>
                    </h2>

                    <p className="text-xl md:text-2xl font-bold mb-12 max-w-2xl mx-auto leading-tight border-l-4 border-[#1a1a1a] pl-6 text-left md:text-center md:border-l-0 md:pl-0">
                        Junte-se a milhares de criadores e centralize sua presença digital em minutos.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="w-full md:w-auto bg-black text-white text-xl font-black px-12 py-6 rounded-2xl hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#ffffff] transition-all uppercase border-2 border-[#1a1a1a]"
                        >
                            Criar meu Nodus
                        </button>

                    </div>
                </div>
            </div>

            {/* Footer */}
            <VectorFooter />

        </div>
    );
}
