import React from 'react';
import { X, CreditCard } from 'lucide-react';
import BillingView from './BillingView';
import { UserProfile } from '../types';

interface BillingModalProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    onClose: () => void;
}

const BillingModal: React.FC<BillingModalProps> = ({ profile, onChange, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
            <div className="bg-slate-50 rounded-[40px] w-full max-w-6xl relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] my-8 flex flex-col max-h-[90vh] overflow-hidden">
                {/* Minimalist Header */}
                <div className="flex items-center justify-between p-8 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upgrade para Premium</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Desbloqueie todo o potencial da sua marca.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-2xl transition-all duration-300"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 pt-0 custom-scrollbar">
                    <BillingView profile={profile} onChange={onChange} />
                </div>
            </div>
        </div>
    );
};

export default BillingModal;
