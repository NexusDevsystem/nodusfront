import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import {
    Check,
    Zap,
    CreditCard,
    ArrowRight,
    ShieldCheck,
    Loader2,
    PartyPopper
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import confetti from 'canvas-confetti';

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
        theme: 'bg-white border-slate-200 text-slate-800'
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
            'Analytics completo (30 dias)',
            'Loja com produtos ilimitados'
        ],
        buttonText: 'Assinar Mensal',
        highlight: true,
        theme: 'bg-white border-brand-500 shadow-xl shadow-brand-500/10'
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
            'Suporte prioritário',
            'Acesso antecipado a novos recursos'
        ],
        buttonText: 'Assinar Anual',
        highlight: false,
        badge: 'Melhor Valor',
        theme: 'bg-white border-slate-200 hover:border-brand-300 shadow-sm'
    }
];

type PurchaseStatus = 'idle' | 'pending' | 'success';

const BillingView: React.FC<BillingViewProps> = ({ profile, onChange }) => {
    const [status, setStatus] = useState<PurchaseStatus>('idle');
    const currentPlan = profile.planType || 'free';

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (status === 'pending') {
            // Poll profile every 3 seconds to check for upgrade
            pollInterval = setInterval(async () => {
                try {
                    const profile = await apiClient.getMyProfile();
                    if (profile.planType !== 'free' && profile.planType !== currentPlan) {
                        setStatus('success');
                        onChange(profile);

                        // Fire confetti!
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#2563eb', '#1e40af', '#60a5fa']
                        });

                        clearInterval(pollInterval);
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 3000);

            // Timeout after 5 minutes
            const timeout = setTimeout(() => {
                if (status === 'pending') {
                    setStatus('idle');
                    clearInterval(pollInterval);
                }
            }, 300000);

            return () => {
                clearInterval(pollInterval);
                clearTimeout(timeout);
            };
        }
    }, [status, currentPlan, onChange]);

    const handleSelectPlan = (planId: string) => {
        if (planId === currentPlan) return;

        const links: Record<string, string> = {
            monthly: 'https://donate.stripe.com/test_7sYeV68QB5EA9qxbRWb7y01',
            annual: 'https://donate.stripe.com/test_bJe8wI8QBd729qx4pub7y00'
        };

        let targetUrl = links[planId];
        if (targetUrl) {
            const url = new URL(targetUrl);
            if (profile.email) {
                url.searchParams.append('prefilled_email', profile.email);
            }
            window.open(url.toString(), '_blank');
            setStatus('pending');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
                <div className="w-24 h-24 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-brand-500/20">
                    <PartyPopper size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">¡Parabéns! Upgrade Concluído</h2>
                <p className="text-slate-600 max-w-md mx-auto mb-8 text-lg font-medium">
                    Sua conta agora é <span className="text-brand-600 font-bold uppercase italic">{profile.planType === 'monthly' ? 'Premium Mensal' : 'Premium Anual'}</span>. Aproveite todos os recursos liberados!
                </p>
                <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 font-bold flex items-center gap-2">
                    <ShieldCheck size={20} />
                    Assinatura Ativa
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="relative">
                    <Loader2 size={64} className="text-brand-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <CreditCard size={24} className="text-brand-400" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-3">Aguardando Pagamento</h2>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Estamos processando sua transação com a Stripe. Fique tranquilo, o sistema atualizará sozinho em instantes...
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-600 underline decoration-slate-200 underline-offset-4"
                >
                    Voltar para os planos
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-8">
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`
                            relative rounded-[32px] border-2 p-8 flex flex-col transition-all duration-500 group
                            ${plan.theme}
                            ${plan.highlight ? 'scale-[1.05] z-10' : 'hover:scale-[1.02]'}
                        `}
                    >
                        {plan.badge && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
                                {plan.badge}
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-brand-600 transition-colors">
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                                <span className="text-slate-400 font-bold text-sm tracking-wide">{plan.period}</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{plan.description}</p>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-sm text-slate-600 font-bold tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={plan.id === currentPlan}
                            className={`
                                w-full py-5 rounded-2xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest
                                ${plan.id === currentPlan
                                    ? 'bg-slate-50 text-slate-400 cursor-default border-2 border-slate-100'
                                    : plan.highlight
                                        ? 'bg-brand-900 text-white hover:bg-black shadow-xl shadow-brand-900/20'
                                        : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10'}
                            `}
                        >
                            {plan.id === currentPlan ? (
                                <>
                                    <ShieldCheck size={18} />
                                    Plano Atual
                                </>
                            ) : (
                                <>
                                    {plan.buttonText}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Micro Support Footer */}
            <div className="mt-12 text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Zap size={14} className="text-brand-500" />
                    Pagamento 100% seguro via Stripe
                </p>
            </div>
        </div>
    );
};

export default BillingView;
