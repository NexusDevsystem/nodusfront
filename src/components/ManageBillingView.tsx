import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Receipt, ShieldCheck, ExternalLink, Loader2, ChevronRight, Download, Eye, X, CheckCircle2, Crown, Wallet } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'react-router-dom';

interface ManageBillingViewProps {
    profile: UserProfile;
}

interface Invoice {
    id: string;
    amount_paid: number;
    currency: string;
    status: string;
    created: number;
    invoice_pdf: string;
    number: string;
    hosted_invoice_url: string;
}

const ManageBillingView: React.FC<ManageBillingViewProps> = ({ profile }) => {
    const { t } = useTranslation();
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [loadingInvoices, setLoadingInvoices] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchInvoices = async () => {
            if (!profile.stripeCustomerId) {
                setLoadingInvoices(false);
                return;
            }
            try {
                const data = await apiClient.getInvoices();
                setInvoices(data.data || []);
            } catch (err) {
                console.error('Error fetching invoices:', err);
            } finally {
                setLoadingInvoices(false);
            }
        };
        fetchInvoices();
    }, [profile.stripeCustomerId]);

    const handleManageBilling = async () => {
        setLoadingPortal(true);
        try {
            const { url } = await apiClient.createPortalSession();
            if (url) {
                window.open(url, '_blank');
            }
        } catch (err: any) {
            console.error('Portal Error:', err);
        } finally {
            setLoadingPortal(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount / 100);
    };

    const isFree = !profile.planType || profile.planType === 'free';

    return (
        <div className="relative min-h-screen pb-20 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-12 animate-fade-in px-8 md:px-12 pt-10">
            {/* Minimal Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-[#1a1a1a] pb-8 w-full block"
                >
                    <div className="relative ml-4 md:ml-6">
                        <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-2.5 h-10 bg-[#ffdf00] border-2 border-[#1a1a1a]" />
                        <h2 className="text-4xl font-black text-black uppercase tracking-tighter leading-none italic">
                            {t('billing.billing', 'Faturamento')}
                        </h2>
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-[0.3em] mt-3 ml-1">
                            {t('billing.manageBilling', 'Gestão de assinatura e pagamentos')}
                        </p>
                    </div>
                    
                    {!isFree && profile.stripeCustomerId && (
                        <motion.button
                            whileHover={{ scale: 1.02, x: 2, y: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleManageBilling}
                            disabled={loadingPortal}
                            className="group relative flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-widest text-white bg-[#1a1a1a] py-4 px-10 border-2 border-[#1a1a1a] rounded-2xl transition-all disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-[#97cd7a] translate-x-1.5 translate-y-1.5 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform rounded-2xl" />
                            {loadingPortal ? <Loader2 size={16} className="animate-spin text-[#97cd7a]" /> : <ExternalLink size={16} strokeWidth={3} className="text-[#97cd7a]" />}
                            <span className="relative z-10">{t('billing.stripePortal', 'Portal Stripe')}</span>
                        </motion.button>
                    )}
                </motion.div>

            {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {/* Plan Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group bg-white p-8 border-4 border-[#1a1a1a] shadow-[12px_12px_0px_0px_#1a1a1a] rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[200px]"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:bg-[#97cd7a]/10" />
                        
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">{t('billing.currentSubscription', 'Assinatura Atual')}</p>
                                <h3 className="text-3xl font-black text-black uppercase tracking-tighter leading-none mb-6">
                                    {isFree ? 'Nodus Free' : `Nodus Premium ${profile.planType === 'monthly' ? t('billing.monthly', 'Mensal') : t('billing.yearly', 'Anual')}`}
                                </h3>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className={`w-14 h-14 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center shadow-[3px_3px_0px_0px_#1a1a1a] ${isFree ? 'bg-slate-50 text-black/10' : 'bg-[#97cd7a] text-black'}`}>
                                    <Crown size={28} strokeWidth={3} className={!isFree ? 'fill-black/20' : ''} />
                                </div>
                            </div>
                        </div>
                        
                        {!isFree && (
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="flex items-center gap-2 text-[11px] font-black text-black uppercase tracking-widest bg-[#97cd7a] px-4 py-2 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] rounded-xl">
                                    <CheckCircle2 size={14} strokeWidth={3} />
                                    {t('billing.activeUntil', 'Ativo até')} {profile.subscriptionExpiryDate ? new Date(profile.subscriptionExpiryDate).toLocaleDateString('pt-BR') : '--/--/----'}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Method Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group bg-white p-8 border-4 border-[#1a1a1a] shadow-[12px_12px_0px_0px_#1a1a1a] rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[200px]"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:bg-[#ffdf00]/10 rounded-full" />
                        
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">{t('billing.billingMethod', 'Método de Cobrança')}</p>
                                <h3 className="text-3xl font-black text-black uppercase tracking-tighter leading-none mb-6">
                                    {isFree ? t('billing.manualInvoices', 'Faturas Manuais') : (profile.stripeCustomerId ? t('billing.creditCard', 'Cartão de Crédito') : t('billing.internal', 'Interno'))}
                                </h3>
                            </div>
                            <div className="w-14 h-14 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-black bg-white shadow-[3px_3px_0px_0px_#1a1a1a]">
                                <Wallet size={28} strokeWidth={3} />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 opacity-60 relative z-10">
                            <ShieldCheck size={16} className="text-[#97cd7a]" strokeWidth={3} />
                            <p className="text-[10px] text-black font-black uppercase tracking-widest leading-tight">
                                {profile.stripeCustomerId
                                    ? t('billing.stripeSecurity', 'Segurança via infraestrutura Stripe')
                                    : t('billing.manualManagement', 'Assinatura gerenciada manualmente')}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Invoices Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6 w-full"
                >
                    <div className="flex items-center gap-4 border-b-2 border-black/10 pb-4">
                        <div className="w-8 h-8 bg-black border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#97cd7a] flex items-center justify-center text-white">
                            <Receipt size={16} strokeWidth={3} />
                        </div>
                        <h3 className="text-sm font-black text-black uppercase tracking-[0.2em]">{t('billing.receiptHistory', 'Histórico de Recibos')}</h3>
                    </div>

                    {loadingInvoices ? (
                        <div className="relative overflow-hidden bg-white border-4 border-[#1a1a1a] p-12 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-black/5">
                                <motion.div 
                                    className="h-full bg-[#97cd7a]"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="relative mb-6">
                                    <Loader2 size={48} className="text-[#97cd7a] animate-spin" strokeWidth={3} />
                                    <motion.div 
                                        className="absolute inset-0 border-4 border-[#ffdf00] -m-1"
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                </div>
                                <p className="text-[13px] text-black font-black uppercase tracking-[0.4em] mb-2">
                                    {t('billing.syncingInvoices', 'Sincronizando')}
                                </p>
                                <div className="flex gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div 
                                            key={i}
                                            className="w-1.5 h-1.5 bg-black"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Scanning bar effect */}
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-[#97cd7a]/10 to-transparent h-20 -translate-y-full"
                                animate={{ translateY: ['0%', '500%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    ) : invoices.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {invoices.map((invoice, idx) => (
                                <motion.div
                                    key={invoice.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.05 }}
                                    className="group bg-white p-6 border-2 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] rounded-2xl transition-all hover:bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden cursor-pointer"
                                    onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#97cd7a] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-14 h-14 flex items-center justify-center text-black/10 group-hover:text-[#97cd7a] transition-all">
                                            <Download size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-black text-black uppercase tracking-[0.1em] mb-1">{invoice.number || t('billing.receiptFallback', 'Recibo Nodus')}</h4>
                                            <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">{formatDate(invoice.created)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-10 relative z-10 sm:border-t-0 border-t border-black/5 pt-4 sm:pt-0">
                                        <div className="text-left sm:text-right">
                                            <p className="text-2xl font-black text-black tracking-tight leading-none mb-1">{formatCurrency(invoice.amount_paid, invoice.currency)}</p>
                                            <div className="flex items-center gap-2 sm:justify-end text-[10px] font-black uppercase tracking-widest text-[#97cd7a]">
                                                <div className="w-2 h-2 rounded-full bg-[#97cd7a] animate-pulse" />
                                                {t('billing.paid', 'Pago')}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 border-2 border-[#1a1a1a] bg-[#1a1a1a] text-white flex items-center justify-center group-hover:bg-[#ffdf00] group-hover:text-black transition-all rotate-0 group-hover:rotate-90 rounded-lg">
                                            <ChevronRight size={20} strokeWidth={4} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-10 border-2 border-[#1a1a1a] border-dashed text-center">
                            <div className="w-12 h-12 bg-slate-50 border border-[#1a1a1a] flex items-center justify-center mx-auto mb-4 text-black/10 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                                <Receipt size={24} strokeWidth={3} />
                            </div>
                            <h4 className="text-black font-black uppercase tracking-widest text-xs mb-1">{t('billing.noReceipts', 'Sem recibos')}</h4>
                            <p className="text-black font-bold uppercase tracking-widest text-[8px] opacity-40 max-w-[200px] mx-auto">{t('billing.receiptsAppearAuto', 'Seus recibos aparecerão aqui automaticamente.')}</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ManageBillingView;
