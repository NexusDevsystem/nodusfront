import React from 'react';
import { DollarSign, Wallet, CreditCard, AlertCircle, Zap, Layout } from 'lucide-react';
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
        <div className="space-y-6 animate-fade-in pb-20 max-w-4xl mx-auto">
            {/* Payment Method Selector Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <Layout size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Método de Recebimento</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'pix', label: 'Pix', icon: Zap },
                        { id: 'paypal', label: 'PayPal', icon: CreditCard },
                    ].map((method) => (
                        <button
                            key={method.id}
                            onClick={() => handleChange('supportType', method.id)}
                            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-md border transition-all ${profile.supportType === method.id
                                ? 'border-[#32a800] bg-slate-50 text-slate-900'
                                : 'border-slate-100 hover:border-[#32a800]/50 hover:bg-slate-50/50 text-slate-500'
                                }`}
                        >
                            <method.icon size={24} fill={profile.supportType === method.id ? 'currentColor' : 'none'} />
                            <span className="text-xs font-bold uppercase tracking-wider">{method.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Config Section */}
            {profile.supportType && (
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-6 text-slate-500">
                        <Wallet size={18} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Configuração do Método</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                                {profile.supportType === 'pix' ? 'Chave Pix' : 'Seu link PayPal.Me'}
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    {profile.supportType === 'pix' ? <Zap size={16} /> : <CreditCard size={16} />}
                                </div>
                                <input
                                    type="text"
                                    value={profile.supportKey || ''}
                                    onChange={(e) => handleChange('supportKey', e.target.value)}
                                    placeholder={profile.supportType === 'pix' ? 'email@exemplo.com ou CPF' : 'paypal.me/seuusuario'}
                                    className="w-full pl-11 pr-4 py-2.5 rounded-md border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-slate-50/50 rounded-md border border-slate-100">
                            <AlertCircle size={16} className="text-slate-400 mt-0.5" />
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Um botão de <strong className="text-slate-700">Apoiar</strong> será adicionado automaticamente ao seu perfil público após configurar sua chave.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
