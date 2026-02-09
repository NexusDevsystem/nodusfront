import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [openIndex, setOpenIndex] = useState<string | null>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const faqContainerRef = useRef<HTMLDivElement>(null);

    const handleClaim = (e: React.FormEvent) => {
        e.preventDefault();
        if (username) {
            navigate(`/onboarding?username=${username}`);
        } else {
            navigate('/onboarding');
        }
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            const path = pathRef.current;
            if (!path) return;

            const updatePath = () => {
                const length = path.getTotalLength();

                // Clear existing ScrollTrigger if any
                ScrollTrigger.getAll().forEach(st => st.kill());

                gsap.fromTo(path,
                    { strokeDasharray: length, strokeDashoffset: length },
                    {
                        strokeDashoffset: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top top",
                            end: "85% bottom",
                            scrub: 0,
                            invalidateOnRefresh: true,
                        }
                    }
                );
            };

            // Small delay to ensure the browser has computed the path length correctly
            const timer = setTimeout(() => {
                updatePath();
                ScrollTrigger.refresh();
            }, 500);

            window.addEventListener('resize', updatePath);
            return () => {
                window.removeEventListener('resize', updatePath);
                clearTimeout(timer);
            };
        }, containerRef);
        return () => ctx.revert();
    }, []);



    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Keep animations disabled for now if requested, or re-enable safely
            // For now, focusing on nav logic.
        }, faqContainerRef);
        return () => ctx.revert();
    }, []);

    // Removed GSAP entrance animation for FAQ items to fix visibility issues
    // useEffect(() => { ... }, []);

    return (
        <div ref={containerRef} className="min-h-screen w-full bg-white relative">
            {/* Navbar - Dynamic Scroll Behavior - Moved to Root to Fix Z-Index Stacking */}
            <nav className={`fixed top-0 left-0 w-full z-[100] flex justify-center transition-all duration-500 pointer-events-none ${isScrolled ? 'pt-6' : 'pt-4'}`}>
                <div
                    className={`
                        flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-auto
                        ${isScrolled
                            ? 'w-auto max-w-[90%] gap-4 sm:gap-8 bg-[#004d29] backdrop-blur-xl border border-[#00ff88]/20 shadow-2xl rounded-full px-2 py-2 pl-4 sm:pl-6'
                            : 'w-full max-w-[98%] px-4 sm:px-12 bg-transparent shadow-none rounded-none border-none py-0'
                        }
                    `}
                >
                    <img
                        src="/landingpage/icon.png"
                        alt="Nodus Icon"
                        className={`transition-all duration-500 cursor-pointer ${isScrolled ? 'h-6 sm:h-8 brightness-0 invert' : 'h-8 sm:h-12'}`}
                        onClick={() => navigate('/')}
                    />

                    <button
                        onClick={() => navigate('/onboarding')}
                        className={`
                            font-bold transition-all duration-500 rounded-full whitespace-nowrap
                            ${isScrolled
                                ? 'bg-[#00ff88] text-slate-900 px-4 sm:px-6 py-2 text-xs sm:text-sm hover:bg-[#00cc6a] shadow-lg hover:shadow-[#00ff88]/20'
                                : 'bg-slate-200 text-slate-900 px-4 sm:px-6 py-2 text-sm sm:text-base hover:bg-slate-300 rounded-2xl'
                            }
                        `}
                    >
                        Cadastre-se Grátis
                    </button>
                </div>
            </nav>
            {/* Animated Connecting Line SVG */}
            <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 1000 8000"
            >
                <path
                    ref={pathRef}
                    d="M 500 850 
                       C 500 1200, 850 1300, 850 1800 
                       C 850 2300, 150 2500, 150 3200 
                       C 150 3900, 850 4100, 850 4800
                       C 850 5600, 500 5800, 500 7500"
                    fill="none"
                    stroke="#004d29"
                    className="stroke-[40px] lg:stroke-[80px] transition-all duration-300"
                    strokeLinecap="round"
                    opacity="1"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* Hero Section */}
            <section className="min-h-screen w-full flex flex-col p-2 sm:p-8 relative z-10">


                {/* Main Content Area - Centered */}
                <div className="flex-1 w-full flex items-center justify-center pt-10">
                    {/* Green Container with specialized borders - color updated to match FAQ */}
                    <div className="w-full max-w-[98%] min-h-[600px] lg:min-h-[800px] bg-[#004d29] rounded-[2rem] sm:rounded-[3rem] relative flex flex-col overflow-hidden sm:overflow-visible">

                        {/* Phone Image - Overflowing to the left */}
                        <img
                            src="/landingpage/molde.png"
                            alt="App Preview"
                            className="hidden lg:block absolute -top-16 -left-8 w-[850px] max-w-none drop-shadow-2xl z-20"
                        />

                        {/* Main Content Area - Right Side */}
                        {/* Main Content Area - Right Side */}
                        <div className="absolute top-0 right-0 w-full lg:w-[85%] h-full flex flex-col justify-center sm:justify-start pt-0 sm:pt-32 lg:pt-32 px-6 sm:px-8 lg:pr-20 z-30 pointer-events-none lg:pointer-events-auto text-center lg:text-right items-center lg:items-end">
                            <h1 className="font-sans font-black text-[#e3ff00] leading-[0.9] tracking-tighter flex flex-col items-center lg:items-end drop-shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:drop-shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full gap-2 sm:gap-0">
                                <span className="text-3xl sm:text-5xl lg:text-[4rem] whitespace-nowrap mb-0 sm:mb-2 uppercase tracking-tight">Um único link.</span>
                                <div className="flex flex-col items-center lg:items-end w-full">
                                    <span className="text-4xl sm:text-6xl lg:text-[5.5rem] leading-[0.85] uppercase">Infinitas</span>
                                    <span className="text-4xl sm:text-6xl lg:text-[5.5rem] leading-[0.85] uppercase text-white drop-shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:drop-shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-1">Possibilidades.</span>

                                    <p className="font-mono text-white text-sm sm:text-base lg:text-lg font-bold w-full max-w-xs sm:max-w-xl mt-6 sm:mt-6 leading-relaxed text-center lg:text-right uppercase tracking-wide drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] sm:drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] opacity-90">
                                        Conecte suas redes sociais, site, loja e contatos em uma página personalizada em minutos.
                                    </p>

                                    {/* Claim Username Input - Brutalist Style */}
                                    <form onSubmit={handleClaim} className="w-full max-w-md sm:max-w-2xl mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch gap-4 sm:gap-4 lg:ml-auto relative z-50 pointer-events-auto pb-8 sm:pb-0">
                                        <div className="flex-1 bg-white border-2 sm:border-4 border-black box-border p-1 pl-4 sm:p-2 sm:pl-6 pr-2 sm:pr-4 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] h-14 sm:h-[4.5rem] rounded-xl sm:rounded-none">
                                            <span className="text-black text-base sm:text-xl lg:text-2xl font-black font-sans tracking-tight whitespace-nowrap select-none">nodus.cc/</span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="SEU-NOME"
                                                className="bg-transparent border-none outline-none text-base sm:text-xl lg:text-2xl font-black text-black placeholder-black/30 flex-1 ml-1 h-full uppercase tracking-tighter"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-[#e3ff00] text-black border-2 sm:border-4 border-black h-14 sm:h-[4.5rem] px-4 sm:px-8 hover:bg-[#ccff00] transition-all font-black text-lg sm:text-xl tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] sm:active:translate-x-[8px] sm:active:translate-y-[8px] active:shadow-none whitespace-nowrap uppercase rounded-xl sm:rounded-none"
                                        >
                                            CRIAR AGORA
                                        </button>
                                    </form>
                                </div>
                            </h1>
                        </div>

                        {/* Scroll Indicator */}
                        <div className="absolute bottom-8 right-8 lg:right-16 animate-bounce z-40">
                            <ChevronDown size={32} className="text-[#e3ff00] sm:w-12 sm:h-12" />
                        </div>

                    </div>
                </div>
            </section>

            {/* Second Section - Revolutionary Layout */}
            <section className="w-full py-24 sm:py-40 px-4 sm:px-8 lg:px-16 overflow-hidden relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col items-center">

                    {/* Section Title */}
                    <div className="text-center mb-20 sm:mb-32 relative">
                        <span className="text-[#00ff88] font-bold tracking-[0.5em] text-xs sm:text-sm lg:text-base uppercase mb-4 block">Processo Simples</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-8xl font-serif font-bold text-slate-900 leading-tight">
                            Crie seu Nodus <br /> em 1 minuto.
                        </h2>
                    </div>

                    {/* Features Container - Horizontal Scroll on Mobile, Vertical Staggered on Desktop */}
                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none gap-6 lg:gap-0 w-full pb-12 lg:pb-0 px-4 lg:px-0 no-scrollbar items-start lg:items-stretch">

                        {/* Feature 01 - Staggered Left */}
                        <div className="min-w-[85vw] sm:min-w-0 shrink-0 lg:shrink w-full snap-center bg-white lg:bg-transparent rounded-3xl lg:rounded-none p-8 lg:p-0 shadow-2xl lg:shadow-none border border-slate-100 lg:border-none flex flex-col lg:flex-row items-center gap-8 lg:gap-24 lg:mb-48 relative z-10 transition-transform lg:transform-none">
                            <div className="absolute -left-20 -top-20 hidden lg:block select-none opacity-40 z-20">
                                <span className="text-[20rem] font-serif font-bold text-[#00ff88] leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">01</span>
                            </div>
                            {/* Mobile Number Indicator */}
                            <div className="lg:hidden absolute top-6 right-6 text-6xl font-serif font-bold text-[#e3ff00] opacity-50 z-0">01</div>

                            <div className="lg:w-[35%] z-30 text-center lg:text-left relative">
                                <h3 className="text-2xl sm:text-4xl lg:text-6xl font-serif font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                                    Personalização <br /> sem limites
                                </h3>
                                <p className="text-base sm:text-xl lg:text-2xl text-slate-500 font-sans leading-relaxed max-w-lg mx-auto lg:mx-0">
                                    Escolha cores, temas e fontes que combinam com a sua marca. Mude tudo em tempo real.
                                </p>
                            </div>
                            <div className="lg:w-[65%] flex justify-center w-full">
                                <img
                                    src="/landingpage/links.png"
                                    alt="Editor Nodus"
                                    className="w-full h-auto max-h-[250px] sm:max-h-[600px] lg:max-h-[800px] object-contain drop-shadow-xl"
                                />
                            </div>
                        </div>

                        {/* Feature 02 - Staggered Right */}
                        <div className="min-w-[85vw] sm:min-w-0 shrink-0 lg:shrink w-full snap-center bg-white lg:bg-transparent rounded-3xl lg:rounded-none p-8 lg:p-0 shadow-2xl lg:shadow-none border border-slate-100 lg:border-none flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-24 lg:mb-48 relative z-10">
                            <div className="absolute -right-20 -top-20 hidden lg:block select-none opacity-40 z-20">
                                <span className="text-[20rem] font-serif font-bold text-[#00ff88] leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">02</span>
                            </div>
                            {/* Mobile Number Indicator */}
                            <div className="lg:hidden absolute top-6 right-6 text-6xl font-serif font-bold text-[#e3ff00] opacity-50 z-0">02</div>

                            <div className="lg:w-[35%] z-30 text-center lg:text-right relative">
                                <h3 className="text-2xl sm:text-4xl lg:text-6xl font-serif font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                                    Integração <br /> inteligente
                                </h3>
                                <p className="text-base sm:text-xl lg:text-2xl text-slate-500 font-sans leading-relaxed max-w-lg mx-auto lg:mx-0 ml-auto">
                                    Conecte todas as suas redes sociais, sites, lojas virtuais e formas de contato.
                                </p>
                            </div>
                            <div className="lg:w-[65%] flex justify-center w-full">
                                <img
                                    src="/landingpage/social.png"
                                    alt="Integração Social Nodus"
                                    className="w-full h-auto max-h-[250px] sm:max-h-[600px] lg:max-h-[800px] object-contain drop-shadow-xl"
                                />
                            </div>
                        </div>

                        {/* Feature 03 - Staggered Left */}
                        <div className="min-w-[85vw] sm:min-w-0 shrink-0 lg:shrink w-full snap-center bg-white lg:bg-transparent rounded-3xl lg:rounded-none p-8 lg:p-0 shadow-2xl lg:shadow-none border border-slate-100 lg:border-none flex flex-col lg:flex-row items-center gap-8 lg:gap-24 relative z-10">
                            <div className="absolute -left-20 -top-20 hidden lg:block select-none opacity-40 z-20">
                                <span className="text-[20rem] font-serif font-bold text-[#00ff88] leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">03</span>
                            </div>
                            {/* Mobile Number Indicator */}
                            <div className="lg:hidden absolute top-6 right-6 text-6xl font-serif font-bold text-[#e3ff00] opacity-50 z-0">03</div>

                            <div className="lg:w-[35%] z-30 text-center lg:text-left relative">
                                <h3 className="text-2xl sm:text-4xl lg:text-6xl font-serif font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                                    Loja <br /> integrada
                                </h3>
                                <p className="text-base sm:text-xl lg:text-2xl text-slate-500 font-sans leading-relaxed max-w-lg mx-auto lg:mx-0">
                                    Adicione produtos com links diretos para compra e transforme seu perfil em vendas.
                                </p>
                            </div>
                            <div className="lg:w-[65%] flex justify-center w-full">
                                <img
                                    src="/landingpage/loja.png"
                                    alt="Loja Nodus"
                                    className="w-full h-auto max-h-[250px] sm:max-h-[600px] lg:max-h-[800px] object-contain drop-shadow-xl"
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            {/* FAQ Section */}
            <section ref={faqContainerRef} className="w-full bg-[#004d29] py-24 sm:py-32 px-4 sm:px-8 lg:px-16 relative z-10 border-b border-[#00ff88]/20">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-black text-[#00ff88] mb-12 sm:mb-16 text-center tracking-tight">
                        Perguntas? <br /> Respondidas.
                    </h2>
                    <div className="flex flex-col gap-8 sm:gap-12">
                        {[
                            {
                                category: "Sobre o Nodus.cc",
                                items: [
                                    {
                                        question: "O que é o Nodus.cc e para que ele serve?",
                                        answer: "O Nodus.cc é uma plataforma de gerenciamento de links que permite centralizar toda a sua presença digital em uma única página. Como redes sociais como Instagram e TikTok limitam a biografia a apenas um link externo, o Nodus resolve esse problema criando um \"hub\" onde você pode agrupar seu site, WhatsApp, vídeos, produtos e outras redes sociais de forma organizada e visualmente atraente."
                                    },
                                    {
                                        question: "O Nodus.cc substitui um site tradicional?",
                                        answer: "Para muitos profissionais e criadores, sim. O Nodus funciona como um \"cartão de visita digital\" ou um \"mini-site\" de alta conversão. Ele é focado em direcionar seu público para ações específicas (comprar, agendar, assistir) sem a complexidade e o custo de manutenção de um site convencional."
                                    },
                                    {
                                        question: "Para quem a plataforma é indicada?",
                                        answer: "O Nodus foi desenhado para qualquer pessoa ou empresa que queira profissionalizar sua presença online. Isso inclui criadores de conteúdo, influenciadores, pequenas empresas, lojas virtuais, profissionais liberais (advogados, médicos, consultores) e artistas."
                                    }
                                ]
                            },
                            {
                                category: "Personalização e Recursos",
                                items: [
                                    {
                                        question: "Preciso saber programação ou design para usar?",
                                        answer: "De forma alguma. Nossa plataforma foi desenvolvida com o conceito \"No-Code\" (sem código). Você conta com um editor intuitivo onde pode adicionar botões, alterar cores, inserir imagens e organizar seu layout apenas arrastando e soltando elementos. Sua página fica pronta em minutos."
                                    },
                                    {
                                        question: "Posso vender produtos ou serviços diretamente pelo meu link?",
                                        answer: "Sim. O Nodus.cc oferece funcionalidades de integração para lojas e catálogos. Você pode destacar seus produtos principais, criar links diretos para checkout ou vitrines virtuais, facilitando a jornada de compra do seu cliente."
                                    },
                                    {
                                        question: "Como funciona o recurso de QR Code?",
                                        answer: "Cada perfil criado no Nodus gera automaticamente um QR Code exclusivo e personalizado. Você pode baixá-lo e utilizá-lo em materiais offline, como cardápios, cartões de visita impressos, embalagens ou banners, conectando o mundo físico ao seu digital instantaneamente."
                                    }
                                ]
                            },
                            {
                                category: "Planos e Gerenciamento",
                                items: [
                                    {
                                        question: "O Nodus.cc é gratuito?",
                                        answer: "Sim, oferecemos um plano gratuito robusto que permite criar sua página, adicionar links ilimitados e personalizar o visual básico. Também oferecemos planos Pro para usuários que desejam recursos avançados, como remoção da marca Nodus, análises detalhadas de tráfego (analytics), domínios personalizados e suporte prioritário."
                                    },
                                    {
                                        question: "Consigo acompanhar quantas pessoas clicaram nos meus links?",
                                        answer: "Com certeza. Entender sua audiência é fundamental. Disponibilizamos um painel de métricas onde você pode visualizar o número de visitas, cliques por botão e o desempenho geral da sua página, permitindo que você tome decisões baseadas em dados."
                                    },
                                    {
                                        question: "Posso usar o Nodus em mais de uma rede social?",
                                        answer: "Sim! O seu link (ex: nodus.cc/voce) é único e universal. Você pode (e deve) utilizá-lo no Instagram, TikTok, Twitter, LinkedIn, na assinatura do seu e-mail e até no WhatsApp Business."
                                    }
                                ]
                            },
                            {
                                category: "Segurança e Suporte",
                                items: [
                                    {
                                        question: "Meus dados e os dos meus visitantes estão seguros?",
                                        answer: "A segurança é nossa prioridade. Utilizamos criptografia de ponta e seguimos as melhores práticas de proteção de dados para garantir que sua conta e as informações de quem acessa seu perfil estejam sempre protegidas."
                                    },
                                    {
                                        question: "O que acontece se eu precisar de ajuda?",
                                        answer: "Nossa equipe de suporte está pronta para auxiliar. Você pode acessar nossa Central de Ajuda com tutoriais detalhados ou entrar em contato diretamente com nosso time de atendimento através do e-mail ou chat na plataforma."
                                    }
                                ]
                            }
                        ].map((category, catIndex) => (
                            <div key={catIndex} className="flex flex-col gap-6">
                                <h3 className="text-2xl font-serif font-bold text-[#00ff88]/80 pl-4">{category.category}</h3>
                                {category.items.map((item, itemIndex) => {
                                    const index = `${catIndex}-${itemIndex}`; // Unique ID for open state
                                    return (
                                        <div
                                            key={itemIndex}
                                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                            className="faq-item group bg-[#00381e] rounded-[2rem] overflow-hidden transition-all duration-300 hover:bg-[#002e18] hover:scale-[1.01] hover:shadow-xl hover:shadow-[#00ff88]/10 cursor-pointer border border-transparent hover:border-[#00ff88]/20"
                                        >
                                            <div className="flex justify-between items-center p-6 sm:p-8 select-none">
                                                <span className="text-white font-bold text-lg sm:text-xl group-hover:text-[#00ff88] transition-colors">{item.question}</span>
                                                <span className={`transform transition-transform duration-300 text-[#00ff88] shrink-0 ml-4 ${openIndex === index ? 'rotate-180' : ''}`}>
                                                    <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
                                                </span>
                                            </div>
                                            <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                                <div className="overflow-hidden">
                                                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-white/70 leading-relaxed text-base sm:text-lg">
                                                        {item.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Unified Footer Section */}
            <section className="w-full bg-[#00ff88] pt-24 pb-12 px-4 sm:px-8 lg:px-16 relative overflow-hidden z-20">

                {/* 1. CTA Header */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-4xl lg:text-6xl font-serif font-bold text-slate-900 mb-8">
                        Dê o pontapé inicial no seu <br /> cantinho da internet.
                    </h2>

                    {/* Input Form Copy */}
                    <form onSubmit={handleClaim} className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
                        <div className="bg-white p-2 pl-4 rounded-xl flex items-center w-full shadow-lg">
                            <span className="text-slate-400 font-medium whitespace-nowrap">noduscc.com.br/</span>
                            <input
                                type="text"
                                placeholder="seu-nome"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-transparent border-none outline-none font-bold text-slate-900 ml-1 flex-1 w-full"
                            />
                        </div>
                        <button type="submit" className="bg-slate-900 text-[#00ff88] font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap w-full sm:w-auto shadow-lg hover:shadow-slate-900/20">
                            Criar seu Nodus
                        </button>
                    </form>
                </div>

                {/* 2. White Floating Card */}
                <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] p-8 lg:p-16 shadow-2xl relative z-30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
                        {/* Column 1 - Redes Sociais */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-slate-900 text-lg">Redes Sociais</h4>
                            <a href="https://instagram.com" className="text-slate-500 hover:text-slate-900 hover:underline transition-colors">Instagram</a>
                            <a href="https://tiktok.com" className="text-slate-500 hover:text-slate-900 hover:underline transition-colors">TikTok</a>
                            <a href="https://twitter.com" className="text-slate-500 hover:text-slate-900 hover:underline transition-colors">Twitter</a>
                        </div>
                        {/* Column 2 - Suporte */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-slate-900 text-lg">Suporte</h4>
                            <a href="#" className="text-slate-500 hover:text-slate-900 hover:underline transition-colors">Central de Ajuda</a>
                        </div>
                        {/* Column 3 - Legal */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-slate-900 text-lg">Legal</h4>
                            <a href="/terms" className="text-slate-500 hover:text-slate-900 hover:underline transition-colors">Termos & Condições</a>
                            <a href="/privacy" className="text-slate-500 hover:text-slate-900 hover:underline transition-colors">Privacidade</a>
                        </div>
                    </div>

                    {/* Card Bottom Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-100 pt-8">
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/login')} className="px-6 py-3 bg-slate-100 rounded-lg font-bold text-slate-900 hover:bg-slate-200 transition-colors">
                                Entrar
                            </button>
                            <button onClick={() => navigate('/onboarding')} className="px-6 py-3 bg-slate-900 rounded-full font-bold text-[#00ff88] hover:bg-slate-800 transition-colors shadow-md">
                                Começar grátis
                            </button>
                        </div>

                        {/* Logo */}
                        <img
                            src="/icons/logo%20sem%20fundo.png"
                            alt="Nodus Logo"
                            className="h-20 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>



                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 text-slate-900 text-9xl font-serif opacity-10 pointer-events-none select-none hidden lg:block">*</div>
                <div className="absolute bottom-40 right-10 text-slate-900 text-9xl font-serif opacity-10 pointer-events-none select-none hidden lg:block">☺</div>

            </section>


        </div>
    );
}
