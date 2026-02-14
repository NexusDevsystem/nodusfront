import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { CreditCard, Receipt, ShieldCheck, ExternalLink, Zap, Loader2, ChevronRight, Download, Eye, X, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';

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
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [loadingInvoices, setLoadingInvoices] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Faturamento</h2>
                    <p className="text-slate-500 mt-2 font-medium">Gerencie sua assinatura e visualize seu histórico de pagamentos.</p>
                </div>
                {!isFree && profile.stripeCustomerId && (
                    <button
                        onClick={handleManageBilling}
                        disabled={loadingPortal}
                        className="flex items-center gap-2 text-xs font-bold text-[#32a800] hover:text-[#2a8c00] transition-all py-2.5 px-5 bg-emerald-50 rounded-full border border-emerald-100 disabled:opacity-50 active:scale-95"
                    >
                        {loadingPortal ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                        Portal Financeiro Stripe
                    </button>
                )}
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assinatura Atual</p>
                            <h3 className="text-xl font-bold text-slate-900">
                                {isFree ? 'Nodus Free' : `Nodus Premium ${profile.planType === 'monthly' ? 'Mensal' : 'Anual'}`}
                            </h3>
                        </div>
                        <div className={`p-4 rounded-2xl ${isFree ? 'bg-slate-50 text-slate-300' : 'bg-emerald-50 text-[#32a800]'}`}>
                            <Zap size={24} className={!isFree ? 'fill-[#32a800]/20' : ''} />
                        </div>
                    </div>
                    {!isFree && (
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100/50">
                            <CheckCircle2 size={14} />
                            Ativo até {profile.subscriptionExpiryDate ? new Date(profile.subscriptionExpiryDate).toLocaleDateString('pt-BR') : '--/--/----'}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Método de Cobrança</p>
                            <h3 className="text-xl font-bold text-slate-900">
                                {isFree ? 'Faturas Manuais' : (profile.stripeCustomerId ? 'Cartão de Crédito' : 'Sistema Interno')}
                            </h3>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 text-slate-300">
                            <CreditCard size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-tight">
                        {profile.stripeCustomerId
                            ? 'Segurança garantida pela infraestrutura de pagamentos Stripe.'
                            : 'Assinatura gerenciada manualmente pela administração.'}
                    </p>
                </div>
            </div>

            {/* Invoices Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl">
                        <Receipt size={20} className="text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Histórico de Recibos</h3>
                </div>

                {loadingInvoices ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[32px] border border-slate-200 border-dashed">
                        <Loader2 size={32} className="text-[#32a800] animate-spin mb-4" />
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Sincronizando faturas...</p>
                    </div>
                ) : invoices.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="bg-white p-5 rounded-[24px] border border-slate-100 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/[0.04] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-[#32a800] transition-colors">
                                        <Receipt size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{invoice.number || 'Recibo Nodus'}</h4>
                                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{formatDate(invoice.created)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-50 pt-4 sm:pt-0">
                                    <div className="text-left sm:text-right">
                                        <p className="text-lg font-bold text-slate-900">{formatCurrency(invoice.amount_paid, invoice.currency)}</p>
                                        <div className="flex items-center gap-1 sm:justify-end text-[10px] font-bold uppercase text-emerald-600">
                                            <CheckCircle2 size={10} />
                                            Pago
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#32a800] group-hover:text-white transition-all transform group-hover:scale-110">
                                        <ChevronRight size={18} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-[32px] border border-dashed border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <Receipt size={32} />
                        </div>
                        <h4 className="text-slate-900 font-bold mb-2">Nenhum recibo encontrado</h4>
                        <p className="text-slate-400 text-sm max-w-[240px] mx-auto font-medium">Seus recibos aparecerão aqui automaticamente após cada pagamento bem-sucedido.</p>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-in">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all z-20"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>

                        <div className="p-10 sm:p-14">
                            {/* Receipt Header */}
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-16 h-16 bg-[#32a800] text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-[#32a800]/20 rotate-6 transform hover:rotate-0 transition-all cursor-pointer">
                                    <span className="text-3xl font-bold italic select-none">N</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Comprovante de Pagamento</h3>
                                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-2">{formatDate(selectedInvoice.created)}</p>
                            </div>

                            {/* Ticket Divider */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-[1px] flex-1 bg-slate-100" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Resumo Fiscal</span>
                                <div className="h-[1px] flex-1 bg-slate-100" />
                            </div>

                            {/* Details List */}
                            <div className="space-y-3 mb-12">
                                <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl">
                                    <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Número</span>
                                    <span className="text-slate-900 font-bold text-sm font-mono uppercase">{selectedInvoice.number || '---'}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-2xl border border-slate-50">
                                    <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Produto</span>
                                    <span className="text-slate-900 font-bold text-sm">Nodus Premium</span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-2xl border border-slate-50">
                                    <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Status</span>
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
                                        <ShieldCheck size={12} />
                                        Processado
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t-2 border-slate-50 border-dashed flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Total</p>
                                        <h4 className="text-4xl font-bold text-slate-900 tracking-tight">{formatCurrency(selectedInvoice.amount_paid, selectedInvoice.currency)}</h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-12 h-12 ml-auto mb-2 opacity-10">
                                            <Zap size={48} className="fill-slate-900" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-300 tracking-widest leading-none">STRIPE INFRASTRUCTURE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href={selectedInvoice.invoice_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                >
                                    <Download size={16} />
                                    PDF
                                </a>
                                <a
                                    href={selectedInvoice.hosted_invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 active:scale-95"
                                >
                                    <Eye size={16} />
                                    Online
                                </a>
                            </div>
                        </div>

                        {/* Bottom Decoration */}
                        <div className="p-6 bg-slate-50 flex items-center justify-center border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 select-none">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                Documento gerado pela Nodus Technologies
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBillingView;
