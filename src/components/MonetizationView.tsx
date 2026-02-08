import React from 'react';
import { DollarSign, Heart, CreditCard, AlertCircle, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface MonetizationViewProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

export default function MonetizationView({ profile, onChange }: MonetizationViewProps) {
    const handleChange = (field: keyof UserProfile, value: string) => {
        onChange({ ...profile, [field]: value });
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20 font-sans">
            {/* Header */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-start gap-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
                    <DollarSign size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Monetização & Apoio</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Receba gorjetas ou pagamentos diretamente dos seus seguidores.
                    </p>
                </div>
            </div>

            {/* Core Config */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <Heart className="text-pink-500" size={20} />
                    <h3 className="font-bold text-lg text-slate-800">Tip Jar (Caixinha de Apoio)</h3>
                </div>

                <div className="p-6 space-y-8">
                    {/* Payment Method Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                            Método de Recebimento
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleChange('supportType', 'pix')}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${profile.supportType === 'pix'
                                    ? 'border-[#acc8a2] bg-[#acc8a2]/10 text-slate-900'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${profile.supportType === 'pix' ? 'bg-[#acc8a2] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Zap size={20} fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold">Pix</span>
                                    <span className="text-xs opacity-70">Recebimento instantâneo</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleChange('supportType', 'paypal')}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${profile.supportType === 'paypal'
                                    ? 'border-[#acc8a2] bg-[#acc8a2]/10 text-slate-900'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${profile.supportType === 'paypal' ? 'bg-[#acc8a2] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <CreditCard size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold">PayPal</span>
                                    <span className="text-xs opacity-70">Internacional</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Key Input */}
                    <div className={`transition-all duration-300 ${!profile.supportType ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {profile.supportType === 'pix' ? 'Chave Pix' : 'Link do PayPal.Me'}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                {profile.supportType === 'pix' ? <Zap size={18} /> : <CreditCard size={18} />}
                            </span>
                            <input
                                type="text"
                                value={profile.supportKey || ''}
                                onChange={(e) => handleChange('supportKey', e.target.value)}
                                placeholder={profile.supportType === 'pix' ? 'email@exemplo.com ou CPF' : 'paypal.me/seuusuario'}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-[#acc8a2]/20 focus:border-[#acc8a2] outline-none transition-all"
                            />
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <AlertCircle size={14} className="text-[#acc8a2]" />
                            <span>O botão "Apoiar" aparecerá automaticamente no seu perfil público.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
