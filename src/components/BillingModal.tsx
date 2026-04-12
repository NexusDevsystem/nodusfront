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
        <div className="fixed inset-0 z-[500] flex items-end justify-center">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-[#fdfcf0] border-t-4 border-x-4 border-[#1a1a1a] w-full h-[95vh] flex flex-col overflow-hidden z-10 rounded-t-[40px]"
            >
                {/* Premium Header - Optimized for Full Page - COMPACT */}
                <div className="flex items-center justify-between p-4 md:px-10 md:py-6 border-b-2 border-[#1a1a1a] shrink-0 relative overflow-hidden bg-[#fdfcf0] group">
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
                        
                                <h2 className="text-xl md:text-3xl font-black text-black uppercase tracking-tighter leading-none mb-1 md:mb-1.5">
                            {t('billing.upgradeTitle').split(' ').map((word, i) => (
                                <span key={i} className={i % 2 === 0 ? 'inline mr-2 md:mr-4' : 'inline text-transparent stroke-black stroke-1 md:stroke-2 webkit-text-stroke mr-2 md:mr-4'}>
                                    {word}
                                </span>
                            ))}
                                </h2>
                        
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
                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-md group z-30"
                    >
                        <X size={24} strokeWidth={4} />
                    </button>
                </div>

                {/* Content Area - Optimized for Mobile */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#fdfcf0] relative">
                    {/* Subtle grid pattern background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    
                    <div className="max-w-7xl mx-auto relative z-10 pb-10">
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
