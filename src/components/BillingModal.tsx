import React from 'react';
import { X } from 'lucide-react';
import BillingView from './BillingView';
import { UserProfile } from '../types';

interface BillingModalProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    onClose: () => void;
}

const BillingModal: React.FC<BillingModalProps> = ({ profile, onChange, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
            <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] w-full max-w-6xl relative my-8 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Brutalist Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b-4 border-black shrink-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter leading-none">Upgrade para Premium</h2>
                        <div className="h-1.5 w-24 bg-black mt-2"></div>
                        <p className="text-black/60 font-black text-[10px] uppercase tracking-[0.3em] mt-3">Desbloqueie todo o potencial da sua marca.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-black hover:bg-black hover:text-[#ffdf00] border-2 border-transparent hover:border-black transition-all active:translate-x-[2px] active:translate-y-[2px]"
                    >
                        <X size={32} strokeWidth={4} />
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 pt-8 scrollbar-hide bg-[#f8fafc]">
                    <BillingView profile={profile} onChange={onChange} />
                </div>
            </div>
        </div>
    );
};

export default BillingModal;
