import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { CreditCard, Calendar, Receipt, ShieldCheck, ExternalLink, Zap, Loader2, AlertCircle, ChevronRight, Download, Eye, X, CheckCircle2 } from 'lucide-react';
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
    const [error, setError] = useState<string | null>(null);
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
        setError(null);
        try {
            const { url } = await apiClient.createPortalSession();
            window.location.href = url;
        } catch (err: any) {
            console.error('Portal Error:', err);
            setError(err.message || 'Falha ao abrir portal de pagamentos');
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
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Faturamento</h2>
                    <p className="text-slate-500 mt-2 font-medium">Gerencie sua assinatura e visualize seu histórico de pagamentos.</p>
                </div>
                {!isFree && (
                    <button
                        onClick={handleManageBilling}
                        disabled={loadingPortal}
                        className="flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors py-2 px-4 bg-brand-50 rounded-full border border-brand-100 disabled:opacity-50"
                    >
                        {loadingPortal ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                        Configurações na Stripe
                    </button>
                )}
            </div>

            {/* Current Plan - Minimal Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-all">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assinatura Atual</p>
                            <h3 className="text-xl font-black text-slate-800">
                                {isFree ? 'Nodus Free' : `Nodus Premium ${profile.planType === 'monthly' ? 'Mensal' : 'Anual'}`}
                            </h3>
                            {!isFree && (
                                <p className="text-sm text-brand-600 font-bold mt-2 flex items-center gap-1.5">
                                    <CheckCircle2 size={14} />
                                    Ativo até {profile.subscriptionExpiryDate ? new Date(profile.subscriptionExpiryDate).toLocaleDateString('pt-BR') : '--/--/----'}
                                </p>
                            )}
                        </div>
                        <div className={`p-3 rounded-2xl ${isFree ? 'bg-slate-50 text-slate-300' : 'bg-brand-50 text-brand-600'}`}>
                            <Zap size={24} className={!isFree ? 'fill-brand-600/20' : ''} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-all">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Método de Cobrança</p>
                            <h3 className="text-xl font-black text-slate-800">
                                {isFree ? '---' : 'Cartão de Crédito'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-2">Processado via infraestrutura segura Stripe.</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 text-slate-300">
                            <CreditCard size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Receipt size={24} className="text-brand-500" />
                        Histórico de Recibos
                    </h3>
                </div>

                {loadingInvoices ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-[32px] border border-slate-100 border-dashed">
                        <Loader2 size={32} className="text-brand-300 animate-spin mb-4" />
                        <p className="text-slate-400 text-sm font-medium">Buscando faturas...</p>
                    </div>
                ) : invoices.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="bg-white p-5 rounded-[20px] border border-slate-100 hover:border-brand-100 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                        <Receipt size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{invoice.number || 'Recibo Nodus'}</h4>
                                        <p className="text-xs text-slate-400 font-medium">{formatDate(invoice.created)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                    <div className="text-right">
                                        <p className="text-base font-black text-slate-900">{formatCurrency(invoice.amount_paid, invoice.currency)}</p>
                                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Pago</span>
                                    </div>
                                    <button
                                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-600 hover:text-white transition-all transform hover:scale-105"
                                        title="Ver Destalhes"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-[32px] border border-dashed border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Receipt size={32} />
                        </div>
                        <h4 className="text-slate-800 font-bold mb-1">Nenhum recibo encontrado</h4>
                        <p className="text-slate-500 text-sm">Seus recibos aparecerão aqui após sua primeira assinatura.</p>
                    </div>
                )}
            </div>

            {/* Receipt Modal - Premium Design */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative animate-scale-in">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-20"
                        >
                            <X size={20} />
                        </button>

                        {/* Top Accent */}
                        <div className="h-2 bg-brand-600 w-full" />

                        <div className="p-8 sm:p-12">
                            {/* Receipt Header */}
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-brand-200 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                                    <span className="text-2xl font-black italic">N</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recibo de Pagamento</h3>
                                <p className="text-slate-500 font-medium">{formatDate(selectedInvoice.created)}</p>
                            </div>

                            {/* Ticket Style divider */}
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-[1px] flex-1 bg-slate-100" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Detalhamento</span>
                                <div className="h-[1px] flex-1 bg-slate-100" />
                            </div>

                            {/* Details List */}
                            <div className="space-y-4 mb-12">
                                <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <span className="text-slate-500 font-bold text-sm">Número do Recibo</span>
                                    <span className="text-slate-800 font-black text-sm">{selectedInvoice.number || '---'}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <span className="text-slate-500 font-bold text-sm">Plano Nodus</span>
                                    <span className="text-slate-800 font-black text-sm uppercase tracking-tighter">Premium Mensal</span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <span className="text-slate-500 font-bold text-sm">Status do Pagamento</span>
                                    <span className="text-emerald-600 font-black text-[10px] uppercase bg-emerald-50 px-3 py-1 rounded-full">Liquidado</span>
                                </div>
                                <div className="mt-8 pt-8 border-t border-slate-100 border-dashed flex justify-between items-end">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pago</p>
                                        <h4 className="text-3xl font-black text-slate-900">{formatCurrency(selectedInvoice.amount_paid, selectedInvoice.currency)}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400">VIA STRIPE PAYMENTS</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href={selectedInvoice.invoice_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 transform hover:-translate-y-1 active:scale-95"
                                >
                                    <Download size={16} />
                                    Baixar PDF
                                </a>
                                <a
                                    href={selectedInvoice.hosted_invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-600 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 transform hover:-translate-y-1 active:scale-95"
                                >
                                    <Eye size={16} />
                                    Ver Completo
                                </a>
                            </div>
                        </div>

                        {/* Bottom Decoration */}
                        <div className="p-6 bg-slate-50 flex items-center justify-center border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                Comprovante Fiscal Gerado por Nodus
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBillingView;
