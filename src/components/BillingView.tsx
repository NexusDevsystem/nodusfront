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
        description: 'TUDO O QUE VOCÊ PRECISA PARA COMEÇAR SUA PRESENÇA ONLINE.',
        features: [
            'LINKS ILIMITADOS',
            'NEWSLETTER WIDGET',
            'TEMAS BÁSICOS ANIMADOS',
            'ANALYTICS BÁSICO (7 DIAS)',
            'SUPORTE VIA EMAIL'
        ],
        buttonText: 'PLANO ATUAL',
        highlight: false,
    },
    {
        id: 'monthly',
        name: 'Mensal',
        price: 'R$ 29,90',
        period: '/MÊS',
        description: 'RECURSOS AVANÇADOS PARA PROFISSIONAIS E CRIADORES.',
        features: [
            'TODOS OS RECURSOS DO GRATUITO',
            'TEMAS PRO & EXCLUSIVIDADE',
            'DESIGN PERSONALIZADO (CORES/BLUR)',
            'ANALYTICS COMPLETO (30 DIAS)',
            'LOJA COM PRODUTOS ILIMITADOS',
            'SUPORTE PRIORITÁRIO'
        ],
        buttonText: 'ASSINAR MENSAL',
        highlight: true,
    },
    {
        id: 'annual',
        name: 'Anual',
        price: 'R$ 299',
        period: '/ANO',
        description: 'A MELHOR ESCOLHA PARA QUEM QUER CRESCER RÁPIDO.',
        features: [
            '2 MESES GRÁTIS (ECONOMIA R$ 59)',
            'TODOS OS RECURSOS DO MENSAL',
            'ACESSO ANTECIPADO A BETA',
            'REMOVER MARCA NODUS'
        ],
        buttonText: 'ASSINAR ANUAL',
        highlight: false,
        badge: 'MELHOR VALOR',
    }
];

type PurchaseStatus = 'idle' | 'pending' | 'success';

const BillingView: React.FC<BillingViewProps> = ({ profile, onChange }) => {
    const [status, setStatus] = useState<PurchaseStatus>('idle');
    const currentPlan = profile.planType || 'free';

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data === 'stripe-payment-success') {
                console.log('💳 Payment success message received. Syncing...');
                try {
                    const updatedProfile = await apiClient.autoReconcile();
                    if (updatedProfile.planType !== 'free' && updatedProfile.planType !== currentPlan) {
                        setStatus('success');
                        onChange(updatedProfile);

                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#32a800', '#acc8a2', '#ffffff']
                        });
                    }
                } catch (error) {
                    console.error('Manual reconciliation error:', error);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [currentPlan, onChange]);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (status === 'pending') {
            pollInterval = setInterval(async () => {
                try {
                    // Use autoReconcile to force a check against Stripe API
                    // This handles cases where webhooks are delayed or fail locally
                    const updatedProfile = await apiClient.autoReconcile();

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
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-[#97cd7a] text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 rotate-3">
                    <PartyPopper size={48} strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">Upgrade Concluído!</h2>
                <p className="text-black/60 max-w-md mx-auto mb-10 text-lg font-bold leading-tight">
                    SUA CONTA AGORA É <span className="bg-black text-[#97cd7a] px-2 py-0.5">{profile.planType === 'monthly' ? 'PREMIUM MENSAL' : 'PREMIUM ANUAL'}</span>. APROVEITE TODOS OS RECURSOS LIBERADOS!
                </p>
                <div className="bg-black text-white px-8 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] font-black uppercase tracking-widest flex items-center gap-3">
                    <ShieldCheck size={24} strokeWidth={3} />
                    Assinatura Ativa
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-black border-t-[#ffdf00] animate-spin"></div>
                </div>
                <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-3">Aguardando Pagamento</h2>
                <p className="text-black/60 max-w-xs mx-auto leading-tight font-bold uppercase text-sm">
                    Estaremos processando sua transação com a Stripe. O sistema atualizará sozinho em instantes...
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-10 px-6 py-2 border-2 border-black font-black text-[10px] text-black hover:bg-black hover:text-white uppercase tracking-widest transition-all"
                >
                    Voltar para os planos
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-8">
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`
                            relative bg-white p-8 border-4 border-black transition-all duration-300 flex flex-col group
                            ${plan.highlight
                                ? 'bg-[#97cd7a] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] -rotate-1 md:scale-[1.05] z-10'
                                : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'}
                        `}
                    >
                        {plan.badge && (
                            <div className="absolute -top-5 left-6 px-4 py-1.5 bg-black text-[#ffdf00] text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 z-20">
                                <Star size={12} fill="currentColor" strokeWidth={3} />
                                {plan.badge}
                            </div>
                        )}

                        <div className="mb-8">
                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] mb-4 block ${plan.highlight ? 'text-black' : 'text-black/40'}`}>
                                {plan.name}
                            </span>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl md:text-6xl font-black text-black tracking-tighter">{plan.price}</span>
                                <span className={`font-black text-xs uppercase tracking-widest ${plan.highlight ? 'text-black/60' : 'text-black/30'}`}>{plan.period}</span>
                            </div>
                            <p className={`text-xs font-bold leading-tight uppercase tracking-tight ${plan.highlight ? 'text-black/80' : 'text-black/50'}`}>{plan.description}</p>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-black text-[#97cd7a]' : 'bg-white text-black'}`}>
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                    <span className={`text-[11px] leading-tight font-black uppercase tracking-tight ${plan.highlight ? 'text-black' : 'text-black/70'}`}>
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={plan.id === currentPlan}
                            className={`
                                w-full py-5 border-4 border-black text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em]
                                ${plan.id === currentPlan
                                    ? 'bg-white text-black/20 cursor-default border-black/10'
                                    : plan.highlight
                                        ? 'bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                                        : 'bg-[#ffdf00] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'}
                            `}
                        >
                            {plan.id === currentPlan ? (
                                <>
                                    <ShieldCheck size={18} strokeWidth={3} className="text-black/20" />
                                    {plan.buttonText}
                                </>
                            ) : (
                                <>
                                    {isCheckingOut === plan.id ? (
                                        <Loader2 size={18} className="animate-spin" strokeWidth={3} />
                                    ) : (
                                        <>
                                            {plan.buttonText}
                                            <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Support Footer */}
            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldCheck size={20} className="text-[#97cd7a]" strokeWidth={3} />
                    <span className="text-[10px] text-black font-black uppercase tracking-[0.2em]">
                        Pagamento 100% seguro via Stripe
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BillingView;
