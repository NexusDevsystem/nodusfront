import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import {
    Check,
    Zap,
    CreditCard,
    ArrowRight,
    ShieldCheck,
    BarChart3,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    PartyPopper,
    Star
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [activeIndex, setActiveIndex] = useState(PLANS.findIndex(p => p.id === 'monthly') || 0);

    const handleSelectPlan = async (planId: string) => {
        if (planId === 'free' || planId === currentPlan) return;

        setIsCheckingOut(planId);
        try {
            const response = await apiClient.createCheckoutSession(planId as 'monthly' | 'annual');
            const url = response.url;

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

    useEffect(() => {
        if (status === 'success') {
            const end = Date.now() + 3 * 1000; // 3 seconds of confetti
            const colors = ['#ffdf00', '#97cd7a', '#ffffff', '#1a1a1a'];

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [status]);

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in zoom-in-95 duration-500 min-h-[500px]">
                <div className="relative mb-12">
                    <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 5 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="w-32 h-32 bg-[#97cd7a] border-4 border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] flex items-center justify-center relative z-10"
                    >
                        <PartyPopper size={64} className="text-black" strokeWidth={2.5} />
                    </motion.div>
                    
                    {/* Decorative Background Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ffdf00]/20 rounded-full blur-3xl -z-10" />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-8 border-2 border-dashed border-black/10 rounded-full -z-10" 
                    />
                </div>

                <div className="max-w-xl mx-auto">
                    <h2 className="text-5xl md:text-6xl font-black text-black uppercase tracking-tighter mb-6 leading-none">
                        {t('billing.upgradeComplete')}
                    </h2>
                    
                    <p className="text-lg md:text-xl font-bold bg-[#1a1a1a] text-white inline-block px-6 py-3 mb-8 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#97cd7a] rotate-1">
                        {t('billing.accountNow')} <span className="text-[#97cd7a]">{profile.planType === 'monthly' ? t('billing.premiumMonthly') : t('billing.premiumAnnual')}</span>
                    </p>

                    <p className="text-black/60 font-black uppercase tracking-widest text-sm mb-12">
                        {t('billing.allFeaturesUnlocked')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a]">
                        <ShieldCheck size={24} className="text-[#97cd7a]" strokeWidth={3} />
                        <span className="font-black uppercase tracking-widest text-xs">{t('billing.activeSubscription')}</span>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="group relative px-8 py-4 bg-[#ffdf00] border-2 border-[#1a1a1a] font-black text-xs uppercase tracking-[0.2em] transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                        <div className="absolute inset-0 bg-[#1a1a1a] translate-y-1 -z-10 group-hover:translate-y-2 transition-transform" />
                        Acessar Studio
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in min-h-[500px]">
                <div className="relative mb-12">
                    {/* Layered Brutalist Loader */}
                    <div className="relative">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 border-4 border-[#1a1a1a] border-dashed rounded-full"
                        />
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 m-auto w-16 h-16 border-4 border-[#ffdf00] border-t-transparent rounded-full shadow-[0_4px_0_0_#1a1a1a]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <CreditCard size={28} className="text-black" strokeWidth={3} />
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Decorative bits */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#97cd7a] border-2 border-[#1a1a1a] rotate-12 shadow-[0_2px_0_0_#1a1a1a]" />
                    <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-[#ffdf00] border-2 border-[#1a1a1a] -rotate-12 shadow-[0_2px_0_0_#1a1a1a]" />
                </div>

                <div className="max-w-sm">
                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4 leading-none">
                        {t('billing.awaitingPayment')}
                    </h2>
                    
                    <div className="flex flex-col gap-4 mb-10">
                        <p className="text-black/40 text-xs font-black uppercase tracking-[0.15em] leading-relaxed">
                            {t('billing.processingPayment')}
                        </p>
                        
                        <div className="flex items-center justify-center gap-2 bg-black/5 self-center px-4 py-2 rounded-full border border-black/5">
                            <ShieldCheck size={14} className="text-[#97cd7a]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">
                                Transação Protegida via Stripe
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setStatus('idle')}
                    className="group relative px-10 py-4 bg-white border-2 border-[#1a1a1a] font-black text-[12px] uppercase tracking-widest transition-all hover:-translate-y-1 active:translate-y-0"
                >
                    <div className="absolute inset-0 bg-[#1a1a1a] translate-y-1 -z-10 group-hover:translate-y-2 transition-transform" />
                    {t('billing.backToPlans')}
                </button>
            </div>
        );
    }


    const nextPlan = () => setActiveIndex((prev) => (prev + 1) % PLANS.length);
    const prevPlan = () => setActiveIndex((prev) => (prev - 1 + PLANS.length) % PLANS.length);

    const SPECIFICATIONS = [
        { label: 'Links Ilimitados', free: true, monthly: true, annual: true },
        { label: 'Biblioteca de Temas', free: '8 temas', monthly: 'Ilimitado', annual: 'Ilimitado' },
        { label: 'Fontes e Tipografia', free: '10 opções', monthly: 'Ilimitado', annual: 'Ilimitado' },
        { label: 'Personalização de Cores', free: false, monthly: true, annual: true },
        { label: 'Analytics Pro', free: '7 dias', monthly: 'Ilimitado', annual: 'Ilimitado' },
        { label: 'Loja Digital', free: 'limitada', monthly: 'Ilimitada', annual: 'Ilimitada' },
        { label: 'Hospedagem de Arquivos', free: '2 arquivos', monthly: 'Ilimitado', annual: 'Ilimitado' },
        { label: 'Remover Branding Nodus', free: false, monthly: true, annual: true },
        { label: 'Suporte Prioritário', free: false, monthly: true, annual: true },
    ];

    return (
        <div className="animate-fade-in pb-24 flex flex-col">
            <div className="flex flex-col-reverse lg:flex-row items-start justify-center gap-8 max-w-7xl mx-auto w-full px-2 md:px-4">
                {/* Left Side: Specifications */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-[340px] shrink-0"
                >
                    <div className="bg-white border-2 border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] md:shadow-[0_8px_0_0_#1a1a1a] rounded-[24px] md:rounded-[32px] p-6 md:p-8 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#ffdf00] border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center shadow-[0_3px_0_0_#1a1a1a]">
                                <BarChart3 size={20} className="text-black" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Especificações</h3>
                        </div>

                        <div className="space-y-4">
                            {SPECIFICATIONS.map((spec, i) => {
                                const currentPlanId = PLANS[activeIndex].id;
                                const value = spec[currentPlanId as keyof typeof spec];
                                
                                return (
                                    <div key={i} className="flex flex-col gap-2 group/spec text-[12px]">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black uppercase tracking-tight text-black/60 group-hover/spec:text-black transition-colors">{spec.label}</span>
                                            <div className="flex flex-col items-end">
                                                {value === true ? (
                                                    <Check size={16} className="text-[#97cd7a]" strokeWidth={4} />
                                                ) : value ? (
                                                    <span className="font-black text-[#97cd7a] uppercase text-[10px]">{value}</span>
                                                ) : (
                                                    <X size={16} className="text-red-400/30" strokeWidth={4} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-[1px] w-full bg-black/5"></div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Moved Secure Payment Footer */}
                        <div className="mt-10 pt-8 border-t-2 border-dashed border-black/5">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3 opacity-70">
                                    <ShieldCheck size={20} className="text-black" strokeWidth={3} />
                                    <span className="text-[10px] text-black font-black uppercase tracking-[0.2em]">{t('billing.securePayment')}</span>
                                </div>
                                <div className="flex items-center gap-6 opacity-40">
                                    <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-5" alt="Visa" />
                                    <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-6" alt="Mastercard" />
                                    <img src="https://img.icons8.com/color/48/000000/stripe.png" className="h-6" alt="Stripe" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Plans Carousel */}
                <div className="w-full lg:max-w-xl flex flex-col gap-4 md:gap-6">
                    {/* Unified Carousel Controls */}
                    <div className="flex items-center justify-between bg-white border-2 border-[#1a1a1a] rounded-xl md:rounded-2xl px-4 md:px-6 py-2.5 md:py-3 shadow-[0_4px_0_0_#1a1a1a]">
                        <div className="flex items-center gap-2">
                            {PLANS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-2 transition-all duration-300 rounded-full ${i === activeIndex ? 'w-8 bg-black' : 'w-2 bg-black/10'}`}
                                />
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                                {activeIndex + 1} / {PLANS.length}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={prevPlan}
                                    className="p-2 border-2 border-[#1a1a1a] bg-white rounded-lg hover:bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a] hover: transition-colors active:scale-95"
                                >
                                    <ChevronLeft size={18} strokeWidth={3} />
                                </button>
                                <button 
                                    onClick={nextPlan}
                                    className="p-2 border-2 border-[#1a1a1a] bg-white rounded-lg hover:bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a] hover: transition-colors active:scale-95"
                                >
                                    <ChevronRight size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4"
                            >
                                {(() => {
                                    const plan = PLANS[activeIndex];
                                    return (
                                        <div
                                            className="relative bg-white p-4 md:p-12 border-2 border-[#1a1a1a] rounded-[32px] md:rounded-[40px] flex flex-col group shadow-[0_8px_0_0_#1a1a1a] md:shadow-[0_12px_0_0_#1a1a1a]"
                                        >
                                            {plan.id === 'monthly' && (
                                                <div className="absolute -top-4 left-10 flex justify-center z-40">
                                                    <span className="bg-[#97cd7a] text-black border-2 border-[#1a1a1a] px-5 py-2 text-[11px] font-black uppercase tracking-widest shadow-[0_4px_0_0_#1a1a1a] rounded-xl">
                                                        {t('common.tip')}
                                                    </span>
                                                </div>
                                            )}

                                            {plan.badge && (
                                                <div className="absolute -top-4 left-10 px-5 py-2 bg-black text-[#ffdf00] text-[11px] font-black uppercase tracking-widest border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] flex items-center gap-2 z-40 rounded-xl">
                                                    <Star size={14} fill="currentColor" />
                                                    {plan.badge}
                                                </div>
                                            )}

                                            <div className="mb-8">
                                                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-black/30 mb-6 block">
                                                    {plan.name}
                                                </span>
                                                <div className="flex flex-col gap-2 mb-8">
                                                    <div className="flex items-baseline gap-3">
                                                        <span className="text-6xl md:text-7xl font-black text-black tracking-tighter leading-none">{plan.price}</span>
                                                        {plan.period && (
                                                            <span className="font-black text-sm uppercase tracking-widest text-black/40 bg-black/5 px-3 py-1.5 rounded-xl">{plan.period}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl font-black text-black/20 tracking-tighter">{plan.priceUSD}</span>
                                                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">USD</span>
                                                    </div>


                                                </div>
                                                <p className="text-[14px] font-bold leading-relaxed uppercase tracking-tight text-black/40 border-l-4 border-[#ffdf00] pl-6 max-w-sm">
                                                    {plan.description}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-10 pt-10 border-t-2 border-black/5">
                                                {plan.features.slice(0, 6).map((feature, idx) => (
                                                    <div key={idx} className="flex items-start gap-4">
                                                        <div className="mt-0.5 w-6 h-6 bg-[#97cd7a] border-2 border-[#1a1a1a] flex items-center justify-center shrink-0 rounded-lg shadow-[0_2px_0_0_#1a1a1a]">
                                                            <Check size={12} strokeWidth={4} className="text-black" />
                                                        </div>
                                                        <span className="text-[11px] leading-tight font-black uppercase tracking-tight text-black/70">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => handleSelectPlan(plan.id)}
                                                disabled={plan.id === currentPlan}
                                                className={`
                                                    w-full py-6 border-2 border-[#1a1a1a] text-[13px] font-black transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] relative overflow-hidden group/btn rounded-[28px]
                                                    ${plan.id === currentPlan
                                                        ? 'bg-[#f0f0f0] text-black/20 cursor-default border-neutral-200 shadow-none'
                                                        : plan.id === 'annual'
                                                            ? 'bg-black text-white shadow-[0_8px_0_0_#ffdf00] hover:translate-y-1 hover:shadow-none'
                                                            : 'bg-[#ffdf00] text-black shadow-[0_8px_0_0_#1a1a1a] hover:translate-y-1 hover:shadow-none'}
                                                `}
                                            >
                                                {plan.id === currentPlan ? (
                                                    <ShieldCheck size={24} strokeWidth={3} className="text-black/20" />
                                                ) : isCheckingOut === plan.id ? (
                                                    <Loader2 size={24} className="animate-spin" strokeWidth={3} />
                                                ) : (
                                                    <>
                                                        <span className="relative z-10">{plan.buttonText}</span>
                                                        <ArrowRight size={24} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BillingView;

