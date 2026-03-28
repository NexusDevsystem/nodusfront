import React, { useEffect, useState, useRef } from 'react';
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
    const currentPlan = profile.plan_type || 'free';

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

    const checkoutTab = useRef<Window | null>(null);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data === 'stripe-payment-success' || event.data === 'abacatepay-payment-success') {
                console.log('💳 Payment success message received. Syncing...');
                
                // ZAP! Close the checkout tab if it's still open
                if (checkoutTab.current) {
                    checkoutTab.current.close();
                    checkoutTab.current = null;
                }

                try {
                    const updatedProfile = await apiClient.autoReconcile();
                    if (updatedProfile.plan_type !== 'free' && updatedProfile.plan_type !== currentPlan) {
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
                    // Check if online before polling to avoid net::ERR errors
                    if (!window.navigator.onLine) return;

                    const updatedProfile = await apiClient.autoReconcile();

                    if (updatedProfile.plan_type !== 'free' && updatedProfile.plan_type !== currentPlan) {
                        // ZAP! Close checkout tab immediately
                        if (checkoutTab.current) {
                            checkoutTab.current.close();
                            checkoutTab.current = null;
                        }

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
                } catch (error: any) {
                    // Only log if it's a real error, not a network hiccup
                    if (window.navigator.onLine) {
                        console.error('Polling error:', error);
                    }
                }
            }, 5000); // 5 second intervals to be safer against rate limiting/network issues

            return () => {
                clearInterval(pollInterval);
            };
        }
    }, [status, currentPlan, onChange]);

    const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

    const handleSelectPlan = async (planId: string) => {
        if (planId === 'free' || planId === currentPlan) return;

        // 🔥 CORREÇÃO PARA MOBILE: Abrir janela em branco imediatamente para preservar o contexto do gesto
        // Isso evita que o navegador mobile bloqueie o popup após a chamada assíncrona da API.
        const newWindow = window.open('about:blank', '_blank');
        checkoutTab.current = newWindow;

        setIsCheckingOut(planId);
        try {
            const response = await apiClient.createCheckoutSession(
                planId as 'monthly' | 'annual'
            );
            const url = response.url;

            if (url && newWindow) {
                // Atualiza a janela que já abrimos com o link real do checkout
                newWindow.location.assign(url);
                setStatus('pending');
            } else if (newWindow) {
                newWindow.close();
            }
        } catch (error: any) {
            // Se falhar (incluindo o erro de rede), fechamos a janela em branco
            if (newWindow) newWindow.close();
            console.error('Checkout error:', error);
            alert(error.message || t('billing.checkoutError'));
        } finally {
            setIsCheckingOut(null);
        }
    };

    useEffect(() => {
        if (status === 'success') {
            // ZAP! Ensure checkout tab is closed when entering success state
            if (checkoutTab.current) {
                checkoutTab.current.close();
                checkoutTab.current = null;
            }

            const end = Date.now() + 3 * 1000;
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ffdf00]/20 rounded-full blur-3xl -z-10" />
                </div>

                <div className="max-w-xl mx-auto">
                    <h2 className="text-5xl md:text-6xl font-black text-black uppercase tracking-tighter mb-6 leading-none">
                        {t('billing.upgradeComplete')}
                    </h2>
                    <p className="text-lg md:text-xl font-bold bg-[#1a1a1a] text-white inline-block px-6 py-3 mb-8 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#97cd7a] rotate-1">
                        {t('billing.accountNow')} <span className="text-[#97cd7a]">{profile.plan_type === 'monthly' ? t('billing.premiumMonthly') : t('billing.premiumAnnual')}</span>
                    </p>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="group relative px-8 py-4 bg-[#ffdf00] border-2 border-[#1a1a1a] font-black text-xs uppercase tracking-[0.2em] transition-all hover:-translate-y-1 active:translate-y-0"
                >
                    <div className="absolute inset-0 bg-[#1a1a1a] translate-y-1 -z-10 group-hover:translate-y-2 transition-transform" />
                    Acessar Studio
                </button>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in min-h-[500px]">
                <div className="relative mb-12">
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
                </div>

                <div className="max-w-sm">
                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4 leading-none">{t('billing.awaitingPayment')}</h2>
                    <p className="text-black/40 text-xs font-black uppercase tracking-[0.15em] mb-10">{t('billing.processingPayment')}</p>
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
        <div className="animate-fade-in pb-12 flex flex-col gap-10">
            {/* 3 Plans side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4">
                {PLANS.map((plan, i) => {
                    const isCurrent = plan.id === currentPlan;
                    return (
                        <div 
                            key={plan.id}
                            className={`
                                relative bg-white border-2 border-[#1a1a1a] p-6 md:p-10 rounded-[40px] flex flex-col transition-all duration-300
                                ${plan.highlight ? 'shadow-[0_12px_0_0_#ffdf00] -translate-y-2 border-[#1a1a1a] z-20' : 'shadow-[0_8px_0_0_#1a1a1a] hover:-translate-y-1'}
                                ${isCurrent ? 'bg-slate-50 opacity-90' : ''}
                            `}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-10 px-4 py-1.5 bg-black text-[#97cd7a] text-[10px] font-black uppercase tracking-widest border-2 border-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] rounded-lg">
                                    {plan.badge}
                                </div>
                            )}

                            {isCurrent && (
                                <div className="absolute -top-4 right-10 px-4 py-1.5 bg-[#97cd7a] text-black text-[10px] font-black uppercase tracking-widest border-2 border-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] rounded-lg">
                                    {t('billing.currentPlan')}
                                </div>
                            )}

                            <div className="mb-6">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ${plan.highlight ? 'text-[#97cd7a]' : 'text-black/30'}`}>{plan.name}</span>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none">{plan.price}</span>
                                    {plan.period && <span className="font-black text-[10px] uppercase tracking-widest text-black/40 bg-black/5 px-2 py-1 rounded-md">{plan.period}</span>}
                                </div>
                                <p className="text-[12px] font-bold leading-relaxed uppercase tracking-tight text-black/40 border-l-4 border-[#ffdf00] pl-4 mb-8">{plan.description}</p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8 pt-6 border-t-2 border-black/5">
                                {plan.features.slice(0, 6).map((f, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 w-5 h-5 bg-[#97cd7a] border-2 border-[#1a1a1a] flex items-center justify-center rounded-sm shadow-[0_2px_0_0_#1a1a1a] shrink-0">
                                            <Check size={10} strokeWidth={4} className="text-black" />
                                        </div>
                                        <span className="text-[10px] leading-tight font-black uppercase tracking-tight text-black/70">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={plan.id === 'free' || isCurrent}
                                className={`
                                    w-full py-5 border-2 border-[#1a1a1a] text-[11px] font-black flex items-center justify-center gap-3 uppercase tracking-[0.2em] rounded-[24px] transition-all
                                    ${isCurrent 
                                        ? 'bg-[#f0f0f0] text-black/20 cursor-default' 
                                        : plan.id === 'annual' 
                                            ? 'bg-black text-white shadow-[0_6px_0_0_#ffdf00] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#ffdf00] active:shadow-none active:translate-y-[6px]' 
                                            : 'bg-[#ffdf00] text-black shadow-[0_6px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#1a1a1a] active:shadow-none active:translate-y-[6px]'}
                                `}
                            >
                                {isCheckingOut === plan.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <span className="relative z-10">{isCurrent ? t('billing.currentPlan') : plan.buttonText}</span>
                                        {!isCurrent && plan.id !== 'free' && <ArrowRight size={18} />}
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Table Comparison */}
            <div className="max-w-7xl mx-auto w-full px-4 mt-8">
                <div className="bg-white border-2 border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] rounded-[32px] overflow-hidden">
                    <div className="p-6 md:p-8 border-b-2 border-[#1a1a1a] bg-slate-50 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ffdf00] border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#1a1a1a]">
                            <BarChart3 size={24} className="text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Comparativo Detalhado</h3>
                            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-0.5">Veja todas as especificações técnicas</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40 border-b-2 border-r-2 border-[#1a1a1a]/5">Recursos</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40 border-b-2 border-r-2 border-[#1a1a1a]/5 text-center">Free</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#97cd7a] border-b-2 border-r-2 border-[#1a1a1a]/5 text-center bg-[#97cd7a]/5">Pro Mensal</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#ffdf00] border-b-2 border-[#1a1a1a]/5 text-center bg-[#ffdf00]/5">Pro Anual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {SPECIFICATIONS.map((spec, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-4 text-[12px] font-black uppercase tracking-tight text-black border-b border-r border-[#1a1a1a]/5">{spec.label}</td>
                                        <td className="px-8 py-4 text-center border-b border-r border-[#1a1a1a]/5">
                                            {spec.free === true ? <Check size={18} className="text-[#97cd7a] mx-auto" strokeWidth={4} /> : spec.free ? <span className="text-[10px] font-black text-black/40 uppercase">{spec.free}</span> : <X size={18} className="text-black/10 mx-auto" strokeWidth={3} />}
                                        </td>
                                        <td className="px-8 py-4 text-center border-b border-r border-[#1a1a1a]/5 bg-[#97cd7a]/2">
                                            {spec.monthly === true ? <Check size={18} className="text-[#97cd7a] mx-auto" strokeWidth={4} /> : spec.monthly ? <span className="text-[10px] font-black text-[#97cd7a] uppercase">{spec.monthly}</span> : <X size={18} className="text-black/10 mx-auto" strokeWidth={3} />}
                                        </td>
                                        <td className="px-8 py-4 text-center border-b border-[#1a1a1a]/5 bg-[#ffdf00]/2">
                                            {spec.annual === true ? <Check size={18} className="text-[#97cd7a] mx-auto" strokeWidth={4} /> : spec.annual ? <span className="text-[10px] font-black text-[#ffdf00] uppercase">{spec.annual}</span> : <X size={18} className="text-black/10 mx-auto" strokeWidth={3} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer trust elements */}
            <div className="max-w-7xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pagamento 100% Seguro via AbacatePay</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-widest">Pix Oficial</span>
                </div>
            </div>
        </div>
    );
};

export default BillingView;
