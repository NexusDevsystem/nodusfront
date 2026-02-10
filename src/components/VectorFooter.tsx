import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Github, Globe, ArrowRight } from 'lucide-react';

export default function VectorFooter() {
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
        <footer className="w-full bg-white text-black relative overflow-hidden">
            {/* Top Border is handled by the section above usually, but adding one here just in case */}

            <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* Brand Section - Left */}
                    <div className="p-12 md:p-24 border-b-2 lg:border-b-0 lg:border-r-2 border-black flex flex-col justify-between min-h-[400px]">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <img src="/icons/logo sem fundo.png" alt="NODUS" className="h-16 w-auto object-contain" />
                                <span className="text-3xl font-black tracking-tighter uppercase">Nodus.cc</span>
                            </div>
                            <p className="text-xl font-bold max-w-md border-l-4 border-black pl-6 mb-12">
                                Ferramentas poderosas para criadores que não aceitam o básico.
                            </p>
                        </div>

                        {/* Socials */}
                        <div className="flex gap-4">
                            {[
                                { icon: Instagram, href: "#" },
                                { icon: Twitter, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Github, href: "#" }
                            ].map((item, i) => (
                                <a
                                    key={i}
                                    href={item.href}
                                    className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center hover:bg-black hover:text-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition-all"
                                >
                                    <item.icon size={24} strokeWidth={2.5} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Grid - Right */}
                    <div className="grid grid-cols-2">
                        {/* Column 1 */}
                        <div className="p-12 border-r-2 border-b-2 border-black flex flex-col gap-6">
                            <h4 className="font-black uppercase text-lg bg-[#ffdf00] inline-block px-2 self-start border-2 border-black shadow-[4px_4px_0px_0px_#000]">Produto</h4>
                            <nav className="flex flex-col gap-4 font-bold">
                                <a href="#features" className="hover:translate-x-2 transition-transform flex items-center gap-2">
                                    <ArrowRight size={16} /> Funcionalidades
                                </a>
                                <a href="#showcase" className="hover:translate-x-2 transition-transform flex items-center gap-2">
                                    <ArrowRight size={16} /> Showcase
                                </a>
                                <a href="#pricing" className="hover:translate-x-2 transition-transform flex items-center gap-2">
                                    <ArrowRight size={16} /> Preços
                                </a>
                                <a href="/login" className="hover:translate-x-2 transition-transform flex items-center gap-2">
                                    <ArrowRight size={16} /> Login
                                </a>
                            </nav>
                        </div>

                        {/* Column 2 */}
                        <div className="p-12 border-b-2 border-black flex flex-col gap-6">
                            <h4 className="font-black uppercase text-lg bg-[#97cd7a] inline-block px-2 self-start border-2 border-black shadow-[4px_4px_0px_0px_#000]">Legal</h4>
                            <nav className="flex flex-col gap-4 font-bold">
                                <a href="/privacy" className="hover:translate-x-2 transition-transform flex items-center gap-2">
                                    <ArrowRight size={16} /> Privacidade
                                </a>
                                <a href="/terms" className="hover:translate-x-2 transition-transform flex items-center gap-2">
                                    <ArrowRight size={16} /> Termos
                                </a>
                                <a href="#cookies" className="hover:translate-x-2 transition-transform flex items-center gap-2">
                                    <ArrowRight size={16} /> Cookies
                                </a>
                            </nav>
                        </div>

                        {/* Newsletter / Input Area */}
                        <div className="col-span-2 p-12 flex flex-col justify-center bg-[#f8f8f8]">
                            <h4 className="font-black uppercase text-xl mb-4">Receba novidades</h4>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="flex-1 bg-white border-2 border-black p-4 font-bold outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow rounded-lg"
                                />
                                <button className="bg-black text-white px-6 font-bold uppercase border-2 border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_#000] transition-all rounded-lg">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-black text-white font-bold uppercase text-xs tracking-widest gap-4">
                    <p>Feito com ❤️ no Brasil</p>
                    <p>© 2026 Nodus Inc.</p>
                </div>
            </div>
        </footer>
    );
}
