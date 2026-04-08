import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Users, Link as LinkIcon, ShoppingBag, Eye, MousePointerClick, RefreshCw, X, Mail, Calendar,
    ExternalLink, User, Copy, Check, Briefcase, ShieldCheck, Activity, Info, Lock, AlertCircle, TrendingUp,
    Crown, Clock, Layout, PieChart, BarChart, Settings, Shield, Trash2, Key, ChevronRight, Hash,
    FileText,
    Rss,
    PlusCircle,
    BadgeCheck,
    XCircle
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import BrutalistLoader from './BrutalistLoader';
import BlogAdminView from './BlogAdminView';

const translatePlan = (plan: string, t: any) => {
    const p = plan?.toLowerCase() || 'free';
    if (p === 'free') return t('admin.free');
    if (p === 'monthly') return t('admin.monthly');
    if (p === 'yearly') return t('admin.yearly');
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
        subscription_expiry_date?: string | null;
        theme_id?: string;
        links?: { count: number, type?: string }[];
        clicks?: { count: number }[];
        products?: { count: number }[];
        views?: number;
    }[];
}

export default function AdminView() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [editPlan, setEditPlan] = useState<{ type: string, expiry: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'blog' | 'settings' | 'verifications'>('overview');
    const [verifications, setVerifications] = useState<any[]>([]);
    const [verifLoading, setVerifLoading] = useState(false);
    const [verifFilter, setVerifFilter] = useState<string>('');
    const [expandedVerif, setExpandedVerif] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [verifAction, setVerifAction] = useState<{id:string,action:'approve'|'reject'}|null>(null);
    const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [newUserForm, setNewUserForm] = useState({
        email: '',
        password: '',
        username: '',
        plan_type: 'free',
        subscription_expiry_date: ''
    });

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    useEffect(() => {
        if (selectedUser) {
            setEditPlan({
                type: selectedUser.plan_type || 'free',
                expiry: selectedUser.subscription_expiry_date ? selectedUser.subscription_expiry_date.substring(0, 10) : ''
            });
        } else {
            setEditPlan(null);
        }
    }, [selectedUser]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync selectedUser part
    useEffect(() => {
        if (!selectedUser) return;
        
        const syncSelected = async () => {
            try {
                const freshData = await apiClient.getAdminUserStats(selectedUser.id);
                setSelectedUser((prev: any) => {
                    if (!prev || prev.id !== freshData.id) return prev;
                    if (JSON.stringify(prev) === JSON.stringify(freshData)) return prev;
                    return { ...prev, ...freshData };
                });
            } catch (err) {
                console.warn('Sync selected user failed', err);
            }
        };

        syncSelected();
    }, [stats]);

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
            showNotification(updated.is_verified ? 'Selo concedido!' : 'Selo removido.', 'success');
            loadStats(true);
        } catch (err: any) {
            showNotification(err.message || t('common.error'), 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!selectedUser || !editPlan || isUpdating) return;
        try {
            setIsUpdating(true);
            const updates: any = {
                plan_type: editPlan.type,
                subscription_expiry_date: editPlan.expiry ? new Date(editPlan.expiry).toISOString() : null,
                subscription_status: editPlan.type === 'free' ? 'canceled' : 'active'
            };
            const updated = await apiClient.updateAdminUser(selectedUser.id, updates);
            setSelectedUser({ 
                ...selectedUser, 
                plan_type: updated.plan_type, 
                subscription_expiry_date: updated.subscription_expiry_date 
            });
            loadStats(true);
        } catch (err: any) {
            showNotification(err.message || t('common.error'), 'error');
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
            showNotification(err.message || t('common.error'), 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUpdating) return;
        try {
            setIsUpdating(true);
            await apiClient.createAdminUser(newUserForm);
            setIsCreateModalOpen(false);
            setNewUserForm({ email: '', password: '', username: '', plan_type: 'free', subscription_expiry_date: '' });
            loadStats(true);
            showNotification('Usuário registrado com sucesso!', 'success');
        } catch (err: any) {
            showNotification(err.message || t('common.error'), 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const openUser = async (u: any) => {
        setDeleteConfirm(false);
        setDeleteInput('');
        setSelectedUser(u);
        
        try {
            setIsUserDetailsLoading(true);
            const fullStats = await apiClient.getAdminUserStats(u.id);
            setSelectedUser((prev: any) => prev && prev.id === u.id ? { ...prev, ...fullStats } : prev);
        } catch (error) {
            console.error('Failed to load user detailed stats', error);
        } finally {
            setIsUserDetailsLoading(false);
        }
    };

    const loadStats = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            setError(null);
            let data = await apiClient.getAdminStats() as any;

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
            setError(err.message || t('admin.criticalError'));
            console.error(err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        const interval = setInterval(() => {
            loadStats(true);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-[70vh] flex items-center justify-center p-6">
                <BrutalistLoader
                    message={t('admin.accessingEngine')}
                    progress={50}
                    subtext={t('admin.systemStats')}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-6 text-center">
                <div className="bg-[#ff3333] border-2 border-[#1a1a1a] p-8 shadow-[0_4px_0_0_#1a1a1a] inline-block rounded-md">
                    <ShieldAlert size={48} className="mx-auto mb-4 text-black" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-black mb-2">{t('admin.criticalError')}</h2>
                    <p className="text-sm font-bold text-black uppercase">{error}</p>
                    <button
                        onClick={() => loadStats()}
                        className="mt-6 px-6 py-3 bg-white border-2 border-[#1a1a1a] text-xs font-black uppercase tracking-widest hover:bg-white transition-colors shadow-[0_4px_0_0_#1a1a1a] rounded-md"
                    >
                        {t('admin.reconnect')}
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
        <>
        <div className="w-full max-w-full pb-12 pt-6">
            {/* Nav Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pt-2 pb-4 scrollbar-hide">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-8 py-4 rounded-xl border-2 border-black font-black uppercase text-[11px] tracking-widest flex items-center gap-3 shrink-0 transition-all ${
                        activeTab === 'overview' 
                        ? 'bg-[#ffdf00] shadow-[0_4px_0_0_#1a1a1a] -translate-y-1' 
                        : 'bg-white hover:bg-[#ffdf00]/10 hover:shadow-[0_4px_0_0_#1a1a1a] hover:-translate-y-0.5'
                    }`}
                >
                    <TrendingUp size={18} strokeWidth={3} />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('blog')}
                    className={`px-8 py-4 rounded-xl border-2 border-black font-black uppercase text-[11px] tracking-widest flex items-center gap-3 shrink-0 transition-all ${
                        activeTab === 'blog' 
                        ? 'bg-[#97cd7a] shadow-[0_4px_0_0_#1a1a1a] -translate-y-1' 
                        : 'bg-white hover:bg-[#97cd7a]/10 hover:shadow-[0_4px_0_0_#1a1a1a] hover:-translate-y-0.5'
                    }`}
                >
                    <Rss size={18} strokeWidth={3} />
                    Conteúdo do Blog
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-8 py-4 rounded-xl border-2 border-black font-black uppercase text-[11px] tracking-widest flex items-center gap-3 shrink-0 transition-all ${
                        activeTab === 'settings' 
                        ? 'bg-slate-200 shadow-[0_4px_0_0_#1a1a1a] -translate-y-1' 
                        : 'bg-white hover:bg-slate-50 hover:shadow-[0_4px_0_0_#1a1a1a] hover:-translate-y-0.5'
                    }`}
                >
                    <Settings size={18} strokeWidth={3} />
                    Configurações
                </button>
                <button
                    onClick={() => {
                        setActiveTab('verifications');
                        if (!verifLoading && verifications.length === 0) {
                            setVerifLoading(true);
                            apiClient.getAdminVerifications()
                                .then(data => setVerifications(data))
                                .catch(()=>{})
                                .finally(()=>setVerifLoading(false));
                        }
                    }}
                    className={`px-8 py-4 rounded-xl border-2 border-black font-black uppercase text-[11px] tracking-widest flex items-center gap-3 shrink-0 transition-all relative ${
                        activeTab === 'verifications'
                        ? 'bg-[#ffdf00] shadow-[0_4px_0_0_#1a1a1a] -translate-y-1'
                        : 'bg-white hover:bg-[#ffdf00]/10 hover:shadow-[0_4px_0_0_#1a1a1a] hover:-translate-y-0.5'
                    }`}
                >
                    <BadgeCheck size={18} strokeWidth={3} />
                    Verificações
                    {verifications.filter(v => v.status === 'pending').length > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                            {verifications.filter(v => v.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'verifications' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <h2 className="text-lg font-black uppercase tracking-tighter">Solicitações de Verificação</h2>
                        <div className="flex gap-2 flex-wrap">
                            {['', 'pending', 'approved', 'rejected'].map(f => (
                                <button key={f} onClick={() => {
                                    setVerifFilter(f);
                                    setVerifLoading(true);
                                    apiClient.getAdminVerifications(f || undefined)
                                        .then(data => setVerifications(data))
                                        .catch(()=>{})
                                        .finally(()=>setVerifLoading(false));
                                }} className={`px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                    verifFilter === f ? 'bg-[#ffdf00] shadow-[0_3px_0_0_#000]' : 'bg-white hover:bg-slate-50 shadow-[0_3px_0_0_#000]'
                                }`}>
                                    {f === '' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Reprovados'}
                                </button>
                            ))}
                            <button onClick={() => {
                                setVerifLoading(true);
                                apiClient.getAdminVerifications(verifFilter || undefined)
                                    .then(data => setVerifications(data))
                                    .catch(()=>{})
                                    .finally(()=>setVerifLoading(false));
                            }} className="px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest rounded-lg bg-white shadow-[0_3px_0_0_#000] hover:bg-slate-50">
                                <RefreshCw size={14} strokeWidth={3} className={verifLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    {verifLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : verifications.length === 0 ? (
                        <div className="p-16 border-2 border-black bg-white rounded-xl text-center shadow-[0_4px_0_0_#000]">
                            <BadgeCheck size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="text-sm font-black uppercase opacity-30">Nenhuma solicitação encontrada</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {verifications.map(v => (
                                <div key={v.id} className="bg-white border-2 border-black rounded-xl shadow-[0_4px_0_0_#000] overflow-hidden">
                                    {/* Row */}
                                    <div
                                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedVerif(expandedVerif === v.id ? null : v.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-full border-2 border-black overflow-hidden bg-slate-100 shrink-0">
                                                {v.users?.avatar_url
                                                    ? <img src={v.users.avatar_url} className="w-full h-full object-cover" alt="" />
                                                    : <div className="w-full h-full flex items-center justify-center font-black text-lg">{v.users?.username?.[0]?.toUpperCase()}</div>
                                                }
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black">{v.display_name}</span>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 border border-black rounded-md ${
                                                        v.status === 'pending' ? 'bg-[#ffdf00]' :
                                                        v.status === 'approved' ? 'bg-[#97cd7a]' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                        {v.status === 'pending' ? 'PENDENTE' : v.status === 'approved' ? 'APROVADO' : 'REPROVADO'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">@{v.users?.username} • {new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} strokeWidth={3} className={`transition-transform ${expandedVerif === v.id ? 'rotate-90' : ''}`} />
                                    </div>

                                    {/* Expanded panel */}
                                    {expandedVerif === v.id && (
                                        <div className="border-t-2 border-black p-6 space-y-5 bg-[#fafafa]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { label: 'Link Nodus', value: v.nodus_link },
                                                    { label: 'E-mail', value: v.contact_email },
                                                    { label: 'Categoria', value: v.category },
                                                    { label: 'Verificado em outras redes', value: v.has_verified_badge ? 'Sim' : 'Não' },
                                                ].map(item => (
                                                    <div key={item.label} className="p-3 bg-white border-2 border-black rounded-lg">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-1">{item.label}</p>
                                                        <p className="text-[11px] font-bold text-black break-all">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Perfis Sociais</p>
                                                {[v.social_link_1, v.social_link_2, v.social_link_3].filter(Boolean).map((link: string, i: number) => (
                                                    <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-blue-600 hover:underline break-all">
                                                        <ExternalLink size={12} strokeWidth={3} />{link}
                                                    </a>
                                                ))}
                                            </div>
                                            {(v.press_link_1 || v.press_link_2 || v.press_link_3) && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Links de Imprensa</p>
                                                    {[v.press_link_1, v.press_link_2, v.press_link_3].filter(Boolean).map((link: string, i: number) => (
                                                        <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-blue-600 hover:underline break-all">
                                                            <ExternalLink size={12} strokeWidth={3} />{link}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                            {v.status === 'rejected' && v.reason && (
                                                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">Motivo da Rejeição</p>
                    <p className="text-[11px] font-bold text-black/70">{v.reason}</p>
                                                </div>
                                            )}
                                            {v.status === 'pending' && (
                                                <div className="space-y-3 pt-2 border-t-2 border-black/5">
                                                    {verifAction !== null && verifAction.id === v.id && verifAction.action === 'reject' ? (
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Motivo da Rejeição</label>
                                                            <textarea
                                                                value={rejectReason}
                                                                onChange={e => setRejectReason(e.target.value)}
                                                                placeholder="Descreva o motivo da rejeição para o usuário..."
                                                                rows={3}
                                                                className="w-full p-3 border-2 border-black rounded-lg text-sm font-medium resize-none outline-none focus:bg-[#fdfcf0]"
                                                            />
                                                            <div className="flex gap-3">
                                                                <button onClick={() => setVerifAction(null)} className="flex-1 py-3 bg-white border-2 border-black text-[11px] font-black uppercase tracking-widest rounded-lg shadow-[0_3px_0_0_#000] hover:shadow-none hover:translate-y-[2px] transition-all">Cancelar</button>
                                                                <button onClick={async () => {
                                                                    setIsUpdating(true);
                                                                    try {
                                                                        await apiClient.reviewVerification(v.id, 'reject', rejectReason);
                                                                        setVerifications(prev => prev.map((r: any) => r.id === v.id ? {...r, status:'rejected', reason: rejectReason} : r));
                                                                        setVerifAction(null); setRejectReason('');
                                                                        showNotification('Solicitação reprovada.', 'success');
                                                                    } catch(e:any) { showNotification(e.message, 'error'); }
                                                                    finally { setIsUpdating(false); }
                                                                }} disabled={!rejectReason.trim() || isUpdating} className="flex-1 py-3 bg-red-500 text-white border-2 border-black text-[11px] font-black uppercase tracking-widest rounded-lg shadow-[0_3px_0_0_#000] hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-40">
                                                                    {isUpdating ? '...' : 'Confirmar Rejeição'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            <button onClick={() => setVerifAction({id: v.id, action:'reject'})} className="flex-1 py-3 bg-white border-2 border-black text-red-500 text-[11px] font-black uppercase tracking-widest rounded-lg shadow-[0_3px_0_0_#000] hover:shadow-none hover:translate-y-[2px] transition-all flex items-center justify-center gap-2">
                                                                <XCircle size={14} strokeWidth={3} /> Reprovar
                                                            </button>
                                                            <button onClick={async () => {
                                                                setIsUpdating(true);
                                                                try {
                                                                    await apiClient.reviewVerification(v.id, 'approve');
                                                                    setVerifications(prev => prev.map((r: any) => r.id === v.id ? {...r, status:'approved'} : r));
                                                                    showNotification('Solicitação aprovada! Perfil verificado.', 'success');
                                                                } catch(e:any) { showNotification(e.message, 'error'); }
                                                                finally { setIsUpdating(false); }
                                                            }} disabled={isUpdating} className="flex-1 py-3 bg-[#97cd7a] border-2 border-black text-black text-[11px] font-black uppercase tracking-widest rounded-lg shadow-[0_3px_0_0_#000] hover:shadow-none hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                                                                <Check size={14} strokeWidth={3} /> Aprovar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : activeTab === 'blog' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BlogAdminView />
                </div>
            ) : activeTab === 'settings' ? (
                <div className="p-12 border-2 border-black bg-white rounded-md shadow-[0_6px_0_0_#000] text-center">

                    <Settings size={48} className="mx-auto mb-4 opacity-10" />
                    <h2 className="text-xl font-black uppercase">{t('admin.settings')}</h2>
                    <p className="text-sm opacity-40 uppercase font-black mt-2">Área em desenvolvimento</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="bg-white border-2 border-black p-8 md:p-12 mb-10 shadow-[0_6px_0_0_#000000] relative overflow-hidden rounded-md">
                        <div className="absolute -right-20 -top-20 text-[#1a1a1a]/5 pointer-events-none">
                            <ShieldAlert size={400} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffdf00] text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] rounded-md">
                                    <span className="w-2 h-2 rounded-full bg-[#ffdf00] animate-pulse"></span>
                                    {t('admin.console')}
                                </div>
                                <div className="px-3 py-1 bg-white border-2 border-black text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_3px_0_0_rgba(0,0,0,1)] rounded-md">
                                    <RefreshCw size={10} strokeWidth={4} className="animate-spin duration-[4000ms]" />
                                    {t('admin.realTimeMonitoring')}
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black text-black uppercase tracking-tighter leading-[0.8] mb-4">
                                {t('admin.title').split(' ').map((word, i) => (
                                    <React.Fragment key={i}>
                                        {word} {i === 1 && <br className="hidden md:block" />}
                                    </React.Fragment>
                                ))}
                            </h1>
                            <p className="text-xs md:text-lg font-black text-black uppercase tracking-widest max-w-2xl bg-white border-2 border-black p-2 inline-block shadow-[0_3px_0_0_#000000] rounded-md">
                                {t('admin.subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Main KPIs Row */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
                        <KPIBox
                            label={t('admin.totalUsers')}
                            value={stats.summary?.totalUsers || 0}
                            color="#e6b3ff"
                            icon={<Users size={20} />}
                            sublabel={t('admin.thisWeek', { count: stats.growth?.thisWeek || 0 })}
                        />
                        <KPIBox
                            label={t('admin.proConversion')}
                            value={`${conversionRate}%`}
                            color="#ffdf00"
                            icon={<ShieldAlert size={20} />}
                            sublabel={t('admin.activeSubscribers', { count: stats.summary?.proUsers || 0 })}
                        />
                        <KPIBox
                            label={t('admin.ctr')}
                            value={`${stats.summary?.globalCTR || '0.00'}%`}
                            color="#ff66b2"
                            icon={<MousePointerClick size={20} />}
                            sublabel={t('admin.globalEfficiency')}
                        />
                        <KPIBox
                            label={t('admin.globalViews')}
                            value={stats.summary?.totalViews || 0}
                            color="#66ccff"
                            icon={<Eye size={20} />}
                            sublabel={t('admin.networkReach')}
                        />
                        <KPIBox
                            label="Visitantes Únicos"
                            value={(stats.summary as any)?.uniqueVisitors || 0}
                            color="#97cd7a"
                            icon={<Users size={20} />}
                            sublabel="Total de Pessoas"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white border-2 border-black shadow-[0_5px_0_0_#000000] flex flex-col rounded-md overflow-hidden">
                                <div className="p-6 border-b-2 border-black bg-[#fafafa] flex justify-between items-center">
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black">{t('admin.newExplorers')}</h2>
                                    <button 
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="text-[10px] font-black bg-[#ffdf00] border-2 border-black text-black px-3 py-1 rounded-md shadow-[0_2px_0_0_#000] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all flex items-center gap-2"
                                    >
                                        <PlusCircle size={14} strokeWidth={3} />
                                        Novo Usuário
                                    </button>
                                </div>
                                <div className="divide-y-2 divide-black max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {stats.latestUsers?.map((u) => (
                                        <div
                                            key={u.id}
                                            onClick={() => openUser(u)}
                                            className="p-4 flex items-center justify-between hover:bg-[#ffdf00]/10 cursor-pointer transition-all active:translate-y-1 active:translate-x-1 active:shadow-none group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black text-lg rounded-full overflow-hidden shrink-0 bg-white shadow-[0_3px_0_0_#000]`}>
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} className="w-full h-full object-cover rounded-full" alt={u.username} />
                                                    ) : (
                                                        u.username?.[0]?.toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 line-clamp-1">
                                                        <h3 className="text-xs font-black uppercase tracking-tight text-black">{u.name || u.username}</h3>
                                                        {u.is_verified && <img src="/icons/icons8-verificado-48.png" className="w-4 h-4 ml-0.5 object-contain" alt="Verified" loading="lazy" decoding="async" />}
                                                    </div>
                                                    <p className="text-[10px] font-black text-black opacity-40 uppercase line-clamp-1">@{u.username} • {u.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-[8px] font-black py-0.5 px-2 mb-1 inline-block border-2 border-black rounded-md shadow-[0_2px_0_0_#000] ${u.plan_type !== 'free' ? 'bg-[#ffdf00] text-black' : 'bg-white text-black'}`}>
                                                    {translatePlan(u.plan_type, t)}
                                                </div>
                                                <p className="text-[9px] font-black text-black opacity-30 uppercase">
                                                    {new Date(u.created_at).toLocaleDateString(t('common.locale', { defaultValue: 'pt-BR' }))}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white border-2 border-black p-8 shadow-[0_4px_0_0_#000] rounded-md">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">{t('admin.contentInventory')}</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-4xl font-black">{stats.summary?.totalLinks || 0}</span>
                                            <p className="text-[10px] font-black uppercase">{t('admin.activeLinks')}</p>
                                        </div>
                                        <div className="h-12 w-[3px] bg-black"></div>
                                        <div>
                                            <span className="text-4xl font-black">{stats.summary?.totalProducts || 0}</span>
                                            <p className="text-[10px] font-black uppercase">{t('admin.products')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-black p-6 shadow-[0_4px_0_0_#ff66b2] rounded-md">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">{t('admin.realTimeMonitoring')}</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-4xl font-black">{stats.summary?.totalClicks || 0}</span>
                                            <p className="text-[10px] font-black uppercase">{t('admin.clicks')}</p>
                                        </div>
                                        <div className="h-12 w-[3px] bg-black"></div>
                                        <div>
                                            <span className="text-4xl font-black">{stats.summary?.totalViews || 0}</span>
                                            <p className="text-[10px] font-black uppercase">{t('admin.views')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#e6b3ff] border-2 border-[#1a1a1a] p-6 shadow-[0_6px_0_0_#1a1a1a] rounded-md">
                                <h2 className="text-lg font-black uppercase tracking-tighter mb-6">{t('admin.growth')}</h2>
                                <div className="space-y-8">
                                    <GrowthLine label={t('admin.newToday')} value={stats.growth?.today || 0} percentage={((stats.growth?.today || 0) / (stats.summary?.totalUsers || 1) * 100).toFixed(1)} />
                                    <GrowthLine label={t('admin.last7Days')} value={stats.growth?.thisWeek || 0} percentage={((stats.growth?.thisWeek || 0) / (stats.summary?.totalUsers || 1) * 100).toFixed(1)} />
                                </div>
                                <div className="mt-10 pt-6 border-t-2 border-[#1a1a1a]/10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase opacity-40">{t('admin.growthAverage')}</p>
                                            <h4 className="text-2xl font-black">{t('admin.growthPerDay', { count: Math.ceil((stats.growth?.thisWeek || 0) / 7) })}</h4>
                                        </div>
                                        <div className="p-2 bg-[#1a1a1a] text-[#e6b3ff] rounded-md">
                                            <RefreshCw size={24} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border-2 border-black p-6 shadow-[0_4px_0_0_#000] rounded-md">
                                <h2 className="text-xs font-black uppercase tracking-widest mb-4">{t('admin.systemHealth')}</h2>
                                <div className="space-y-3">
                                    <StatusIndicator label="API Engine" status="ONLINE" />
                                    <StatusIndicator label="DB Supabase" status="LATENCY OK" />
                                    <StatusIndicator label="Stripe Node" status="READY" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
        
        {/* User Detail Management */}
        {createPortal(
                <div className="admin-portals-wrapper">
                    <AnimatePresence>
                        {selectedUser && (
                            <div className={`fixed inset-0 z-[99999] flex overflow-hidden pointer-events-none ${isMobile ? 'items-end' : 'items-center justify-center p-6'}`}>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedUser(null)}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-md cursor-pointer pointer-events-auto"
                                />
                                <motion.div
                                    initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.98, y: 30 }}
                                    animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                                    exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.98, y: 30 }}
                                    transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                                    className={`
                                        bg-white w-full relative overflow-hidden pointer-events-auto flex flex-col border-2 border-[#1a1a1a] shadow-[0_20px_0_0_rgba(0,0,0,0.1)]
                                        ${isMobile ? 'h-[95vh] rounded-none' : 'max-w-[900px] h-[850px] rounded-[40px]'}
                                    `}>
                                     <div className="flex-1 overflow-y-auto bg-[#fafafa] custom-scrollbar-brutal relative">
                                         <div className="absolute top-0 left-0 w-full h-[8px] bg-[#ffdf00] z-[100]" />
                                         
                                         {/* HERO IDENTITY */}
                                         <div className="p-10 md:p-14 pb-8">
                                             <div className="flex flex-col md:flex-row gap-12 items-start md:items-center relative">
                                                 <div className="relative group/avatar shrink-0">
                                                     <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-2 border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] overflow-hidden bg-white shrink-0 relative z-10 transition-all duration-500">
                                                         {selectedUser.avatar_url ? (
                                                             <img src={selectedUser.avatar_url} className="w-full h-full object-cover rounded-full" alt={selectedUser.username} />
                                                         ) : (
                                                             <div className="w-full h-full flex items-center justify-center font-black text-6xl text-black/5 bg-slate-50 uppercase rounded-full">
                                                                 {selectedUser.username?.[0]}
                                                             </div>
                                                         )}
                                                     </div>
                                                     {selectedUser.is_verified && (
                                                         <div className="absolute -right-4 -top-4 bg-[#ffdf00] border-[2px] border-[#1a1a1a] p-3 rounded-md shadow-[0_4px_0_0_#1a1a1a] z-20 animate-bounce">
                                                             <Check size={24} className="text-black" strokeWidth={5} />
                                                         </div>
                                                     )}
                                                 </div>
                                                 <div className="flex-1 space-y-5">
                                                     <div className="space-y-2">
                                                         <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none">{selectedUser.name || selectedUser.username}</h2>
                                                         <div className="flex flex-wrap items-center gap-3">
                                                              <span className="px-5 py-2 bg-white border-2 border-[#1a1a1a] text-black text-[12px] font-black uppercase tracking-[0.25em] rounded-md shadow-[0_4px_0_0_#1a1a1a]">@{selectedUser.username}</span>
                                                              <span className="px-5 py-2 bg-black/5 text-black/40 text-[12px] font-black uppercase tracking-wider rounded-md border border-black/5">{selectedUser.email}</span>
                                                              <span className="px-5 py-2 bg-white border-2 border-[#1a1a1a] text-black/50 text-[10px] font-black uppercase tracking-widest rounded-md shadow-[0_4px_0_0_#1a1a1a] flex items-center gap-2">
                                                                  <Calendar size={14} strokeWidth={4} />
                                                                  {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                                                              </span>
                                                          </div>
                                                      </div>
                                                      <div className="flex flex-wrap gap-5 pt-3">
                                                         <button 
                                                             onClick={() => window.open(`/${selectedUser.username}`, '_blank')}
                                                             className="flex items-center gap-3 px-10 py-5 bg-[#ffdf00] border-[2px] border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-1 active:scale-95 transition-all text-[11px] font-black uppercase tracking-widest rounded-md"
                                                         >
                                                             <ExternalLink size={18} strokeWidth={4} />
                                                             Ver Perfil Público
                                                         </button>
                                                         <button 
                                                             onClick={toggleVerification}
                                                             className={`px-10 py-5 border-[2px] border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-1 transition-all text-[11px] font-black uppercase tracking-widest rounded-md ${selectedUser.is_verified ? 'bg-white text-black' : 'bg-[#ffdf00] text-black'}`}
                                                         >
                                                             {selectedUser.is_verified ? 'Remover Verificado' : 'Conceder Selo'}
                                                         </button>
                                                     </div>
                                                 </div>
    
                                                 <button 
                                                     onClick={() => setSelectedUser(null)} 
                                                     className="absolute -top-4 -right-4 w-14 h-14 flex items-center justify-center bg-white border-[2px] border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] hover:bg-[#ff3333] hover:text-white transition-all rounded-sm active:scale-90 group"
                                                 >
                                                     <X size={28} strokeWidth={5} className="transition-transform duration-300" />
                                                 </button>
                                             </div>
                                         </div>
    
                                         {/* MODULAR CONTENT AREA */}
                                         <div className="px-10 md:px-14 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                             <div className="bg-white border-2 border-black p-10 rounded-md shadow-[0_5px_0_0_#66ccff] relative overflow-hidden group">
                                                  <div className="absolute -right-6 -bottom-6 opacity-[0.04] transition-all duration-700 text-[#66ccff]"><Eye size={160} /></div>
                                                 <span className="text-[11px] font-black uppercase tracking-[0.25em] text-black mb-3 block opacity-40">Volume de Alcance</span>
                                                 <div className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-sm">{isUserDetailsLoading ? '...' : (selectedUser.views || 0)}</div>
                                                 <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-[#66ccff]">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-[#66ccff] animate-ping" />
                                                     Visualizações únicas
                                                 </div>
                                             </div>
                                             <div className="bg-white border-2 border-black p-10 rounded-md shadow-[0_5px_0_0_#ff66b2] relative overflow-hidden group">
                                                  <div className="absolute -right-6 -bottom-6 opacity-[0.04] transition-all duration-700 text-[#ff66b2]"><MousePointerClick size={160} /></div>
                                                 <span className="text-[11px] font-black uppercase tracking-[0.25em] text-black mb-3 block opacity-40">Interações Reais</span>
                                                 <div className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-sm">{isUserDetailsLoading ? '...' : (selectedUser.clicks?.[0]?.count || 0)}</div>
                                                 <div className="text-[10px] font-black uppercase text-[#ff66b2] mt-4">Engajamento Direto</div>
                                             </div>
                                             <div className="bg-white border-2 border-black p-10 rounded-md shadow-[0_5px_0_0_#ffdf00] relative overflow-hidden group">
                                                  <div className="absolute -right-6 -bottom-6 opacity-[0.04] transition-all duration-700 text-[#ffdf00]"><TrendingUp size={160} /></div>
                                                 <span className="text-[11px] font-black uppercase tracking-[0.25em] text-black mb-3 block opacity-40">Performance Geral</span>
                                                 <div className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-sm">{isUserDetailsLoading ? '...' : `${Math.round(((selectedUser.clicks?.[0]?.count || 0) / (selectedUser.views || 1)) * 100)}%`}</div>
                                                 <div className="text-[10px] font-black uppercase text-[#ffdf00] mt-4">Taxa de Conversão</div>
                                             </div>
                                         </div>
    
                                         {/* 3. CORE MANAGEMENT GRID */}
                                         <div className="px-10 md:px-14 grid grid-cols-1 lg:grid-cols-2 gap-12 pb-24">
                                             {/* LEFT COLUMN: IDENTITY & CONTENT */}
                                             <div className="space-y-8">
                                                 <div className="bg-white border-[2px] border-[#1a1a1a] rounded-[40px] shadow-[0_8px_0_0_#1a1a1a] overflow-hidden">
                                                     <div className="bg-slate-50 border-b-[2px] border-[#1a1a1a] p-6 flex justify-between items-center">
                                                         <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <User size={18} strokeWidth={4} />
                                                            Identidade e Conteúdo
                                                         </h3>
                                                     </div>
                                                     <div className="p-8 space-y-8">
                                                         {/* Bio Section */}
                                                         <div className="bg-black/5 p-6 rounded-2xl border-2 border-dashed border-black/10 relative">
                                                             <div className="absolute -top-3 left-6 px-3 py-1 bg-[#ffdf00] border-2 border-[#1a1a1a] text-black text-[9px] font-black uppercase tracking-widest rounded-sm">Manifesto Bio</div>
                                                             <p className="text-lg font-black uppercase text-black leading-tight">
                                                                 "{selectedUser.bio || 'SEM DESCRIÇÃO DEFINIDA'}"
                                                             </p>
                                                         </div>

                                                         {/* Triple Info Row */}
                                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                             <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[0_3px_0_0_#000] space-y-1">
                                                                 <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block">Segmentação</label>
                                                                 <div className="text-[11px] font-black uppercase truncate">{selectedUser.user_category || 'N/A'}</div>
                                                             </div>
                                                             <div className="p-4 bg-[#ffdf00] border-2 border-black rounded-xl shadow-[0_3px_0_0_#000] space-y-1">
                                                                 <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block">Tema</label>
                                                                 <div className="text-[11px] font-black uppercase truncate">{selectedUser.theme_id?.replace('theme-', '') || 'Padrão'}</div>
                                                             </div>
                                                             <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[0_3px_0_0_#000] space-y-1">
                                                                 <label className="text-[9px] font-black uppercase text-black/30 tracking-widest block">Indicação</label>
                                                                 <div className="text-[11px] font-black uppercase truncate">{selectedUser.referral_source || 'Direto'}</div>
                                                             </div>
                                                         </div>

                                                         {/* Inventory Stats */}
                                                         <div className="grid grid-cols-2 gap-4">
                                                             <div className="flex flex-col p-6 bg-white border-2 border-[#1a1a1a] text-black rounded-2xl shadow-[0_4px_0_0_#66ccff] hover:translate-y-[-2px] transition-transform">
                                                                 <LinkIcon size={20} className="text-[#66ccff] mb-3" strokeWidth={4} />
                                                                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Links Ativos</span>
                                                                 <span className="text-3xl font-black">{selectedUser.links?.[0]?.count || 0}</span>
                                                             </div>
                                                             <div className="flex flex-col p-6 bg-white border-2 border-[#1a1a1a] text-black rounded-2xl shadow-[0_4px_0_0_#ff66b2] hover:translate-y-[-2px] transition-transform">
                                                                 <ShoppingBag size={20} className="text-[#ff66b2] mb-3" strokeWidth={4} />
                                                                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Produtos</span>
                                                                 <span className="text-3xl font-black">{selectedUser.products?.[0]?.count || 0}</span>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
    
                                             {/* RIGHT COLUMN: SUBSCRIPTION & ACTIONS */}
                                             <div className="space-y-10">
                                                 <div className="bg-white border-[2px] border-[#1a1a1a] rounded-[40px] shadow-[0_8px_0_0_#ffdf00] overflow-hidden">
                                                     <div className="bg-slate-50 border-b-[2px] border-[#1a1a1a] p-6 flex justify-between items-center">
                                                         <h3 className="text-xs font-black uppercase tracking-[0.25em] flex items-center gap-2">
                                                            <Crown size={18} strokeWidth={4} className="text-[#ffdf00]" />
                                                            Nível de Assinatura
                                                         </h3>
                                                     </div>
                                                     <div className="p-8 space-y-8">
                                                         {/* Current Plan Display */}
                                                         <div className="p-8 bg-slate-50 border-2 border-[#1a1a1a] rounded-[32px] relative overflow-hidden flex items-center justify-between">
                                                             <div className="absolute top-0 right-0 w-32 h-full bg-[#ffdf00]/5 -skew-x-[30deg] translate-x-12" />
                                                             <div className="relative z-10">
                                                                 <div className="flex items-center gap-3 mb-1">
                                                                     <span className="text-4xl font-black uppercase tracking-tighter">{selectedUser.plan_type}</span>
                                                                     <div className="px-3 py-1 bg-[#ffdf00] text-black border-2 border-[#1a1a1a] text-[9px] font-black rounded-md uppercase">Ativo</div>
                                                                 </div>
                                                                 <p className="text-[10px] font-bold uppercase text-black/30">Expira em: {selectedUser.subscription_expiry_date ? new Date(selectedUser.subscription_expiry_date).toLocaleDateString() : 'Perpetuidade'}</p>
                                                             </div>
                                                             <div className="hidden md:block">
                                                                 <PieChart size={48} className="text-black/5" />
                                                             </div>
                                                         </div>
    
                                                         {/* Upgrade Controls */}
                                                         <div className="space-y-4">
                                                             <label className="text-[10px] font-black uppercase tracking-widest text-black/30 pl-2">Alterar Plano Rapidamente</label>
                                                             <div className="grid grid-cols-3 gap-3">
                                                                 {['free', 'monthly', 'annual'].map((type) => (
                                                                     <button
                                                                         key={type}
                                                                         onClick={() => setEditPlan({ ...editPlan!, type })}
                                                                         className={`py-4 text-[10px] font-black uppercase border-2 border-[#1a1a1a] rounded-xl transition-all ${editPlan?.type === type ? 'bg-[#ffdf00] shadow-[0_4px_0_0_#1a1a1a] -translate-y-1' : 'bg-white hover:bg-slate-50'}`}
                                                                     >
                                                                         {type}
                                                                     </button>
                                                                 ))}
                                                             </div>
                                                         </div>
    
                                                         <button 
                                                             onClick={handleUpdatePlan}
                                                             disabled={isUpdating}
                                                             className="w-full py-5 bg-[#ffdf00] text-black border-2 border-[#1a1a1a] text-[12px] font-black uppercase tracking-[0.3em] rounded-xl shadow-[0_5px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                                                         >
                                                             {isUpdating ? 'ATUALIZANDO...' : 'EXECUTAR ATUALIZAÇÃO'}
                                                         </button>
                                                     </div>
                                                 </div>

                                                 <div className="bg-[#fff1f1] border-[4px] border-[#1a1a1a] p-10 rounded-[48px] shadow-[0_16px_0_0_#ff3333] space-y-8">
                                                     <div className="flex items-center gap-4 text-[#ff3333]">
                                                         <ShieldAlert size={32} strokeWidth={4} />
                                                         <h3 className="text-xl font-black uppercase tracking-tighter">Protocolo de Exclusão</h3>
                                                     </div>
                                                     
                                                     {!deleteConfirm ? (
                                                         <button 
                                                             onClick={() => setDeleteConfirm(true)}
                                                             className="w-full py-5 bg-white border-[2px] border-[#1a1a1a] text-[#ff3333] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-[0_4px_0_0_#1a1a1a] active:translate-y-1 active:shadow-none hover:bg-red-50 rounded-md"
                                                         >
                                                             Terminar Registro do Usuário
                                                         </button>
                                                     ) : (
                                                         <div className="bg-white border-[3px] border-[#1a1a1a] p-8 rounded-[40px] space-y-6 shadow-[0_6px_0_0_rgba(255,51,51,0.2)]">
                                                             <div className="text-center space-y-2">
                                                                 <p className="text-[12px] font-black uppercase text-[#ff3333] tracking-widest">Confirmação de Purga Requerida</p>
                                                                 <p className="text-[10px] font-bold uppercase opacity-30 tracking-tight">Digite 'DELETE' para confirmar a ação irreversível</p>
                                                             </div>
                                                             <input
                                                                 type="text"
                                                                 value={deleteInput}
                                                                 onChange={(e) => setDeleteInput(e.target.value)}
                                                                 placeholder="SEGURANÇA"
                                                                 className="w-full bg-slate-50 border-[3px] border-[#1a1a1a] p-5 text-center text-sm font-black rounded-md outline-none focus:bg-white transition-colors"
                                                             />
                                                             <div className="flex gap-4">
                                                                 <button 
                                                                     onClick={handleDeleteUser} 
                                                                     disabled={deleteInput.trim().toUpperCase() !== 'DELETE'}
                                                                     className={`flex-1 py-5 border-[3px] border-[#1a1a1a] rounded-sm text-[11px] font-black uppercase transition-all rounded-md ${deleteInput.trim().toUpperCase() === 'DELETE' ? 'bg-[#ff3333] text-white shadow-[0_6px_0_0_#000]' : 'bg-slate-200 text-black/20'}`}
                                                                 >
                                                                     Expurgar
                                                                 </button>
                                                                 <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-5 bg-white border-[3px] border-[#1a1a1a] rounded-sm text-[11px] font-black uppercase hover:bg-[#97cd7a] hover:text-white transition-all shadow-[0_6px_0_0_#1a1a1a] rounded-md">Abortar</button>
                                                             </div>
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Create User Modal */}
                    <AnimatePresence>
                        {isCreateModalOpen && (
                            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white w-full max-w-lg p-10 border-4 border-black shadow-[0_12px_0_0_#000] rounded-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[8px] bg-[#97cd7a]" />
                                    
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter">Novo Usuário</h2>
                                        <button 
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="w-10 h-10 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-all rounded-sm shadow-[0_2px_0_0_#000]"
                                        >
                                            <X size={24} strokeWidth={4} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreateUser} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-black/40 tracking-widest pl-1">Email</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={newUserForm.email}
                                                onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                                                className="w-full bg-[#f8f8f8] border-2 border-black p-4 text-sm font-black rounded-md outline-none focus:bg-white transition-colors"
                                                placeholder="E-MAIL@EXEMPLO.COM"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-black/40 tracking-widest pl-1">Senha</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={newUserForm.password}
                                                onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                                                className="w-full bg-[#f8f8f8] border-2 border-black p-4 text-sm font-black rounded-md outline-none focus:bg-white transition-colors"
                                                placeholder="S3NH4_S3GUR4"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-black/40 tracking-widest pl-1">Username</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={newUserForm.username}
                                                onChange={(e) => setNewUserForm({...newUserForm, username: e.target.value})}
                                                className="w-full bg-[#f8f8f8] border-2 border-black p-4 text-sm font-black rounded-md outline-none focus:bg-white transition-colors"
                                                placeholder="NODUS_USER"
                                            />
                                                     <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-black/40 tracking-widest pl-1">Plano Inicial</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['free', 'monthly', 'yearly'].map(plan => (
                                                    <button
                                                        key={plan}
                                                        type="button"
                                                        onClick={() => setNewUserForm({...newUserForm, plan_type: plan})}
                                                        className={`py-3 border-2 border-black text-[10px] font-black uppercase rounded-md transition-all ${newUserForm.plan_type === plan ? 'bg-[#ffdf00] shadow-[0_3px_0_0_#000] -translate-y-0.5' : 'bg-white hover:bg-slate-50'}`}
                                                    >
                                                        {plan}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-black/40 tracking-widest pl-1">Expiração do Plano (Opcional)</label>
                                            <input 
                                                type="date" 
                                                value={newUserForm.subscription_expiry_date}
                                                onChange={(e) => setNewUserForm({...newUserForm, subscription_expiry_date: e.target.value})}
                                                className="w-full bg-[#f8f8f8] border-2 border-black p-4 text-sm font-black rounded-md outline-none focus:bg-white transition-colors uppercase"
                                            />
                                            <p className="text-[9px] font-bold text-black/30 uppercase pl-1">Deixe vazio para plano vitalício/padrão</p>
                                        </div>
                             </div>

                                        <button 
                                            type="submit" 
                                            disabled={isUpdating}
                                            className="w-full py-6 bg-[#97cd7a] text-black border-4 border-black text-[13px] font-black uppercase tracking-[0.4em] rounded-md shadow-[0_6px_0_0_#000] hover:shadow-none hover:translate-y-1.5 transition-all active:scale-95 disabled:opacity-50 mt-4"
                                        >
                                            {isUpdating ? 'PROCESSANDO...' : 'CRIAR REGISTRO'}
                                        </button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Custom Notification Toast */}
                    <AnimatePresence>
                        {notification && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100000] pointer-events-none"
                            >
                                <div className={`
                                    min-w-[320px] p-6 border-4 border-black rounded-md flex items-center gap-4 shadow-[0_8px_0_0_#000]
                                    ${notification.type === 'success' ? 'bg-[#97cd7a]' : 'bg-[#ff3333] text-white'}
                                `}>
                                    <div className="bg-white/20 p-2 rounded-sm">
                                        {notification.type === 'success' ? <Check size={20} strokeWidth={4} /> : <ShieldAlert size={20} strokeWidth={4} />}
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-widest">{notification.message}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </>
    );
}

function GrowthLine({ label, value, percentage }: any) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <span className="text-[11px] font-black uppercase tracking-widest opacity-40 block mb-1">{label}</span>
                <span className="text-3xl font-black">{value.toLocaleString()}</span>
            </div>
            <div className={`px-3 py-1.5 border-2 border-[#1a1a1a] rounded-md text-[10px] font-black bg-white shadow-[0_3px_0_0_#1a1a1a]`}>
                +{percentage}%
            </div>
        </div>
    );
}

function StatusIndicator({ label, status }: any) {
    return (
        <div className="flex items-center justify-between text-[10px] font-black uppercase">
            <span className="opacity-40">{label}</span>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#97cd7a] animate-pulse"></span>
                <span>{status}</span>
            </div>
        </div>
    );
}

function KPIBox({ label, value, icon, color, sublabel }: any) {
    const { t } = useTranslation();
    return (
        <div 
            className="group relative bg-white border-2 border-black p-8 rounded-md shadow-[0_6px_0_0_#000000] flex flex-col transition-all duration-200 overflow-hidden cursor-default active:translate-y-[2px] active:shadow-none"
        >
            <div className="flex justify-between items-start mb-10 relative z-10">
                <div 
                    className="w-14 h-14 rounded-sm border-2 border-black flex items-center justify-center transition-all duration-500 shadow-[0_3px_0_0_#000000]" 
                    style={{ backgroundColor: color }}
                >
                    {React.cloneElement(icon as any, { size: 28, strokeWidth: 4, className: 'text-black' })}
                </div>
                
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-black/40 tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                        {t('admin.status')}
                    </span>
                    <div className="flex items-center gap-2 bg-white border-2 border-black px-2 py-0.5 rounded-md shadow-[0_2px_0_0_#000000]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffdf00] animate-pulse" />
                        <span className="text-[9px] font-black uppercase text-black tracking-tighter">Live</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex flex-col gap-3">
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-black">
                    {label}
                </span>
                
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter tabular-nums text-black">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>
                    </div>
                    {sublabel && (
                        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-black text-white border-2 border-black rounded-sm w-fit">
                            <Activity size={10} strokeWidth={4} />
                            <span className="text-[10px] font-black uppercase tracking-tight">{sublabel}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
