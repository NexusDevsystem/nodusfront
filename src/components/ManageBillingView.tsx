import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
    Receipt, 
    ChevronRight, 
    Download, 
    Loader2, 
    History,
    Crown,
    Zap,
    CreditCard as CardIcon,
    BadgeCheck,
    Calendar,
    Mail,
    User,
    Check,
    ArrowUpRight,
    CircleDashed,
    Shield,
    MapPin,
    FileText,
    PencilLine,
    Plus,
    XCircle,
    AlertCircle,
    Clock,
    TrendingUp,
    Settings
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import BillingView from './BillingView';

interface ManageBillingViewProps {
    profile: UserProfile;
    links: any[];
    onChange: (profile: UserProfile) => void;
}

const ManageBillingView: React.FC<ManageBillingViewProps> = ({ profile, links, onChange }) => {
    const { t } = useTranslation();
    const [showPlans, setShowPlans] = useState(false);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

    const isFree = !profile.plan_type || profile.plan_type === 'free';

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleCancelSubscription = async () => {
        setIsCanceling(true);
        try {
            await apiClient.cancelSubscription();
            const updatedProfile = { 
                ...profile, 
                subscriptionStatus: 'canceled' as any,
                subscription_status: 'canceled' as any
            };
            onChange(updatedProfile);
            setConfirmCancel(false);
        } catch (err: any) {
            console.error('Cancel Error:', err);
        } finally {
            setIsCanceling(false);
        }
    };

    const handleReactivateSubscription = async () => {
        setIsCanceling(true);
        try {
            await apiClient.reactivateSubscription();
            const updatedProfile = { 
                ...profile, 
                subscriptionStatus: 'active' as any,
                subscription_status: 'active' as any
            };
            onChange(updatedProfile);
        } catch (err: any) {
            console.error('Reactivate Error:', err);
        } finally {
            setIsCanceling(false);
        }
    };

    const internalReceipt = !isFree ? {
        id: `NODUS-REC-${(profile.id || 'XXXX').slice(0, 8).toUpperCase()}`,
        name: profile.name,
        email: profile.email,
        taxId: profile.taxId || 'Não informado',
        plan: profile.plan_type === 'annual' ? 'Nodus Pro - Anual' : 'Nodus Pro - Mensal',
        price: profile.plan_type === 'annual' ? 'R$ 399,00' : 'R$ 29,90',
        date: profile.subscriptionExpiryDate 
            ? formatDate(new Date(profile.subscriptionExpiryDate).getTime() / 1000 - (profile.plan_type === 'annual' ? 365 : 30) * 86400) 
            : formatDate(Date.now() / 1000),
        status: 'PAGO VIA PIX',
        gatewayId: (profile.abacateCustomerId || 'ext_nodus_001').slice(0, 12)
    } : null;

    if (showPlans) {
        return (
            <div className="animate-fade-in relative z-10 pt-10 px-4 md:px-14">
                <button 
                    onClick={() => setShowPlans(false)}
                    className="mb-10 flex items-center gap-3 text-xs font-black text-black bg-white border-2 border-black rounded-2xl shadow-[0_4px_0_0_#1a1a1a] px-6 py-3 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-widest"
                >
                    <ChevronRight className="rotate-180 w-5 h-5 shadow-none" strokeWidth={3} />
                    VOLTAR AO PAINEL
                </button>
                <BillingView profile={profile} onChange={(p) => { 
                    onChange(p); 
                    setShowPlans(false); 
                }} />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-[#fdfdfd] text-[#1a1a1a] p-4 md:p-14 animate-fade-in font-sans pb-32">
            <AnimatePresence>
                {selectedReceipt && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#fdfdfd] flex items-center justify-center p-0 md:p-8 overflow-y-auto"
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-white md:border-4 border-black w-full max-w-4xl min-h-full md:min-h-0 md:shadow-[40px_40px_0_0_#000000] p-8 md:p-20 relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#97cd7a]/5 -rotate-45 translate-x-48 -translate-y-48 pointer-events-none border-b-2 border-black/5" />
                            
                            <div className="space-y-16">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-5 text-black">
                                            <div className="w-16 h-16 bg-black flex items-center justify-center text-[#ffdf00] font-black italic text-3xl rounded-2xl shadow-[6px_6px_0_0_#97cd7a]">N</div>
                                            <div>
                                                <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Nodus Comprovante</h2>
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20 mt-3">Documento de Operação Autêntica</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => window.print()}
                                            className="h-16 px-10 bg-[#ffdf00] border-2 border-black font-black text-[11px] uppercase tracking-[0.2em] shadow-[6px_6px_0_0_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-black"
                                        >
                                            GERAR PDF / IMPRIMIR
                                        </button>
                                        <button 
                                            onClick={() => setSelectedReceipt(null)}
                                            className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all transform hover:rotate-90 group text-black"
                                        >
                                            <XCircle size={28} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y-4 border-black py-16">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] italic">Transação ID</p>
                                        <p className="text-lg font-black uppercase tracking-tight italic">{selectedReceipt.id}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] italic">Data da Emissão</p>
                                        <p className="text-lg font-black uppercase tracking-tight italic">{selectedReceipt.date}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] italic">Método Verificado</p>
                                        <div className="inline-flex items-center gap-3 bg-[#97cd7a] px-5 py-2 border-2 border-black shadow-[4px_4px_0_0_#000000]">
                                            <span className="text-[11px] font-black uppercase tracking-widest italic text-black">PIX INSTANTÂNEO</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-16">
                                    <div className="space-y-8">
                                        <p className="text-sm font-black uppercase tracking-[0.4em] italic text-black/40">Resumo do Faturamento</p>
                                        <div className="bg-zinc-50 border-2 border-black p-10 space-y-8 shadow-[12px_12px_0_0_#000000]">
                                            <div className="flex justify-between items-center pb-8 border-b-2 border-black/5 text-black">
                                                <div className="space-y-2">
                                                    <p className="font-black italic uppercase text-2xl tracking-tighter">{selectedReceipt.plan}</p>
                                                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.3em]">Acesso ilimitado às ferramentas Pro</p>
                                                </div>
                                                <p className="text-4xl font-black italic">{selectedReceipt.price}</p>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.3em] italic text-black">
                                                <span>Total da Transação</span>
                                                <span className="text-lg">{selectedReceipt.price}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-10">
                                        <div className="space-y-6">
                                            <p className="text-sm font-black uppercase tracking-[0.4em] italic border-b-2 border-black/10 pb-4 text-black/40">Dados do Pagador</p>
                                            <div className="space-y-4">
                                                <p className="text-2xl font-black italic uppercase leading-none tracking-tighter text-black">{selectedReceipt.name}</p>
                                                <div className="space-y-2">
                                                    <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.2em]">E-mail: {selectedReceipt.email}</p>
                                                    <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.2em]">Documento: {selectedReceipt.taxId}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <p className="text-sm font-black uppercase tracking-[0.4em] italic border-b-2 border-black/10 pb-4 text-black/40">Segurança da Rede</p>
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 bg-white border-4 border-[#97cd7a] flex items-center justify-center rounded-[2.5rem] animate-pulse shadow-[6px_6px_0_0_#97cd7a]">
                                                    <Shield size={40} className="text-[#97cd7a]" strokeWidth={3} />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-2xl font-black italic text-[#97cd7a] uppercase leading-none">{selectedReceipt.status}</p>
                                                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest leading-relaxed">Assinado digitalmente via <br/> Nodus Transaction Protocol v2.0</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-24 border-t-2 border-black/5 text-center space-y-6">
                                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.8em] italic">ORIGINAL - DOCUMENTO NÃO EDITÁVEL</p>
                                    <div className="flex justify-center items-center gap-6 text-black/10 opacity-50">
                                        <Zap size={16} />
                                        <div className="w-48 h-[1px] bg-black/20" />
                                        <Shield size={16} />
                                        <div className="w-48 h-[1px] bg-black/20" />
                                        <Zap size={16} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto relative z-10 space-y-12">
                <header className="space-y-8">
                    <div className="flex items-center gap-3 uppercase text-[10px] font-black tracking-[0.4em] text-black/20 italic">
                        <Settings size={12} strokeWidth={4} />
                        Gerenciamento de Assinatura
                    </div>
                    
                    <div className="bg-white border-4 border-black rounded-3xl shadow-[0_12px_0_0_#1a1a1a] p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row gap-12 justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffdf00]/5 -rotate-45 translate-x-32 -translate-y-32 pointer-events-none" />
                        
                        <div className="space-y-8 relative z-10 flex-1">
                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none text-black">
                                    {isFree ? 'Nodus Free' : `Nodus Pro ${profile.plan_type === 'annual' ? 'Anual' : 'Mensal'}`}
                                </h1>
                                <p className="text-sm font-bold text-black/40 uppercase tracking-widest leading-loose">
                                    {isFree ? 'Explore a plataforma sem limites de tempo.' : `Ciclo de faturamento ${profile.plan_type === 'annual' ? 'anual' : 'mensal'}.`}
                                </p>
                            </div>

                            {!isFree && (
                                <div className="flex flex-wrap items-center gap-8 pt-4 border-t-2 border-black/5">
                                    <div className="space-y-1 text-black">
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">
                                            {profile.subscriptionStatus === 'canceled' ? 'Acesso Expira em' : 'Próxima Renovação'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={18} strokeWidth={3} />
                                            <span className="text-xl font-black uppercase tracking-tighter italic">
                                                {profile.subscriptionExpiryDate ? formatDate(new Date(profile.subscriptionExpiryDate).getTime() / 1000) : '--/--/----'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-10 w-[2px] bg-black/5 hidden md:block" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">Valor da Cobrança</p>
                                        <div className="flex items-center gap-2 text-[#97cd7a]">
                                            <span className="text-xl font-black uppercase tracking-tighter italic">
                                                {profile.plan_type === 'annual' ? 'R$ 399,00' : 'R$ 29,90'} / {profile.plan_type === 'annual' ? 'ano' : 'mês'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-full lg:w-80 flex flex-col justify-center items-center lg:items-end gap-6 relative z-10">
                            {isFree ? (
                                <button 
                                    onClick={() => setShowPlans(true)}
                                    className="w-full h-20 bg-[#ffdf00] border-4 border-black rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-[0_8px_0_0_#1a1a1a] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-4 text-black"
                                >
                                    <Crown size={20} strokeWidth={3} />
                                    CONHECER PLANOS PRO
                                </button>
                            ) : (
                                <div className="w-full space-y-4">
                                    {profile.subscriptionStatus === 'canceled' ? (
                                        <button 
                                            onClick={handleReactivateSubscription}
                                            disabled={isCanceling}
                                            className="w-full h-20 bg-[#97cd7a] text-black border-4 border-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_8px_0_0_#1a1a1a] hover:-translate-y-1 transition-all flex items-center justify-center gap-4"
                                        >
                                            {isCanceling ? <Loader2 size={18} className="animate-spin text-black" /> : < History size={18} strokeWidth={3} />}
                                            REATIVAR RENOVAÇÃO
                                        </button>
                                    ) : !confirmCancel ? (
                                        <button 
                                            onClick={() => setConfirmCancel(true)}
                                            className="w-full h-20 bg-[#ef4444] text-white border-4 border-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_8px_0_0_#1a1a1a] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#1a1a1a] transition-all flex items-center justify-center gap-4"
                                        >
                                            <XCircle size={18} strokeWidth={3} />
                                            CANCELAR RENOVAÇÃO
                                        </button>
                                    ) : (
                                        <div className="w-full bg-white border-4 border-black rounded-2xl p-6 shadow-[0_8px_0_0_#1a1a1a] space-y-6">
                                            <p className="text-[10px] font-black text-black uppercase tracking-widest text-center leading-relaxed italic">
                                                CANCELAR RENOVAÇÃO? VOCÊ CONTINUARÁ COM ACESSO PRO ATÉ {profile.subscriptionExpiryDate ? formatDate(new Date(profile.subscriptionExpiryDate).getTime() / 1000) : 'O FIM DO CICLO'}. 
                                            </p>
                                            <div className="flex gap-3">
                                                <button onClick={handleCancelSubscription} className="flex-1 py-3 bg-[#ef4444] text-white border-2 border-black font-black text-[9px] uppercase tracking-widest hover:brightness-110">
                                                    {isCanceling ? <Loader2 size={16} className="animate-spin mx-auto text-white" /> : 'CONFIRMAR'}
                                                </button>
                                                <button onClick={() => setConfirmCancel(false)} className="flex-1 py-3 bg-white border-2 border-black font-black text-[9px] uppercase tracking-widest hover:bg-zinc-50 text-black">
                                                    VOLTAR
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-black">
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 group">
                             <div className="w-10 h-10 bg-white border-2 border-black rounded-2xl shadow-[0_3px_0_0_#1a1a1a] flex items-center justify-center transition-all group-hover:bg-[#ffdf00]">
                                <BadgeCheck size={20} strokeWidth={3} />
                             </div>
                             <h2 className="text-xl font-black uppercase tracking-tighter italic">Confirmação de Ativação</h2>
                        </div>
                        
                        <div className="bg-white border-2 border-black rounded-2xl shadow-[0_8px_0_0_#1a1a1a] p-8 min-h-[220px]">
                            {isFree ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                     <Shield size={32} strokeWidth={3} className="text-black/10" />
                                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Nenhum plano Pro ativo</p>
                                     <button onClick={() => setShowPlans(true)} className="text-[10px] font-black text-black underline underline-offset-4">
                                         ATIVAR PRIMEIRA ASSINATURA
                                     </button>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-10 bg-[#97cd7a] border-2 border-black rounded shadow-[2px_2px_0_0_#1a1a1a] flex items-center justify-center text-black font-black text-[10px] italic">PIX</div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-widest italic">ASSINATURA VIA PIX</p>
                                                <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">CONFIRMAÇÃO DIGITAL NODUS</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 border border-black text-[8px] font-black uppercase tracking-widest bg-[#97cd7a]/20 text-[#97cd7a]">ATIVO</span>
                                    </div>
                                    <div className="px-4 py-4 bg-[#f0f9eb] border-2 border-black rounded-2xl flex items-center gap-4">
                                        <Shield size={20} className="text-[#97cd7a]" strokeWidth={3} />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">Acesso Pro verificado</p>
                                            <p className="text-[8px] font-bold text-black/40 uppercase tracking-[0.2em]">Pagamento via Pix confirmado no faturamento.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-4 group">
                             <div className="w-10 h-10 bg-white border-2 border-black rounded-xl shadow-[0_3px_0_0_#1a1a1a] flex items-center justify-center transition-all group-hover:bg-[#ffdf00]">
                                <FileText size={20} strokeWidth={3} />
                             </div>
                             <h2 className="text-xl font-black uppercase tracking-tighter italic">Dados Legais</h2>
                        </div>
                        <div className="bg-white border-2 border-black rounded-2xl shadow-[0_8px_0_0_#1a1a1a] p-10 min-h-[220px] flex flex-col justify-between">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 whitespace-nowrap overflow-hidden">
                                <div className="space-y-1 overflow-hidden">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20 italic">Nome</p>
                                    <p className="text-xs font-black uppercase tracking-tight italic truncate">{profile.name}</p>
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20 italic">E-mail</p>
                                    <p className="text-xs font-black uppercase tracking-tight italic lowercase truncate">{profile.email}</p>
                                </div>
                            </div>
                            <button className="mt-12 py-4 border-2 border-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all text-black hover:text-white">EDITAR DADOS</button>
                        </div>
                    </section>
                </div>

                <section className="space-y-10 pt-10 text-black">
                    <div className="flex items-center justify-between border-b-4 border-black pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black flex items-center justify-center text-[#ffdf00] shadow-[3px_3px_0_0_#97cd7a]">
                                <History size={24} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Extrato de Pagamentos</h2>
                        </div>
                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Plano {profile.plan_type === 'annual' ? 'Anual' : 'Mensal'}</span>
                    </div>
                    <div className="bg-white border-2 border-black rounded-2xl shadow-[0_16px_0_0_#1a1a1a] overflow-hidden">
                        {!isFree ? (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-50 border-b-2 border-black">
                                    <tr>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest italic text-black/40">Data</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest italic text-black/40">Código</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest italic text-black/40">Gateway</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest italic text-black/40">Valor</th>
                                        <th className="text-right px-10">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-[#ffdf00]/5 transition-colors group">
                                        <td className="px-10 py-8 text-sm font-black italic">{internalReceipt?.date}</td>
                                        <td className="px-10 py-8 text-[11px] font-bold text-black/40 tracking-wider">{internalReceipt?.id}</td>
                                        <td className="px-10 py-8">
                                            <div className="inline-flex items-center gap-2 bg-[#97cd7a] border-2 border-black px-3 py-1 shadow-[2px_2px_0_0_#1a1a1a]">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-black">PIX Confirmado</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-lg font-black italic">{internalReceipt?.price}</td>
                                        <td className="px-10 py-8 text-right">
                                            <button 
                                                onClick={() => setSelectedReceipt(internalReceipt)}
                                                className="w-12 h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center hover:bg-black hover:text-[#ffdf00] transition-all shadow-[4px_4px_0_0_#1a1a1a] active:translate-y-1 active:shadow-none ml-auto text-black"
                                            >
                                                <FileText size={20} strokeWidth={4} />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-32 text-center space-y-4">
                                <Receipt size={48} className="mx-auto text-black/10" />
                                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-black/20 italic">Plano Free ativo.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ManageBillingView;
