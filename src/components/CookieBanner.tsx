import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const consent = localStorage.getItem('nodus_cookie_consent');
        if (!consent) {
            // Show after a short delay
            const timer = setTimeout(() => setIsVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('nodus_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('nodus_cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[420px] z-[9999]"
                >
                    <div className="bg-white border-4 border-black rounded-[12px] p-6 shadow-[0_10px_0_0_#000] relative overflow-hidden group">
                        {/* Decorative background glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ffdf00]/10 rounded-full blur-3xl group-hover:bg-[#ffdf00]/20 transition-all duration-700" />
                        
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#ffdf00] border-2 border-black rounded-sm flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#000] rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500">
                                    <Cookie className="text-black" size={24} />
                                </div>
                                <h3 className="font-black uppercase text-base tracking-tighter text-black flex-1">
                                    Cookies & <span className="text-black underline decoration-[#ffdf00] decoration-4">Privacidade</span>
                                </h3>
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    className="p-2 hover:bg-black/5 rounded-sm transition-colors"
                                >
                                    <X size={20} className="text-black/40" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-[14px] font-bold text-black/80 leading-relaxed">
                                    {t('cookies.message', 'Usamos cookies para melhorar sua experiência, manter sua sessão segura e entender o uso do Nodus.')}
                                    <Link 
                                        to="/privacy" 
                                        className="ml-1 text-black underline decoration-[#ffdf00] decoration-2 underline-offset-2 hover:decoration-black transition-all"
                                        onClick={() => setIsVisible(false)}
                                    >
                                        Saiba mais
                                    </Link>
                                </p>
                                
                                <div className="flex gap-4 pt-1">
                                    <button
                                        onClick={handleAccept}
                                        className="flex-[1.5] bg-[#ffdf00] text-black font-black uppercase text-[12px] tracking-widest py-4 rounded-sm border-2 border-black hover:translate-y-[2px] hover:shadow-none transition-all active:translate-y-[4px] shadow-[0_4px_0_0_#000]"
                                    >
                                        {t('cookies.accept', 'Aceitar todos')}
                                    </button>
                                    <button
                                        onClick={handleDecline}
                                        className="flex-1 bg-white text-black font-black uppercase text-[12px] tracking-widest py-4 rounded-sm border-2 border-black hover:bg-gray-50 hover:translate-y-[1px] transition-all active:translate-y-[2px]"
                                    >
                                        {t('cookies.decline', 'Recusar')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
