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
import { useTranslation } from 'react-i18next';

interface BillingViewProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

type PurchaseStatus = 'idle' | 'pending' | 'success';

const BillingView: React.FC<BillingViewProps> = ({ profile, onChange }) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<PurchaseStatus>('idle');
    const currentPlan = profile.planType || 'free';

    const PLANS = [
        {
            id: 'free',
            name: t('billing.plans.free.name'),
            price: t('billing.plans.free.price'),
            priceUSD: t('billing.plans.free.priceUSD'),
            period: '',
            description: t('billing.plans.free.description'),
            features: [
                t('billing.plans.free.features.0'),
                t('billing.plans.free.features.1'),
                t('billing.plans.free.features.2'),
                t('billing.plans.free.features.3'),
                t('billing.plans.free.features.4'),
            ],
            buttonText: t('billing.plans.free.button'),
            highlight: false,
        },
        {
            id: 'monthly',
            name: t('billing.plans.monthly.name'),
            price: t('billing.plans.monthly.price'),
            priceUSD: t('billing.plans.monthly.priceUSD'),
            trial: t('billing.plans.monthly.trial'),
            thenPay: t('billing.plans.monthly.thenPay'),
            period: '/MÊS',
            description: t('billing.plans.monthly.description'),
            features: [
                t('billing.plans.monthly.features.0'),
                t('billing.plans.monthly.features.1'),
                t('billing.plans.monthly.features.2'),
                t('billing.plans.monthly.features.3'),
                t('billing.plans.monthly.features.4'),
                t('billing.plans.monthly.features.5'),
            ],
            buttonText: t('billing.plans.monthly.button'),
            highlight: true,
        },
        {
            id: 'annual',
            name: t('billing.plans.annual.name'),
            price: t('billing.plans.annual.price'),
            priceUSD: t('billing.plans.annual.priceUSD'),
            period: '/ANO',
            description: t('billing.plans.annual.description'),
            features: [
                t('billing.plans.annual.features.0'),
                t('billing.plans.annual.features.1'),
                t('billing.plans.annual.features.2'),
                t('billing.plans.annual.features.3'),
            ],
            buttonText: t('billing.plans.annual.button'),
            highlight: false,
            badge: t('billing.plans.annual.badge'),
        }
    ];


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
            let url: string;
            if (planId === 'monthly') {
                url = 'https://donate.stripe.com/dRm5kDesReNLbC7aJr0sU00';
            } else {
                const response = await apiClient.createCheckoutSession(planId as 'monthly' | 'annual');
                url = response.url;
            }

            if (url) {
                // Open Stripe in a new tab
                window.open(url, '_blank');

                // Show the "Pending" screen in the main app to poll for the update
                setStatus('pending');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.message || t('billing.checkoutError'));
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
                <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">{t('billing.upgradeComplete')}</h2>
                <p className="text-black/60 max-w-md mx-auto mb-10 text-lg font-bold leading-tight">
                    {t('billing.accountNow')} <span className="bg-black text-[#97cd7a] px-2 py-0.5">{profile.planType === 'monthly' ? t('billing.premiumMonthly') : t('billing.premiumAnnual')}</span>. {t('billing.allFeaturesUnlocked')}
                </p>
                <div className="bg-black text-white px-8 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] font-black uppercase tracking-widest flex items-center gap-3">
                    <ShieldCheck size={24} strokeWidth={3} />
                    {t('billing.activeSubscription')}
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in bg-white border-4 border-black">
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-8 border-black border-t-[#ffdf00] animate-spin shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"></div>
                </div>
                <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-3">{t('billing.awaitingPayment')}</h2>
                <p className="text-black/60 max-w-xs mx-auto leading-tight font-black uppercase text-xs">
                    {t('billing.processingPayment')}
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-10 px-8 py-3 bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-black/90 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                    {t('billing.backToPlans')}
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-8">
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`
                            relative bg-white p-10 border-4 border-black transition-all duration-300 flex flex-col group
                            ${plan.highlight
                                ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:scale-[1.02] z-10'
                                : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                        `}
                    >
                        {plan.id === 'monthly' && (
                            <div className="absolute -top-6 inset-x-0 flex justify-center z-20">
                                <span className="bg-[#97cd7a] text-black border-4 border-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {t('common.tip')}
                                </span>
                            </div>
                        )}
                        {plan.badge && (
                            <div className="absolute -top-5 left-8 px-4 py-1.5 bg-black text-[#ffdf00] text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 z-20">
                                <Star size={12} fill="currentColor" strokeWidth={3} />
                                {plan.badge}
                            </div>
                        )}

                        <div className="mb-10">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 mb-5 block">
                                {plan.name}
                            </span>
                            <div className="flex flex-col gap-1 mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-none">{plan.price}</span>
                                    {plan.period && (
                                        <span className="font-black text-xs uppercase tracking-widest text-black/30 bg-black/5 px-1.5 py-0.5 ml-1">{plan.period}</span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl md:text-2xl font-black text-black/40 tracking-tighter">{plan.priceUSD}</span>
                                    <span className="text-[10px] font-black text-black/20 uppercase">USD</span>
                                </div>

                                {plan.trial && (
                                    <div className="mt-6 flex flex-col gap-2">
                                        <div className="inline-flex items-center self-start px-3 py-1.5 bg-[#97cd7a] text-black text-[11px] font-black uppercase tracking-[0.15em] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {plan.trial}
                                        </div>
                                        {plan.thenPay && (
                                            <span className="text-[10px] font-black text-black/30 uppercase tracking-widest italic">
                                                * {plan.thenPay}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-[12px] font-black leading-[1.3] uppercase tracking-tight text-black/60 min-h-[3em]">
                                {plan.description}
                            </p>
                        </div>

                        <div className="space-y-4 mb-12 flex-1 pt-8 border-t-2 border-black/5">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-4 group/feature">
                                    <div className={`mt-0.5 w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 transition-transform group-hover/feature:scale-110 ${plan.highlight ? 'bg-[#97cd7a]' : 'bg-black text-white'}`}>
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                    <span className="text-[11px] leading-tight font-black uppercase tracking-tight text-black opacity-80 group-hover/feature:opacity-100 transition-opacity">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={plan.id === currentPlan}
                            className={`
                                w-full py-5 border-4 border-black text-[11px] font-black transition-all flex items-center justify-center gap-3 uppercase tracking-[0.25em] relative
                                ${plan.id === currentPlan
                                    ? 'bg-neutral-100 text-black/20 cursor-default border-neutral-200 shadow-none'
                                    : plan.highlight
                                        ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(151,205,122,0.6)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                                        : 'bg-[#ffdf00] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'}
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
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldCheck size={20} className="text-[#97cd7a]" strokeWidth={3} />
                    <span className="text-[10px] text-black font-black uppercase tracking-[0.2em]">
                        {t('billing.securePayment')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BillingView;

