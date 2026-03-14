import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Map, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WelcomeTourModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ isOpen, onAccept, onDecline }) => {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999999] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#1a1a1a]/80 md:bg-[#1a1a1a]/60 md:backdrop-blur-sm pointer-events-auto"
                        onClick={onDecline}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative bg-white border-2 border-[#1a1a1a] p-8 md:p-8 rounded-none shadow-[4px_4px_0px_0px_#1a1a1a] w-full md:max-w-sm flex flex-col items-center text-center font-sans overflow-hidden pointer-events-auto"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffdf00] rounded-none mix-blend-multiply opacity-20 pointer-events-none blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#97cd7a] rounded-none mix-blend-multiply opacity-20 pointer-events-none blur-2xl"></div>

                        {/* Top Icon */}
                        <div className="w-16 h-16 bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center mb-6 relative z-10">
                            <Sparkles size={28} className="text-black" strokeWidth={2.5} />
                        </div>

                        {/* Text Content */}
                        <h2 className="text-2xl font-black text-black uppercase tracking-tighter mb-3 leading-none relative z-10">
                            Bem-vindo ao Nodus!
                        </h2>
                        <p className="text-black/70 text-sm font-medium leading-tight mb-8 relative z-10">
                            Que tal um tour rápido para aprender a usar todas as funcionalidades do sistema e deixar seu perfil incrível em minutos?
                        </p>

                        {/* Action Buttons */}
                        <div className="w-full flex w-full flex-col gap-3 relative z-10">
                            <button
                                onClick={onAccept}
                                className="w-full bg-[#97cd7a] text-black border-2 border-[#1a1a1a] py-3.5 rounded-none text-[14px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2"
                            >
                                <Map size={18} strokeWidth={2.5} />
                                Iniciar Tour Guiado
                            </button>
                            <button
                                onClick={onDecline}
                                className="w-full bg-white text-black/50 border-2 border-[#1a1a1a] py-3.5 rounded-none text-[12px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a]/5 hover:text-black transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <X size={16} strokeWidth={2.5} />
                                Pular por enquanto
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WelcomeTourModal;
