import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import {
    Check,
    Zap,
    CreditCard,
    ArrowRight,
    ShieldCheck,
    Loader2,
    PartyPopper,
    Star
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
            'Newsletter Widget',
            'Temas básicos animados',
            'Analytics básico (7 dias)',
            'Suporte via email'
        ],
        buttonText: 'Plano Atual',
        highlight: false,
    },
    {
        id: 'monthly',
        name: 'Mensal',
        price: 'R$ 29,90',
        period: '/mês',
        description: 'Recursos avançados para profissionais e criadores.',
        features: [
            'Todos os recursos do Gratuito',
            'Temas Pro & Exclusividade',
            'Design Personalizado (Cores/Blur)',
            'Analytics completo (30 dias)',
            'Loja com produtos ilimitados',
            'Suporte prioritário'
        ],
        buttonText: 'Assinar Mensal',
        highlight: true,
    },
    {
        id: 'annual',
        name: 'Anual',
        price: 'R$ 299',
        period: '/ano',
        description: 'A melhor escolha para quem quer crescer rápido.',
        features: [
            '2 Meses Grátis (Economia R$ 59)',
            'Todos os recursos do Mensal',
            'Acesso antecipado a Beta',
            'Selo de Conta Verificada',
            'Remover marca Nodus'
        ],
        buttonText: 'Assinar Anual',
        highlight: false,
        badge: 'Melhor Valor',
    }
];

type PurchaseStatus = 'idle' | 'pending' | 'success';

const BillingView: React.FC<BillingViewProps> = ({ profile, onChange }) => {
    const [status, setStatus] = useState<PurchaseStatus>('idle');
    const currentPlan = profile.planType || 'free';

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (status === 'pending') {
            pollInterval = setInterval(async () => {
                try {
                    const updatedProfile = await apiClient.getMyProfile();
                    if (updatedProfile.planType !== 'free' && updatedProfile.planType !== currentPlan) {
                        setStatus('success');
                        onChange(updatedProfile);

                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#32a800', '#acc8a2', '#ffffff']
                        });

                        clearInterval(pollInterval);
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 3000);

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

    const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

    const handleSelectPlan = async (planId: string) => {
        if (planId === 'free' || planId === currentPlan) return;

        setIsCheckingOut(planId);
        try {
            const { url } = await apiClient.createCheckoutSession(planId as 'monthly' | 'annual');
            if (url) {
                // Open Stripe in a new tab
                window.open(url, '_blank');

                // Show the "Pending" screen in the main app to poll for the update
                setStatus('pending');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.message || 'Falha ao iniciar checkout.');
        } finally {
            setIsCheckingOut(null);
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
                <div className="w-24 h-24 bg-emerald-50 text-[#32a800] rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10 rotate-3">
                    <PartyPopper size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Upgrade Concluído!</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg font-medium leading-relaxed">
                    Sua conta agora é <span className="text-[#32a800] font-bold uppercase tracking-wide">{profile.planType === 'monthly' ? 'Premium Mensal' : 'Premium Anual'}</span>. Aproveite todos os recursos liberados!
                </p>
                <div className="bg-[#32a800] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-[#32a800]/20">
                    <ShieldCheck size={20} />
                    Assinatura Ativa
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[#32a800]/10 blur-2xl rounded-full animate-pulse"></div>
                    <Loader2 size={64} className="text-[#32a800] animate-spin relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Aguardando Pagamento</h2>
                <p className="text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
                    Estamos processando sua transação com a Stripe. O sistema atualizará sozinho em instantes...
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-10 text-xs font-bold text-slate-400 hover:text-[#32a800] uppercase tracking-widest transition-colors duration-300"
                >
                    Voltar para os planos
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-8">
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-6 max-w-6xl mx-auto">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`
                            relative bg-white p-6 md:p-8 rounded-[32px] border transition-all duration-500 flex flex-col group
                            ${plan.highlight
                                ? 'border-[#32a800] shadow-[0_20px_40px_-15px_rgba(50,168,0,0.12)] md:scale-[1.03] z-10'
                                : 'border-slate-100 hover:border-slate-200 shadow-sm'}
                        `}
                    >
                        {plan.badge && (
                            <div className="absolute -top-4 left-6 px-4 py-1.5 bg-[#32a800] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-[#32a800]/20 flex items-center gap-1.5">
                                <Star size={10} fill="currentColor" />
                                {plan.badge}
                            </div>
                        )}

                        <div className="mb-8">
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block ${plan.highlight ? 'text-[#32a800]' : 'text-slate-400'}`}>
                                {plan.name}
                            </span>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">{plan.price}</span>
                                <span className="text-slate-400 font-bold text-sm tracking-wide">{plan.period}</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">{plan.description}</p>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-emerald-50 text-[#32a800]' : 'bg-slate-50 text-slate-300'}`}>
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm tracking-tight font-medium ${plan.highlight ? 'text-slate-700' : 'text-slate-500'}`}>
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={plan.id === currentPlan}
                            className={`
                                w-full py-4 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest
                                ${plan.id === currentPlan
                                    ? 'bg-slate-50 text-slate-400 cursor-default border border-slate-100'
                                    : plan.highlight
                                        ? 'bg-[#32a800] text-white hover:bg-[#2a8c00] shadow-xl shadow-[#32a800]/10 hover:shadow-[#32a800]/20'
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
                                    {isCheckingOut === plan.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            {plan.buttonText}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Support Footer */}
            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                    <ShieldCheck size={14} className="text-[#32a800]" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Pagamento 100% seguro via Stripe
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BillingView;
