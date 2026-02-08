import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Check,
    ChevronDown,
    Globe,
    Share2,
    BarChart3,
    Zap,
    Layout,
    Instagram,
    Twitter,
    MessageCircle,
    ShoppingBag,
    Music,
    Video,
    Smartphone,
    Layers,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [username, setUsername] = useState('');

    // Refs for animations
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const phoneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero Animation - Soft Fade Up
            gsap.fromTo(heroRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
            );

            // Phone Float Animation
            gsap.to(phoneRef.current, {
                y: -15,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Feature Cards Stagger
            gsap.from(".feature-card", {
                scrollTrigger: {
                    trigger: ".features-section",
                    start: "top 80%"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out"
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleClaim = (e: React.FormEvent) => {
        e.preventDefault();
        if (username) {
            navigate(`/onboarding?username=${username}`);
        } else {
            navigate('/onboarding');
        }
    };

    return (
        <div ref={containerRef} className="font-sans text-slate-900 bg-slate-50 min-h-screen flex flex-col overflow-x-hidden selection:bg-brand-100 selection:text-brand-900">

            {/* Background - Dot Grid & Aurora */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Dot Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>

                {/* Aurora Blobs (Matches Login/Editor) */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-200/40 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px] animate-pulse delay-700"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            {/* Navbar (Glass) */}
            <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src="/icons/logo sem fundo.png"
                            alt="Nodus Logo"
                            className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <button
                                onClick={() => navigate('/admin')}
                                className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-all hover:shadow-lg shadow-slate-200 active:scale-95 text-sm"
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="hidden md:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/onboarding')}
                                    className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-all hover:shadow-lg shadow-slate-200 active:scale-95 text-sm"
                                >
                                    Criar conta
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div ref={heroRef} className="max-w-4xl mx-auto text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wide mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
                        <Sparkles size={12} className="text-brand-500 fill-brand-500" />
                        O Link na Bio do Futuro
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 tracking-tight mb-8">
                        Tudo você. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-500 to-purple-500">Em um link.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Conecte suas redes, produtos, vídeos e mais. <br className="hidden md:block" /> Simples, bonito e incrivelmente rápido.
                    </p>

                    <form onSubmit={handleClaim} className="flex flex-col sm:flex-row items-center gap-2 max-w-md w-full relative mb-16">
                        <div className="w-full relative shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white rounded-full transition-all duration-300 border border-slate-200 group focus-within:ring-4 focus-within:ring-brand-100">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none select-none">nodus.cc/</span>
                            <input
                                type="text"
                                placeholder="seunome"
                                className="w-full h-14 pl-[90px] pr-36 bg-transparent border-none focus:ring-0 rounded-full text-slate-800 font-semibold placeholder-slate-300 outline-none"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                            />
                            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
                                Criar <ArrowRight size={16} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Phone Preview (Matches Screenshot) */}
                <div className="relative max-w-sm mx-auto perspective-[1000px]">
                    {/* Floating Elements Background */}
                    <div className="absolute top-1/4 -left-20 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce duration-[3000ms]">
                        <Instagram size={32} className="text-pink-500" />
                    </div>
                    <div className="absolute bottom-1/4 -right-20 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce duration-[4000ms] delay-500">
                        <ShoppingBag size={32} className="text-brand-600" />
                    </div>

                    {/* Phone Frame */}
                    <div ref={phoneRef} className="relative z-10 bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden aspect-[9/19]">
                        {/* Status Bar */}
                        <div className="absolute top-0 inset-x-0 h-6 bg-transparent z-20 flex justify-between px-6 items-center pt-2">
                            <div className="text-[10px] font-bold text-slate-900">9:41</div>
                            <div className="flex gap-1">
                                <div className="w-4 h-2.5 bg-slate-900 rounded-sm"></div>
                                <div className="w-0.5 h-2.5 bg-slate-900/30 rounded-sm"></div>
                            </div>
                        </div>

                        {/* Notch */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20"></div>

                        {/* Screen Content (Matches Screenshot Preview) */}
                        <div className="w-full h-full bg-white relative overflow-hidden flex flex-col items-center pt-16 px-6">
                            {/* Aurora Circle Background */}
                            <div className="absolute top-[-50px] inset-x-0 h-[300px] bg-gradient-to-b from-brand-100/50 via-purple-100/30 to-transparent blur-3xl"></div>

                            {/* Profile Pic */}
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-sm mb-4 relative z-10">
                                <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-lg font-bold">N</div>
                            </div>

                            {/* Name */}
                            <h2 className="text-xl font-bold text-slate-800 mb-1 relative z-10">Nodus.cc</h2>
                            <p className="text-sm text-slate-500 mb-8 relative z-10">Seus links em apenas um.</p>

                            {/* Links */}
                            <div className="w-full space-y-3 relative z-10">
                                <div className="w-full py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm flex items-center justify-center font-semibold text-slate-700 hover:scale-[1.02] transition-transform cursor-pointer">
                                    Site / Blog
                                </div>
                                <div className="w-full py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm flex items-center justify-center font-semibold text-slate-700 hover:scale-[1.02] transition-transform cursor-pointer">
                                    Desenvolvedor
                                </div>
                                <div className="w-full py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm flex items-center justify-center font-semibold text-slate-700 hover:scale-[1.02] transition-transform cursor-pointer">
                                    Instagram
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            <div className="absolute bottom-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-100 text-xs font-semibold text-slate-500">
                                Junte-se a Nodus.cc no Nodus
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section (Clean Cards) */}
            <section className="features-section py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">Tudo o que você precisa.</h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            Design intencional para conversão e simplicidade.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="feature-card bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform">
                                <Layers size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Personalização Ilimitada</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Temas prontos ou controle total. Mude cores, fontes e botões para combinar com sua marca perfeitamente.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="feature-card bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Analytics Detalhado</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Entenda seu público. Saiba o que clicam, de onde vêm e o que mais gostam.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="feature-card bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Carregamento Instantâneo</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Ninguém gosta de esperar. Seu Nodus carrega em milissegundos, garantindo que você não perca visitas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer (Clean) */}
            <footer className="py-12 px-6 border-t border-slate-100 bg-white relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                        <img src="/icons/logo sem fundo.png" className="h-6 w-auto" alt="Nodus" />
                        <span className="font-bold text-slate-900 text-sm">© 2026 Nodus</span>
                    </div>

                    <div className="flex gap-8 text-sm font-medium text-slate-500">
                        <a href="#" className="hover:text-brand-600 transition-colors">Termos</a>
                        <a href="#" className="hover:text-brand-600 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-brand-600 transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
