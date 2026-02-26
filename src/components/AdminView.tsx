import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Users, Link as LinkIcon, ShoppingBag, Eye, MousePointerClick, RefreshCw, X, Mail, Calendar,
    ExternalLink, User, Copy, Check, Briefcase, ShieldCheck, Activity, Info, Lock, AlertCircle, TrendingUp
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import BrutalistLoader from './BrutalistLoader';
const translatePlan = (plan: string) => {
    const p = plan?.toLowerCase() || 'free';
    if (p === 'free') return 'GRATUITO';
    if (p === 'monthly') return 'MENSAL';
    if (p === 'yearly') return 'ANUAL';
    return p.toUpperCase();
};

interface AdminStats {
    summary: {
        totalUsers: number;
        proUsers: number;
        freeUsers: number;
        totalLinks: number;
        totalProducts: number;
        totalViews: number;
        totalClicks: number;
        globalCTR: string;
    };
    growth: {
        today: number;
        thisWeek: number;
    };
    latestUsers: {
        id: string;
        username: string;
        email: string;
        name: string;
        created_at: string;
        plan_type: string;
        bio?: string;
        avatar_url?: string;
        is_verified?: boolean;
        user_category?: string;
    }[];
}

export default function AdminView() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const toggleVerification = async () => {
        if (!selectedUser || isUpdating) return;
        try {
            setIsUpdating(true);
            const updated = await apiClient.updateAdminUser(selectedUser.id, {
                is_verified: !selectedUser.is_verified
            });
            setSelectedUser({ ...selectedUser, is_verified: updated.is_verified });
            loadStats(true); // Atualiza a lista por baixo
        } catch (err: any) {
            alert('Erro: ' + (err.message || 'Falha ao processar verificação.'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser || isUpdating) return;
        try {
            setIsUpdating(true);
            await apiClient.deleteAdminUser(selectedUser.id);
            setSelectedUser(null);
            setDeleteConfirm(false);
            loadStats(true);
        } catch (err: any) {
            alert('Erro: ' + (err.message || 'Falha ao deletar usuário.'));
        } finally {
            setIsUpdating(false);
        }
    };

    const openUser = (u: any) => {
        setDeleteConfirm(false);
        setDeleteInput('');
        setSelectedUser(u);
    };

    const loadStats = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            setError(null);
            let data = await apiClient.getAdminStats() as any;

            // Compatibility layer for old API format
            if (data && !data.summary && data.totalUsers !== undefined) {
                data = {
                    summary: {
                        totalUsers: data.totalUsers || 0,
                        proUsers: 0,
                        freeUsers: data.totalUsers || 0,
                        totalLinks: data.totalLinks || 0,
                        totalProducts: data.totalProducts || 0,
                        totalViews: data.totalViews || 0,
                        totalClicks: data.totalClicks || 0,
                        globalCTR: '0.0'
                    },
                    growth: { today: 0, thisWeek: 0 },
                    latestUsers: []
                };
            }

            setStats(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar os dados administrativos.');
            console.error(err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();

        const interval = setInterval(() => {
            loadStats(true);
        }, 8000); // Polling slower to save resources

        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-[70vh] flex items-center justify-center p-6">
                <BrutalistLoader
                    message="ACESSANDO CORE ENGINE..."
                    progress={50}
                    subtext="ESTATÍSTICAS DE NÍVEL DE SISTEMA"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-6 text-center">
                <div className="bg-[#ff3333] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block">
                    <ShieldAlert size={48} className="mx-auto mb-4 text-black" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-black mb-2">Erro Crítico de Acesso</h2>
                    <p className="text-sm font-bold text-black uppercase">{error}</p>
                    <button
                        onClick={() => loadStats()}
                        className="mt-6 px-6 py-3 bg-white border-2 border-black text-xs font-black uppercase tracking-widest hover:bg-[#ffdf00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Reconectar
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const conversionRate = (stats.summary?.totalUsers || 0) > 0
        ? (((stats.summary?.proUsers || 0) / (stats.summary?.totalUsers || 1)) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="w-full max-w-6xl mx-auto pb-12 px-4 md:px-0">
            {/* Header */}
            <div className="bg-[#ffdf00] border-4 border-black p-6 md:p-10 mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute -right-20 -top-20 text-black/5 pointer-events-none">
                    <ShieldAlert size={400} />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#97cd7a] text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]">
                            <span className="w-2 h-2 rounded-full bg-[#97cd7a] animate-pulse"></span>
                            Nodus Admin Console
                        </div>
                        <div className="px-3 py-1 bg-white border-2 border-black text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                            <RefreshCw size={10} className="animate-spin duration-[4000ms]" />
                            Monitoramento em Tempo Real
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter leading-[0.85] mb-4">
                        Centro de <br className="hidden md:block" /> Inteligência
                    </h1>
                    <p className="text-xs md:text-base font-bold text-black/60 uppercase tracking-widest max-w-xl">
                        Visão analítica completa sobre o ecossistema Nodus. Monitore o crescimento, conversão e saúde da plataforma em tempo real.
                    </p>
                </div>
            </div>

            {/* Main KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <KPIBox
                    label="Usuários Totais"
                    value={stats.summary?.totalUsers || 0}
                    color="#e6b3ff"
                    icon={<Users size={20} />}
                    sublabel={`+${stats.growth?.thisWeek || 0} esta semana`}
                />
                <KPIBox
                    label="Conversão Pro"
                    value={`${conversionRate}%`}
                    color="#97cd7a"
                    icon={<ShieldAlert size={20} />}
                    sublabel={`${stats.summary?.proUsers || 0} assinantes ativos`}
                />
                <KPIBox
                    label="Taxa de Clique (CTR)"
                    value={`${stats.summary?.globalCTR || '0.00'}%`}
                    color="#ff66b2"
                    icon={<MousePointerClick size={20} />}
                    sublabel="Eficiência global de links"
                />
                <KPIBox
                    label="Views Globais"
                    value={stats.summary?.totalViews || 0}
                    color="#66ccff"
                    icon={<Eye size={20} />}
                    sublabel="Alcance total da rede"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: List of Latest Users */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                        <div className="p-5 border-b-4 border-black bg-black text-white flex justify-between items-center">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Novos Exploradores</h2>
                            <div className="text-[10px] font-black bg-[#97cd7a] text-black px-2 py-0.5">Registros Destacados</div>
                        </div>
                        <div className="divide-y-2 divide-black max-h-[600px] overflow-y-auto custom-scrollbar">
                            {stats.latestUsers?.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => openUser(u)}
                                    className="p-4 flex items-center justify-between hover:bg-[#f6f6f6] cursor-pointer transition-all active:translate-x-1 active:translate-y-1 active:shadow-none group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black text-lg ${u.plan_type !== 'free' ? 'bg-[#ffdf00]' : 'bg-white'}`}>
                                            {u.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="text-xs font-black uppercase tracking-tight">{u.name || u.username}</h3>
                                                {u.is_verified && <img src="/icons/icons8-verificado-48.png" className="w-4 h-4 ml-0.5 object-contain" alt="Verified" />}
                                            </div>
                                            <p className="text-[10px] font-bold text-black/40 uppercase">@{u.username} • {u.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[8px] font-black py-0.5 px-2 mb-1 inline-block border border-black ${u.plan_type !== 'free' ? 'bg-[#97cd7a] text-black' : 'bg-slate-100 text-black/40'}`}>
                                            {translatePlan(u.plan_type)}
                                        </div>
                                        <p className="text-[9px] font-bold text-black/30 uppercase">
                                            {new Date(u.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Platform Assets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(151,205,122,1)]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Inventário de Conteúdo</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-4xl font-black">{stats.summary?.totalLinks || 0}</span>
                                    <p className="text-[10px] font-black uppercase">Links Ativos</p>
                                </div>
                                <div className="h-12 w-[2px] bg-black/10"></div>
                                <div>
                                    <span className="text-4xl font-black">{stats.summary?.totalProducts || 0}</span>
                                    <p className="text-[10px] font-black uppercase">Produtos</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(255,102,178,1)]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Interação Total</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-4xl font-black">{stats.summary?.totalClicks || 0}</span>
                                    <p className="text-[10px] font-black uppercase">Cliques</p>
                                </div>
                                <div className="h-12 w-[2px] bg-black/10"></div>
                                <div>
                                    <span className="text-4xl font-black">{stats.summary?.totalViews || 0}</span>
                                    <p className="text-[10px] font-black uppercase">Views</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Growth & Charts */}
                <div className="space-y-6">
                    <div className="bg-[#e6b3ff] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-lg font-black uppercase tracking-tighter mb-6">Crescimento</h2>

                        <div className="space-y-8">
                            <GrowthLine label="Novos Hoje" value={stats.growth?.today || 0} percentage={((stats.growth?.today || 0) / (stats.summary?.totalUsers || 1) * 100).toFixed(1)} />
                            <GrowthLine label="Últimos 7 Dias" value={stats.growth?.thisWeek || 0} percentage={((stats.growth?.thisWeek || 0) / (stats.summary?.totalUsers || 1) * 100).toFixed(1)} />
                        </div>

                        <div className="mt-10 pt-6 border-t-2 border-black/10">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-40">Média de Crescimento</p>
                                    <h4 className="text-2xl font-black">+{Math.ceil((stats.growth?.thisWeek || 0) / 7)} / dia</h4>
                                </div>
                                <div className="p-2 bg-black text-[#e6b3ff]">
                                    <RefreshCw size={24} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-xs font-black uppercase tracking-widest mb-4">Saúde do Sistema</h2>
                        <div className="space-y-3">
                            <StatusIndicator label="API Engine" status="ONLINE" />
                            <StatusIndicator label="DB Supabase" status="LATENCY OK" />
                            <StatusIndicator label="Stripe Node" status="READY" />
                        </div>
                    </div>
                </div>
            </div>

            {/* User Detail Modal - Using Portal to ensure true viewport centering */}
            {createPortal(
                <AnimatePresence>
                    {selectedUser && (
                        <div className={`fixed top-0 left-0 w-screen h-screen z-[99999] flex overflow-hidden pointer-events-none ${isMobile ? 'items-end' : 'items-center justify-center p-4'}`}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedUser(null)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer pointer-events-auto"
                            />
                            <motion.div
                                initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
                                animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                                exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                drag={isMobile ? "y" : false}
                                dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
                                dragElastic={isMobile ? 0.8 : 1}
                                onDragEnd={(_, info) => {
                                    if (isMobile && info.offset.y > 50) {
                                        setSelectedUser(null);
                                    }
                                }}
                                className={`
                                    bg-white border-4 border-black w-full relative overflow-hidden pointer-events-auto flex flex-col 
                                    ${isMobile ? 'h-[60vh] rounded-none border-b-0 border-x-0 shadow-none' : 'max-w-5xl md:flex-row min-h-[600px] rounded-none shadow-none'}
                                `}
                            >
                                {/* Drag Handle for Mobile */}
                                {isMobile && (
                                    <div className="flex justify-center p-4 pt-5 shrink-0 border-b-2 border-black/5">
                                        <div className="w-12 h-1.5 bg-black rounded-full" />
                                    </div>
                                )}
                                {/* Content Wrapper (Scrollable on Mobile) */}
                                <div
                                    className={`flex w-full flex-1 flex-col md:flex-row min-h-0 ${isMobile ? 'overflow-y-auto scrollbar-hide' : ''}`}
                                    onPointerDownCapture={isMobile ? (e) => e.stopPropagation() : undefined}
                                    style={isMobile ? {
                                        touchAction: 'pan-y',
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none'
                                    } : {}}
                                >
                                    {/* Column 1: Identity & ID */}
                                    <div className="w-full md:w-56 bg-slate-50 border-b-4 md:border-b-0 md:border-r-4 border-black p-6 flex flex-col items-center text-center shrink-0">
                                        <div className={`w-28 h-28 border-4 border-black flex items-center justify-center text-5xl font-black mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${selectedUser.plan_type !== 'free' ? 'bg-[#97cd7a]' : 'bg-white'}`}>
                                            {selectedUser.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="space-y-1 mb-8">
                                            <h2 className="text-lg font-black uppercase tracking-tighter leading-tight flex items-center justify-center gap-1">
                                                {selectedUser.name || selectedUser.username}
                                                {selectedUser.is_verified && <img src="/icons/icons8-verificado-48.png" className="w-5 h-5 ml-1 object-contain" alt="Verified" />}
                                            </h2>
                                            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">@{selectedUser.username}</p>
                                        </div>

                                        <div className="w-full space-y-3 mb-auto">
                                            <div className={`w-full py-2.5 border-2 border-black text-[10px] font-black uppercase tracking-widest ${selectedUser.plan_type !== 'free' ? 'bg-[#ffdf00]' : 'bg-white'}`}>
                                                PLANO: {translatePlan(selectedUser.plan_type)}
                                            </div>
                                            <div className="w-full py-2.5 border-2 border-black bg-black text-white text-[10px] font-black uppercase tracking-widest">
                                                CAT: {selectedUser.user_category?.toUpperCase() || 'PADRÃO'}
                                            </div>
                                        </div>

                                        <div className="pt-6 w-full opacity-30 mt-6 border-t-2 border-black/10">
                                            <p className="text-[7px] font-black uppercase">REF_ID_{selectedUser.id.substring(0, 12)}</p>
                                        </div>
                                    </div>

                                    {/* Column 2: Data & Records (Flexible/Scrollable) */}
                                    <div className="flex-1 flex flex-col bg-white border-b-4 md:border-b-0 md:border-r-4 border-black min-w-0">
                                        {/* Modal Header Tab */}
                                        <div className="bg-black text-white p-4 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#97cd7a] animate-pulse"></div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Registro Central de Exploradores</h3>
                                        </div>

                                        <div className={`p-6 flex-1 ${!isMobile ? 'overflow-y-auto max-h-[75vh]' : ''}`}>
                                            <div className="grid grid-cols-1 gap-4 mb-8">
                                                <InfoCard
                                                    label="Email de Comunicação"
                                                    value={selectedUser.email}
                                                    icon={<Mail size={14} />}
                                                    onCopy={() => handleCopy(selectedUser.email, 'email')}
                                                    isCopied={copiedField === 'email'}
                                                />
                                                <InfoCard
                                                    label="Chave Interna (UUID)"
                                                    value={selectedUser.id}
                                                    icon={<Lock size={14} />}
                                                    onCopy={() => handleCopy(selectedUser.id, 'id')}
                                                    isCopied={copiedField === 'id'}
                                                />
                                            </div>

                                            <div className="space-y-8">
                                                <div className="relative border-2 border-black p-4 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                    <div className="absolute -top-3 left-4 px-2 bg-black text-white text-[8px] font-black uppercase tracking-widest">
                                                        Cronologia
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Calendar size={16} className="text-black/30" />
                                                        <p className="text-[11px] font-bold text-black/60 capitalize">
                                                            Membro ativo desde <span className="text-black">{new Date(selectedUser.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>.
                                                        </p>
                                                    </div>
                                                </div>

                                                {selectedUser.bio && (
                                                    <div className="relative border-2 border-black p-4 bg-[#f9f0ff] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                        <div className="absolute -top-3 left-4 px-2 bg-black text-white text-[8px] font-black uppercase tracking-widest">
                                                            Biodata
                                                        </div>
                                                        <p className="italic text-[11px] font-bold text-black/70 leading-relaxed">
                                                            "{selectedUser.bio}"
                                                        </p>
                                                    </div>
                                                )}

                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase border-b-2 border-black mb-4 pb-1 flex items-center gap-2">
                                                        <Activity size={12} strokeWidth={3} />
                                                        Performance do Perfil
                                                    </h4>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                                            <p className="text-[7px] font-black uppercase opacity-40 mb-1">Links</p>
                                                            <p className="text-xs font-black text-black">--</p>
                                                        </div>
                                                        <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                                            <p className="text-[7px] font-black uppercase opacity-40 mb-1">Cliques</p>
                                                            <p className="text-xs font-black text-black">--</p>
                                                        </div>
                                                        <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                                            <p className="text-[7px] font-black uppercase opacity-40 mb-1">Taxas</p>
                                                            <p className="text-xs font-black text-black">--%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Administrative Sidebar (Right) */}
                                    <div className="w-full md:w-72 bg-slate-50 p-6 flex flex-col shrink-0">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Briefcase size={14} />
                                                Operações
                                            </h4>
                                            <button
                                                onClick={() => setSelectedUser(null)}
                                                className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-black"
                                            >
                                                <X size={16} strokeWidth={3} />
                                            </button>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            {/* Verification Toggle */}
                                            <div className="space-y-3">
                                                <p className="text-[9px] font-black uppercase text-black/40">Status de Credibilidade</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleVerification(); }}
                                                    disabled={isUpdating}
                                                    className={`w-full py-4 border-2 border-black font-black uppercase text-[10px] tracking-widest transition-all flex flex-col items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none ${selectedUser.is_verified
                                                        ? 'bg-white text-black hover:bg-slate-50'
                                                        : 'bg-[#97cd7a] text-black hover:bg-[#86b56c]'
                                                        }`}
                                                >
                                                    {isUpdating ? (
                                                        <RefreshCw className="animate-spin" size={16} />
                                                    ) : (
                                                        <img src="/icons/icons8-verificado-48.png" className="w-8 h-8 object-contain" alt="Verified Icon" />
                                                    )}
                                                    <span>{selectedUser.is_verified ? 'REVOGAR SELO' : 'CONCEDER SELO'}</span>
                                                </button>
                                            </div>

                                            {/* Public Link */}
                                            <div className="space-y-3">
                                                <p className="text-[9px] font-black uppercase text-black/40">Navegação Externa</p>
                                                <a
                                                    href={`/${selectedUser.username}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center gap-2 w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#97cd7a] hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(151,205,122,0.3)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                                >
                                                    <ExternalLink size={20} strokeWidth={3} />
                                                    <span>VISUALIZAR PÁGINA</span>
                                                </a>
                                            </div>

                                            <div className="flex-1"></div>

                                            {/* Critical Section */}
                                            <div className={`mt-auto border-2 border-black p-4 transition-colors ${deleteConfirm ? 'bg-[#ff0000] text-white' : 'bg-[#fff0f0]'}`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <AlertCircle size={14} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Protocolo de Exclusão</span>
                                                </div>

                                                {!deleteConfirm ? (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(true); }}
                                                        className="w-full py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                                                    >
                                                        APAGAR REGISTRO
                                                    </button>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black uppercase text-white/70">Digite 'deletar' para confirmar:</p>
                                                            <input
                                                                type="text"
                                                                value={deleteInput}
                                                                onChange={(e) => setDeleteInput(e.target.value)}
                                                                placeholder="deletar"
                                                                className="w-full bg-white/10 border border-white/30 p-2 text-[10px] font-black text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(); }}
                                                            disabled={isUpdating || deleteInput !== 'deletar'}
                                                            className={`w-full py-2 text-[9px] font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none ${deleteInput === 'deletar'
                                                                ? 'bg-white text-red-600 opacity-100'
                                                                : 'bg-white/20 text-white/40 cursor-not-allowed border-white/20 shadow-none'
                                                                }`}
                                                        >
                                                            CONFIRMAR EXCLUSÃO
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteConfirm(false);
                                                                setDeleteInput('');
                                                            }}
                                                            className="w-full py-2 bg-transparent text-white border border-white text-[8px] font-black uppercase tracking-widest"
                                                        >
                                                            CANCELAR
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

function KPIBox({ label, value, color, icon, sublabel }: any) {
    return (
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-black/60">{label}</h3>
                <div className="p-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black" style={{ backgroundColor: color }}>
                    {icon}
                </div>
            </div>
            <div className="mt-auto">
                <span className="text-4xl font-black tracking-tighter">{value.toLocaleString ? value.toLocaleString('pt-BR') : value}</span>
                <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest mt-1">{sublabel}</p>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500" style={{ backgroundColor: color }}></div>
        </div>
    );
}

function GrowthLine({ label, value, percentage }: any) {
    const numericPercentage = Number(percentage) || 0;
    // Cap at 100% and ensure a minimum visibility of 2% if there is any value
    const barWidth = Math.min(Math.max(numericPercentage, value > 0 ? 2 : 0), 100);

    return (
        <div className="group">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/70">{label}</span>
                <span className="text-xl font-black">+{value}</span>
            </div>
            <div className="h-4 w-full bg-white border-2 border-black relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div
                    className="h-full bg-black transition-all duration-1000 ease-out"
                    style={{ width: `${barWidth}%` }}
                ></div>
            </div>
            <div className="flex justify-end mt-1">
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                    {percentage}% da base total
                </span>
            </div>
        </div>
    );
}
function StatusIndicator({ label, status }: any) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
            <span className="text-[10px] font-bold uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#97cd7a] animate-pulse"></span>
                <span className="text-[9px] font-black uppercase">{status}</span>
            </div>
        </div>
    );
}

function InfoCard({ label, value, icon, onCopy, isCopied }: any) {
    return (
        <div className="bg-white border-2 border-black p-3 relative group shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-black uppercase opacity-40 flex items-center gap-1">
                    {icon}
                    {label}
                </span>
                <button
                    onClick={onCopy}
                    className="p-1 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black rounded-sm"
                    title="Copiar para área de transferência"
                >
                    {isCopied ? <Check size={10} className="text-[#97cd7a]" /> : <Copy size={10} />}
                </button>
            </div>
            <p className="text-[11px] font-bold text-black truncate pr-4">{value}</p>
            {isCopied && (
                <div className="absolute -top-6 right-0 bg-[#97cd7a] text-black text-[8px] font-black px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                    COPIADO!
                </div>
            )}
        </div>
    );
}
