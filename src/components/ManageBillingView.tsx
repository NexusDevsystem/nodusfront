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
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in px-4">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-black pb-6">
                <div>
                    <h2 className="text-xl font-black text-black uppercase tracking-widest">Faturamento</h2>
                    <p className="text-[10px] text-black font-black uppercase tracking-widest mt-1 opacity-60">Gerencie sua assinatura e histórico de pagamentos.</p>
                </div>
                {!isFree && profile.stripeCustomerId && (
                    <button
                        onClick={handleManageBilling}
                        disabled={loadingPortal}
                        className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#97cd7a] bg-black hover:bg-zinc-900 py-3 px-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50"
                    >
                        {loadingPortal ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} strokeWidth={3} />}
                        Portal Stripe
                    </button>
                )}
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[9px] font-black text-black/50 uppercase tracking-widest mb-2">Assinatura Atual</p>
                            <h3 className="text-lg font-black text-black uppercase tracking-widest leading-none">
                                {isFree ? 'Nodus Free' : `Nodus Premium ${profile.planType === 'monthly' ? 'Mensal' : 'Anual'}`}
                            </h3>
                        </div>
                        <div className={`p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isFree ? 'bg-slate-50 text-black/20' : 'bg-[#97cd7a] text-black'}`}>
                            <Zap size={20} strokeWidth={3} className={!isFree ? 'fill-black/10' : ''} />
                        </div>
                    </div>
                    {!isFree && (
                        <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-black uppercase tracking-widest bg-[#97cd7a] w-fit px-3 py-1.5 border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                            <CheckCircle2 size={12} strokeWidth={3} />
                            Ativo até {profile.subscriptionExpiryDate ? new Date(profile.subscriptionExpiryDate).toLocaleDateString('pt-BR') : '--/--/----'}
                        </div>
                    )}
                </div>

                <div className="bg-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[9px] font-black text-black/50 uppercase tracking-widest mb-2">Método de Cobrança</p>
                            <h3 className="text-lg font-black text-black uppercase tracking-widest leading-none">
                                {isFree ? 'Faturas Manuais' : (profile.stripeCustomerId ? 'Cartão de Crédito' : 'Interno')}
                            </h3>
                        </div>
                        <div className="p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black">
                            <CreditCard size={20} strokeWidth={3} />
                        </div>
                    </div>
                    <p className="text-[9px] text-black font-bold uppercase tracking-widest leading-tight opacity-40">
                        {profile.stripeCustomerId
                            ? 'Segurança garantida pela infraestrutura Stripe.'
                            : 'Assinatura gerenciada manualmente.'}
                    </p>
                </div>
            </div>

            {/* Invoices Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-black pb-2">
                    <Receipt size={16} strokeWidth={3} className="text-black" />
                    <h3 className="text-xs font-black text-black uppercase tracking-widest">Histórico de Recibos</h3>
                </div>

                {loadingInvoices ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white border-2 border-black border-dashed">
                        <Loader2 size={24} className="text-black animate-spin mb-4" />
                        <p className="text-[10px] text-black font-black uppercase tracking-widest">Sincronizando faturas...</p>
                    </div>
                ) : invoices.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2.5">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="bg-white p-4 border border-black hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 border border-black bg-white flex items-center justify-center text-black group-hover:bg-black group-hover:text-[#97cd7a] transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none">
                                        <Receipt size={16} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-black uppercase tracking-widest">{invoice.number || 'RECIBO NODUS'}</h4>
                                        <p className="text-[8px] text-black/50 font-black uppercase tracking-widest mt-0.5">{formatDate(invoice.created)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-t-0 border-t border-black/5 pt-4 sm:pt-0">
                                    <div className="text-left sm:text-right">
                                        <p className="text-md font-black text-black tracking-widest">{formatCurrency(invoice.amount_paid, invoice.currency)}</p>
                                        <div className="flex items-center gap-1 sm:justify-end text-[8px] font-black uppercase tracking-widest text-[#32a800]">
                                            <CheckCircle2 size={10} strokeWidth={4} />
                                            PAGO
                                        </div>
                                    </div>
                                    <div className="p-1.5 border border-black bg-white group-hover:bg-black group-hover:text-[#97cd7a] transition-all">
                                        <ChevronRight size={14} strokeWidth={4} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-10 border-2 border-black border-dashed text-center">
                        <div className="w-12 h-12 bg-slate-50 border border-black flex items-center justify-center mx-auto mb-4 text-black/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Receipt size={24} strokeWidth={3} />
                        </div>
                        <h4 className="text-black font-black uppercase tracking-widest text-xs mb-1">Sem recibos</h4>
                        <p className="text-black font-bold uppercase tracking-widest text-[8px] opacity-40 max-w-[200px] mx-auto">Seus recibos aparecerão aqui automaticamente.</p>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 md:bg-black/80 md:backdrop-blur-[2px] animate-fade-in">
                    <div className="bg-white w-full max-w-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative animate-scale-in">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            className="absolute top-6 right-6 p-2 bg-black text-[#97cd7a] hover:bg-zinc-800 transition-all z-20"
                        >
                            <X size={18} strokeWidth={3} />
                        </button>

                        <div className="p-8 sm:p-10">
                            {/* Receipt Header */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-12 h-12 bg-black text-[#97cd7a] border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                                    <span className="text-2xl font-black italic">N</span>
                                </div>
                                <h3 className="text-xl font-black text-black uppercase tracking-widest">Comprovante</h3>
                                <p className="text-black/50 font-black text-[9px] uppercase tracking-widest mt-2">EMITIDO EM {formatDate(selectedInvoice.created)}</p>
                            </div>

                            {/* Divider with labels */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-0.5 flex-1 bg-black" />
                                <span className="text-[8px] font-black text-black uppercase tracking-[0.3em] whitespace-nowrap">DETALHES DO PAGAMENTO</span>
                                <div className="h-0.5 flex-1 bg-black" />
                            </div>

                            {/* Details List */}
                            <div className="space-y-2.5 mb-10">
                                <div className="flex justify-between items-center bg-slate-50 border border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <span className="text-black font-black text-[8px] uppercase tracking-widest">Número</span>
                                    <span className="text-black font-black text-[10px] font-mono uppercase">{selectedInvoice.number || '---'}</span>
                                </div>
                                <div className="flex justify-between items-center border border-black p-3">
                                    <span className="text-black font-black text-[8px] uppercase tracking-widest">Produto</span>
                                    <span className="text-black font-black text-[10px] uppercase tracking-widest">Nodus Premium</span>
                                </div>
                                <div className="flex justify-between items-center border border-black p-3">
                                    <span className="text-black font-black text-[8px] uppercase tracking-widest">Status</span>
                                    <div className="flex items-center gap-1 text-[#32a800] font-black text-[8px] uppercase">
                                        <ShieldCheck size={10} strokeWidth={4} />
                                        Processado
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t-2 border-black border-dashed flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-1">Valor Total</p>
                                        <h4 className="text-3xl font-black text-black tracking-widest">{formatCurrency(selectedInvoice.amount_paid, selectedInvoice.currency)}</h4>
                                    </div>
                                    <div className="text-right">
                                        <Zap size={32} strokeWidth={3} className="text-black mb-1 opacity-20" />
                                        <p className="text-[7px] font-black text-black/30 tracking-widest uppercase">STRIPE SERVICE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={selectedInvoice.invoice_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-[#97cd7a] font-black text-[9px] uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                                >
                                    <Download size={14} strokeWidth={3} />
                                    PDF
                                </a>
                                <a
                                    href={selectedInvoice.hosted_invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-black text-[9px] uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                                >
                                    <Eye size={14} strokeWidth={3} />
                                    Online
                                </a>
                            </div>
                        </div>

                        {/* Bottom Decoration */}
                        <div className="p-4 bg-black flex items-center justify-center">
                            <p className="text-[7px] text-[#97cd7a] font-black uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 size={10} strokeWidth={4} />
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
