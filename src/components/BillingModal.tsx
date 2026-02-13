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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4 overflow-y-auto">
            <div className="bg-slate-50 rounded-[44px] w-full max-w-6xl relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] my-8 flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
                {/* Minimalist Header */}
                <div className="flex items-center justify-between p-8 md:p-10 shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Upgrade para Premium</h2>
                        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.2em] mt-2">Desbloqueie todo o potencial da sua marca.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-2xl transition-all duration-300 active:scale-95"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 pt-0 scrollbar-hide">
                    <BillingView profile={profile} onChange={onChange} />
                </div>
            </div>
        </div>
    );
};

export default BillingModal;
