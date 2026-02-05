import React from 'react';
import { DollarSign, Coffee, Heart, CreditCard, AlertCircle } from 'lucide-react';
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
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
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

                <div className="p-6 space-y-6">
                    {/* Payment Method Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Método de Recebimento
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleChange('supportType', 'pix')}
                                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${profile.supportType === 'pix'
                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                <img src="https://img.icons8.com/?size=100&id=CuUOYOfd3Dy9&format=png&color=000000" alt="Pix" className="w-6 h-6 object-contain" />
                                <span className="font-semibold">Pix</span>
                            </button>
                            <button
                                onClick={() => handleChange('supportType', 'paypal')}
                                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${profile.supportType === 'paypal'
                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                <img src="https://img.icons8.com/?size=100&id=34525&format=png&color=000000" alt="PayPal" className="w-6 h-6 object-contain" />
                                <span className="font-semibold">PayPal</span>
                            </button>
                        </div>
                    </div>

                    {/* Key Input */}
                    {profile.supportType && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                {profile.supportType === 'pix' ? 'Chave Pix' : 'Link do PayPal.Me'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <CreditCard size={16} />
                                </span>
                                <input
                                    type="text"
                                    value={profile.supportKey || ''}
                                    onChange={(e) => handleChange('supportKey', e.target.value)}
                                    placeholder={profile.supportType === 'pix' ? 'email@exemplo.com ou CPF' : 'paypal.me/seuusuario'}
                                    className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                />
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                <AlertCircle size={12} />
                                <span>O botão "Apoiar" aparecerá automaticamente no seu perfil.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Card */}
            <div className="bg-slate-50 p-6 rounded-[24px] border border-dashed border-slate-200 flex flex-col items-center text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Preview do Botão</span>

                <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md text-slate-800 font-bold hover:scale-105 transition-transform">
                    <Coffee size={20} className="text-amber-500" />
                    <span>Apoie meu trabalho</span>
                </button>
            </div>
        </div>
    );
}
