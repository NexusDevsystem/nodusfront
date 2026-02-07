import React from 'react';
import { UserProfile } from '../types';
import {
    Check,
    Zap,
    Star,
    CreditCard,
    ArrowRight,
    ShieldCheck,
    Percent
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface BillingViewProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const PLANS = [
    {
        id: 'free',
        name: 'Gratuito',
        price: 'R$ 0',
        period: '',
        description: 'Tudo o que você precisa para começar sua presença online.',
        features: [
            'Links ilimitados',
            'Temas básicos',
            'Analytics básico (7 dias)',
            'Suporte via email'
        ],
        buttonText: 'Plano Atual',
        highlight: false,
        color: 'slate'
    },
    {
        id: 'monthly',
        name: 'Mensal',
        price: 'R$ 29,90',
        period: '/mês',
        description: 'Recursos avançados para profissionais e criadores.',
        features: [
            'Todos os recursos do Gratuito',
            'Temas Premium e Personalizados',
            'Cores e Fundos customizados',
            'Botão de Newsletter (Leads)',
            'Analytics completo (30 dias)',
            'Loja com produtos ilimitados'
        ],
        buttonText: 'Assinar Mensal',
        highlight: true,
        color: 'brand'
    },
    {
        id: 'annual',
        name: 'Anual',
        price: 'R$ 299,00',
        period: '/ano',
        description: 'A melhor escolha para quem quer economizar e crescer.',
        features: [
            'Todos os recursos do Plano Mensal',
            'Economia de R$ 59,80 ao ano',
            'Equivalente a 2 meses grátis',
            'Apenas R$ 24,91 por mês',
            'Suporte prioritário',
            'Acesso antecipado a novos recursos'
        ],
        buttonText: 'Assinar Anual',
        highlight: false,
        color: 'indigo',
        badge: 'Melhor Valor'
    }
];

const BillingView: React.FC<BillingViewProps> = ({ profile, onChange }) => {
    const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

    const handleSelectPlan = async (planId: string) => {
        if (planId === profile.planType) return;

        setLoadingPlan(planId);
        try {
            // Mock payment flow - wait 1s
            await new Promise(resolve => setTimeout(resolve, 1500));

            const updatedProfile = {
                ...profile,
                planType: planId as any,
                subscriptionStatus: 'active' as any
            };

            await apiClient.updateProfile(updatedProfile);
            onChange(updatedProfile);
            alert(`Parabéns! Você agora é assinante do plano ${planId.toUpperCase()}.`);
        } catch (error) {
            console.error(error);
            alert('Erro ao processar assinatura.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const currentPlan = profile.planType || 'free';

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-8 text-center w-full">
                <div className="inline-flex items-center justify-center p-3 bg-brand-50 text-brand-600 rounded-2xl mb-4">
                    <CreditCard size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Planos e Assinaturas</h1>
                <p className="text-slate-500">Escolha o plano ideal para o seu momento e impulsione sua marca.</p>

                {/* Current Plan Badge */}
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plano Atual:</span>
                    <span className="text-sm font-bold text-brand-600 uppercase italic">
                        {currentPlan === 'free' ? 'Gratuito' : currentPlan === 'monthly' ? 'Mensal' : 'Anual'}
                    </span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`
              relative bg-white rounded-[24px] border-2 p-6 lg:p-8 flex flex-col transition-all duration-300
              ${plan.highlight ? 'border-brand-500 shadow-xl scale-[1.03] z-10' : 'border-slate-200 hover:border-slate-300 shadow-sm'}
              ${currentPlan === plan.id ? 'bg-slate-50/50' : ''}
            `}
                    >
                        {plan.badge && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                                {plan.badge}
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                <span className="text-slate-500 font-medium text-sm">{plan.period}</span>
                            </div>
                            <p className="mt-4 text-sm text-slate-500 leading-relaxed">{plan.description}</p>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    <span className="text-sm text-slate-600 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {plan.id === 'annual' && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                    <Percent size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-700 leading-tight">Ganhe 2 meses grátis</p>
                                    <p className="text-[10px] text-green-600 mt-0.5">Economize R$ 59,80 comparado ao mensal.</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={plan.id === currentPlan || loadingPlan !== null}
                            className={`
                w-full py-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
                ${plan.id === currentPlan
                                    ? 'bg-slate-100 text-slate-400 cursor-default'
                                    : plan.highlight
                                        ? 'bg-brand-900 text-white hover:bg-black shadow-lg shadow-brand-900/10'
                                        : 'bg-white text-slate-800 border-2 border-slate-200 hover:bg-slate-50'}
                ${loadingPlan === plan.id ? 'opacity-70 animate-pulse' : ''}
              `}
                        >
                            {loadingPlan === plan.id ? (
                                'Processando...'
                            ) : plan.id === currentPlan ? (
                                <>
                                    <ShieldCheck size={18} />
                                    Plano Ativo
                                </>
                            ) : (
                                <>
                                    {plan.buttonText}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Support Section */}
            <div className="bg-slate-50 rounded-[20px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Dúvidas sobre os planos?</h4>
                        <p className="text-xs text-slate-500">Fale com nosso suporte especializado agora mesmo.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
                    Central de Ajuda
                </button>
            </div>
        </div>
    );
};

export default BillingView;
