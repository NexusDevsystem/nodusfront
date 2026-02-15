import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '../constants';
import { CheckCircle } from 'lucide-react';
import BackgroundLayer from './BackgroundLayer';
import { UserProfile } from '../types';

export default function ShowcaseCards() {
    const [index, setIndex] = useState(0);

    // Filter themes to only real system themes (excluding 'custom')
    const displayThemes = THEMES.filter(t => t.id !== 'custom');

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % displayThemes.length);
        }, 3500);
        return () => clearInterval(timer);
    }, [displayThemes.length]);

    return (
        <div className="relative w-[320px] h-[640px] bg-black rounded-[3rem] border-[12px] border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.2)] overflow-hidden ring-1 ring-white/20 transform transition-transform duration-500 hover:scale-[1.02]">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50"></div>

            {/* Screen Area */}
            <div className="relative w-full h-full bg-black overflow-hidden rounded-[2.5rem]">
                <AnimatePresence mode='popLayout'>
                    {displayThemes.map((theme, i) => {
                        if (!theme) return null;

                        // Calculate relative index for stacking
                        const offset = (i - index + displayThemes.length) % displayThemes.length;

                        // Limit visible stack
                        if (offset > 1) return null;

                        // Create a temporary profile object for the BackgroundLayer
                        const tempProfile: UserProfile = {
                            id: 'showcase',
                            name: 'Showcase',
                            bio: '',
                            avatarUrl: '',
                            themeId: theme.id,
                            fontFamily: theme.fontFamily || "'Inter', sans-serif"
                        };

                        return (
                            <motion.div
                                key={theme.id}
                                initial={false}
                                animate={{
                                    x: offset === 0 ? 0 : 0,
                                    scale: offset === 0 ? 1 : 0.95,
                                    zIndex: 10 - offset,
                                    opacity: offset === 0 ? 1 : 0
                                }}
                                exit={{
                                    x: '100%',
                                    opacity: 0,
                                    transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] }
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                className={`absolute inset-0 w-full h-full flex flex-col items-center pt-20 px-6 ${theme.backgroundClass}`}
                            >
                                {/* Render Theme Background using the central BackgroundLayer component */}
                                <BackgroundLayer
                                    profile={tempProfile}
                                    currentTheme={theme}
                                    className="absolute inset-0 z-0"
                                />

                                {/* Content Overlay - Z-Index 10 to sit above background */}
                                <div className="relative z-10 w-full flex flex-col items-center">

                                    {/* Avatar */}
                                    <div className={`w-24 h-24 rounded-full ${theme.avatarBorder} border-4 mb-4 flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-md shadow-lg`}>
                                        <img src="/icons/logo sem fundo.png" alt="Nodus" className="w-16 h-16 object-contain opacity-90" />
                                    </div>

                                    {/* Name & Bio */}
                                    <div className={`flex items-center gap-2 mb-1 ${theme.textClass} drop-shadow-md`}>
                                        <h2 className="font-bold text-xl tracking-tight">@{theme.name.replace(/\s/g, '').toLowerCase()}</h2>
                                        <CheckCircle size={18} className="fill-current" />
                                    </div>
                                    <p className={`text-xs mb-8 text-center font-medium opacity-80 ${theme.textClass} max-w-[200px] leading-relaxed drop-shadow-sm`}>
                                        Link in bio para todas as minhas redes e conteúdos exclusivos.
                                    </p>

                                    {/* Buttons */}
                                    <div className="w-full space-y-3">
                                        {['Minha Loja', 'Vídeo Novo', 'Agendar Consultoria'].map((btn, btnIdx) => (
                                            <div
                                                key={btnIdx}
                                                className={`w-full py-4 text-center rounded-xl font-bold text-sm cursor-pointer select-none transition-transform active:scale-95 ${theme.buttonClass}`}
                                            >
                                                {btn}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Brand */}
                                    <div className={`absolute -bottom-24 text-[10px] font-bold opacity-40 uppercase tracking-widest ${theme.textClass}`}>
                                        Criado com Nodus
                                    </div>
                                </div>

                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
