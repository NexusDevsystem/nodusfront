import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import BillingView from './BillingView';
import { UserProfile } from '../types';

interface BillingModalProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    onClose: () => void;
}

const BillingModal: React.FC<BillingModalProps> = ({ profile, onChange, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
            {/* Animated Backdrop Blur */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-md md:backdrop-blur-xl"
            >
                {/* Animated Backdrop Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#97cd7a]/20 blur-[120px] rounded-full animate-pulse capitalize" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ffdf00]/10 blur-[120px] rounded-full animate-pulse-slow" />
                </div>
            </motion.div>

            <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                className="bg-white border-t-4 border-x-4 md:border-2 border-[#1a1a1a] shadow-none md:shadow-[0_12px_0_0_#1a1a1a] w-full max-w-6xl relative flex flex-col h-[92vh] md:max-h-[90vh] overflow-hidden rounded-t-[32px] md:rounded-[32px] z-10"
            >
                {/* Premium Header - Optimized for Mobile */}
                <div className="flex items-center justify-between p-5 md:p-10 border-b-2 border-[#1a1a1a] shrink-0 relative overflow-hidden bg-white group rounded-t-[24px] md:rounded-t-[32px]">
                    {/* Light Leak / Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] pointer-events-none" />
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#ffdf00]/10 rounded-full -mr-24 -mt-24 blur-2xl" />
                    
                    <div className="relative z-20">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 mb-2 md:mb-4"
                        >
                            <div className="px-2 md:px-3 py-0.5 md:py-1 bg-black text-white border-2 border-[#1a1a1a] text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-[2px_2px_0px_0px_#97cd7a] rounded-md">
                                <span>Nodus Pro</span>
                            </div>
                            <span className="text-[8px] md:text-[9px] font-bold text-black/40 uppercase tracking-widest hidden sm:block">Premium Pass</span>
                        </motion.div>
                        
                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none mb-1 md:mb-3"
                        >
                            {t('billing.upgradeTitle').split(' ').map((word, i) => (
                                <span key={i} className={i % 2 === 0 ? 'inline mr-2 md:mr-4' : 'inline text-transparent stroke-black stroke-1 md:stroke-2 webkit-text-stroke mr-2 md:mr-4'}>
                                    {word}
                                </span>
                            ))}
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-black/50 font-bold text-[8px] md:text-xs uppercase tracking-widest flex items-center gap-2 md:gap-3"
                        >
                            <span className="w-4 md:w-6 h-[1px] bg-black/20"></span>
                            {t('billing.upgradeSubtitle')}
                        </motion.p>
                    </div>

                    <button
                        onClick={onClose}
                        className="group relative p-2 md:p-4 text-black hover:bg-black hover:text-[#ffdf00] border-2 border-[#1a1a1a] bg-white transition-all active:scale-95 shadow-[0_3px_0_0_#1a1a1a] md:shadow-[0_4px_0_0_#1a1a1a] z-30 rounded-lg md:rounded-xl"
                    >
                        <X className="w-5 h-5 md:w-7 md:h-7" strokeWidth={4} />
                    </button>
                </div>

                {/* Content Area - Optimized for Mobile */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f8f8f8] relative">
                    {/* Subtle grid pattern background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    
                    <div className="max-w-7xl mx-auto relative z-10">
                        <BillingView profile={profile} onChange={onChange} />
                    </div>
                </div>
            </motion.div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .webkit-text-stroke { -webkit-text-stroke: 2px #1a1a1a; }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }
                .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
            `}} />
        </div>
    );
};

export default BillingModal;
