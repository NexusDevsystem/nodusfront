import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4 overflow-y-auto overflow-x-hidden">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-6xl relative my-8 flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                {/* Brutalist Header */}
                <div className="flex items-center justify-between p-8 md:p-12 border-b-4 border-black shrink-0 relative overflow-hidden bg-white">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffdf00] -mr-16 -mt-16 rotate-45 border-4 border-black opacity-20 hidden md:block"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 bg-black text-[#ffdf00] text-[10px] font-black uppercase tracking-[0.3em]">Nodus Pro</div>
                            <div className="h-1 flex-1 bg-black/5 min-w-[40px]"></div>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter leading-none mb-4">
                            {t('billing.upgradeTitle')}
                        </h2>
                        <p className="text-black/40 font-black text-[11px] uppercase tracking-[0.4em]">
                            {t('billing.upgradeSubtitle')}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="group relative p-4 text-black hover:bg-black hover:text-[#ffdf00] border-4 border-black bg-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20"
                    >
                        <X size={32} strokeWidth={4} />
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-10 md:p-16 lg:p-20 pt-12 scrollbar-hide bg-[#fafafa]">
                    <div className="max-w-7xl mx-auto">
                        <BillingView profile={profile} onChange={onChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingModal;
