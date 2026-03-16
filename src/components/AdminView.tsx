import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Users, Link as LinkIcon, ShoppingBag, Eye, MousePointerClick, RefreshCw, X, Mail, Calendar,
    ExternalLink, User, Copy, Check, Briefcase, ShieldCheck, Activity, Info, Lock, AlertCircle, TrendingUp,
    Crown, Clock, Layout, PieChart, BarChart, Settings, Shield, Trash2, Key, ChevronRight, Hash
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import BrutalistLoader from './BrutalistLoader';
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
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'manage'>('overview');

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

    // Sync selectedUser part - updated to use the dedicated endpoint for more accurate data
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

        // If stats change (global polling), trigger a local sync for the selected user
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
            setSelectedUser({ ...selectedUser, is_verified: updated.is_verified });
            loadStats(true); // Atualiza a lista por baixo
        } catch (err: any) {
            alert(t('common.error') + ': ' + (err.message || t('common.error')));
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
            alert(t('common.error') + ': ' + (err.message || t('common.error')));
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
            alert(t('common.error') + ': ' + (err.message || t('common.error')));
        } finally {
            setIsUpdating(false);
        }
    };

    const openUser = async (u: any) => {
        setDeleteConfirm(false);
        setDeleteInput('');
        setSelectedUser(u);
        setActiveTab('overview');
        
        // Fetch fresh and deep stats for this user immediately
        try {
            const fullStats = await apiClient.getAdminUserStats(u.id);
            setSelectedUser((prev: any) => prev && prev.id === u.id ? { ...prev, ...fullStats } : prev);
        } catch (error) {
            console.error('Failed to load user detailed stats', error);
        }
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
        }, 8000); // Polling slower to save resources

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
                <div className="bg-[#ff3333] border-2 border-[#1a1a1a] p-8 shadow-[0_4px_0_0_#1a1a1a] inline-block rounded-2xl">
                    <ShieldAlert size={48} className="mx-auto mb-4 text-black" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-black mb-2">{t('admin.criticalError')}</h2>
                    <p className="text-sm font-bold text-black uppercase">{error}</p>
                    <button
                        onClick={() => loadStats()}
                        className="mt-6 px-6 py-3 bg-white border-2 border-[#1a1a1a] text-xs font-black uppercase tracking-widest hover:bg-white transition-colors shadow-[0_4px_0_0_#1a1a1a] rounded-xl"
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
        <div className="w-full max-w-6xl mx-auto pb-12 px-4 md:px-0">
            {/* Header */}
            <div className="bg-white border-2 border-[#1a1a1a] p-8 md:p-12 mb-10 shadow-[0_8px_0_0_#1a1a1a] relative overflow-hidden rounded-[32px]">
                <div className="absolute -right-20 -top-20 text-[#1a1a1a]/5 pointer-events-none">
                    <ShieldAlert size={400} />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] text-[#97cd7a] text-[10px] font-black uppercase tracking-[0.2em] border-2 border-[#1a1a1a] shadow-[0_2px_0_0_rgba(26,26,26,0.1)] rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-[#97cd7a] animate-pulse"></span>
                            {t('admin.console')}
                        </div>
                        <div className="px-3 py-1 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] text-[9px] font-black uppercase tracking-widest flex items-center gap-2 rounded-lg">
                            <RefreshCw size={10} className="animate-spin duration-[4000ms]" />
                            {t('admin.realTimeMonitoring')}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-[0.85] mb-2">
                        {t('admin.title').split(' ').map((word, i) => (
                            <React.Fragment key={i}>
                                {word} {i === 1 && <br className="hidden md:block" />}
                            </React.Fragment>
                        ))}
                    </h1>
                    <p className="text-xs md:text-base font-bold text-black/60 uppercase tracking-widest max-w-xl">
                        {t('admin.subtitle')}
                    </p>
                </div>
            </div>

            {/* Main KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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
                    color="#97cd7a"
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: List of Latest Users */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border-2 border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] flex flex-col rounded-[32px] overflow-hidden">
                        <div className="p-6 border-b-2 border-black/5 bg-[#fafafa] flex justify-between items-center">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-black/60">{t('admin.newExplorers')}</h2>
                            <div className="text-[10px] font-black bg-[#97cd7a] text-black px-2 py-0.5 rounded-lg">{t('admin.featuredRecords')}</div>
                        </div>
                        <div className="divide-y-2 divide-black/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {stats.latestUsers?.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => openUser(u)}
                                    className="p-4 flex items-center justify-between hover:bg-[#f6f6f6] cursor-pointer transition-all active:translate-y-1 active:shadow-none group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center font-black text-lg rounded-xl overflow-hidden shrink-0 ${u.plan_type !== 'free' ? 'bg-white' : 'bg-white'}`}>
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} className="w-full h-full object-cover" alt={u.username} />
                                            ) : (
                                                u.username?.[0]?.toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 line-clamp-1">
                                                <h3 className="text-xs font-black uppercase tracking-tight">{u.name || u.username}</h3>
                                                {u.is_verified && <img src="/icons/icons8-verificado-48.png" className="w-4 h-4 ml-0.5 object-contain" alt="Verified" loading="lazy" decoding="async" />}
                                            </div>
                                            <p className="text-[10px] font-bold text-black/40 uppercase line-clamp-1">@{u.username} • {u.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[8px] font-black py-0.5 px-2 mb-1 inline-block border border-[#1a1a1a] rounded-md ${u.plan_type !== 'free' ? 'bg-[#97cd7a] text-black' : 'bg-slate-100 text-black/40'}`}>
                                            {translatePlan(u.plan_type, t)}
                                        </div>
                                        <p className="text-[9px] font-bold text-black/30 uppercase">
                                            {new Date(u.created_at).toLocaleDateString(t('common.locale', { defaultValue: 'pt-BR' }))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Platform Assets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white border-2 border-[#1a1a1a] p-8 shadow-[0_6px_0_0_#1a1a1a] rounded-[32px]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">{t('admin.contentInventory')}</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-4xl font-black">{stats.summary?.totalLinks || 0}</span>
                                    <p className="text-[10px] font-black uppercase">{t('admin.activeLinks')}</p>
                                </div>
                                <div className="h-12 w-[2px] bg-[#1a1a1a]/10"></div>
                                <div>
                                    <span className="text-4xl font-black">{stats.summary?.totalProducts || 0}</span>
                                    <p className="text-[10px] font-black uppercase">{t('admin.products')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border-2 border-[#1a1a1a] p-6 shadow-[0_6px_0_0_rgba(255,102,178,1)] rounded-[32px]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">{t('admin.realTimeMonitoring')}</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-4xl font-black">{stats.summary?.totalClicks || 0}</span>
                                    <p className="text-[10px] font-black uppercase">{t('admin.clicks')}</p>
                                </div>
                                <div className="h-12 w-[2px] bg-[#1a1a1a]/10"></div>
                                <div>
                                    <span className="text-4xl font-black">{stats.summary?.totalViews || 0}</span>
                                    <p className="text-[10px] font-black uppercase">{t('admin.views')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Growth & Charts */}
                <div className="space-y-6">
                    <div className="bg-[#e6b3ff] border-2 border-[#1a1a1a] p-6 shadow-[0_6px_0_0_#1a1a1a] rounded-[32px]">
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
                                <div className="p-2 bg-[#1a1a1a] text-[#e6b3ff] rounded-xl">
                                    <RefreshCw size={24} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-[#1a1a1a] p-6 shadow-[0_6px_0_0_#1a1a1a] rounded-[32px]">
                        <h2 className="text-xs font-black uppercase tracking-widest mb-4">{t('admin.systemHealth')}</h2>
                        <div className="space-y-3">
                            <StatusIndicator label="API Engine" status="ONLINE" />
                            <StatusIndicator label="DB Supabase" status="LATENCY OK" />
                            <StatusIndicator label="Stripe Node" status="READY" />
                        </div>
                    </div>
                </div>
            </div>

            {/* User Detail Management Engine */}
            {createPortal(
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
                                    ${isMobile ? 'h-[95vh] rounded-none' : 'max-w-[700px] h-[750px] rounded-[40px]'}
                                `}
                            >                                 {/* BRUTALIST HEADER */}
                                 <div className="bg-white border-b-2 border-[#1a1a1a] p-6 md:p-8 rounded-t-[40px] flex flex-row items-center justify-between shrink-0 relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-[6px] bg-[#ffdf00]" />
                                     
                                     <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full">
                                         <div className="relative shrink-0">
                                             <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-[#1a1a1a] bg-white shadow-[0_4px_0_0_#1a1a1a] rounded-2xl overflow-hidden relative z-10">
                                                 {selectedUser.avatar_url ? (
                                                     <img src={selectedUser.avatar_url} className="w-full h-full object-cover" alt={selectedUser.username} />
                                                 ) : (
                                                     <div className="w-full h-full flex items-center justify-center font-black text-2xl text-black/5 bg-slate-50 uppercase">
                                                         {selectedUser.username?.[0]}
                                                     </div>
                                                 )}
                                             </div>
                                         </div>

                                         <div className="flex-1 min-w-0 space-y-1">
                                             <div className="flex items-center gap-3">
                                                 <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-black truncate">{selectedUser.name || selectedUser.username}</h2>
                                                 <div className="flex gap-1">
                                                     {selectedUser.is_verified && <Check size={14} className="text-[#97cd7a] p-0.5 border border-black rounded" strokeWidth={4} />}
                                                     <div className="w-2 h-2 rounded-full bg-[#97cd7a] self-center" />
                                                 </div>
                                             </div>
                                             <p className="text-[10px] font-black uppercase text-black/40 tracking-widest truncate">@{selectedUser.username} • {selectedUser.email}</p>
                                             <div className="flex gap-2 pt-1">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); window.open(`/${selectedUser.username}`, '_blank'); }}
                                                    className="px-3 py-1 bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all"
                                                >
                                                    View
                                                </button>
                                                <div className="px-3 py-1 bg-white border-2 border-[#1a1a1a] text-[8px] font-black uppercase tracking-widest rounded-lg">
                                                    {translatePlan(selectedUser.plan_type, t)}
                                                </div>
                                             </div>
                                         </div>

                                         <button 
                                             onClick={() => setSelectedUser(null)} 
                                             className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] hover:bg-black hover:text-white transition-all rounded-xl active:scale-95 shrink-0"
                                         >
                                             <X size={20} strokeWidth={4} />
                                         </button>
                                     </div>
                                 </div>


                                {/* BRUTALIST TABS */}
                                <div className="flex bg-[#fafafa] border-b-2 border-[#1a1a1a] px-8 md:px-10 shrink-0">
                                    {[
                                        { id: 'overview', label: t('admin.overview'), icon: <PieChart size={14} />, color: '#66ccff' },
                                        { id: 'analytics', label: t('admin.analytics'), icon: <BarChart size={14} />, color: '#ff66b2' },
                                        { id: 'manage', label: t('admin.manage'), icon: <Settings size={14} />, color: '#e6b3ff' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`
                                                relative px-8 py-5 text-[11px] font-black uppercase tracking-tight transition-all flex items-center gap-3 group
                                                ${activeTab === tab.id ? 'text-black' : 'text-black/30 hover:text-black hover:bg-black/5'}
                                            `}
                                        >
                                            {activeTab === tab.id && (
                                                <motion.div 
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-[4px] bg-black"
                                                />
                                            )}
                                            {tab.icon}
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                {/* MODULAR CONTENT AREA */}
                                 <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6 custom-scrollbar-brutal scroll-smooth">
                                     <AnimatePresence mode="wait">
                                         <motion.div
                                             key={activeTab}
                                             initial={{ opacity: 0, scale: 0.95 }}
                                             animate={{ opacity: 1, scale: 1 }}
                                             exit={{ opacity: 0, scale: 1.05 }}
                                             transition={{ duration: 0.15 }}
                                             className="max-w-6xl mx-auto h-full"
                                         >                                             {activeTab === 'overview' && (
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                                                     <div className="md:col-span-2">
                                                         <BrutalCard title="About Profile" color="#fff">
                                                            <div className="space-y-4">
                                                                <p className="text-xl font-black uppercase text-black break-words italic">
                                                                    "{selectedUser.bio || 'NO BIO PROVIDED'}"
                                                                </p>
                                                                
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t-2 border-dashed border-black/5">
                                                                    <div className="bg-black/5 p-3 rounded-xl">
                                                                        <span className="text-[8px] font-black text-black/40 uppercase block">Category</span>
                                                                        <span className="text-[10px] font-black uppercase">{selectedUser.user_category || 'PERSONAL'}</span>
                                                                    </div>
                                                                    <div className="bg-black/5 p-3 rounded-xl">
                                                                        <span className="text-[8px] font-black text-black/40 uppercase block">Theme</span>
                                                                        <span className="text-[10px] font-black uppercase">{selectedUser.theme_id || 'DEFAULT'}</span>
                                                                    </div>
                                                                    <div className="bg-black/5 p-3 rounded-xl">
                                                                        <span className="text-[8px] font-black text-black/40 uppercase block">Assets</span>
                                                                        <span className="text-[10px] font-black uppercase">{(selectedUser.links?.[0]?.count || 0) + (selectedUser.products?.[0]?.count || 0)} UNITS</span>
                                                                    </div>
                                                                    <div className="bg-black/5 p-3 rounded-xl">
                                                                        <span className="text-[8px] font-black text-black/40 uppercase block">Status</span>
                                                                        <span className="text-[10px] font-black uppercase text-[#97cd7a]">ACTIVE</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                         </BrutalCard>
                                                     </div>

                                                     <div className="md:col-span-1">
                                                         <BrutalMetric label="Total Views" value={selectedUser.views || 0} color="#66ccff" icon={<Eye size={24} />} />
                                                     </div>
                                                     <div className="md:col-span-1">
                                                         <BrutalMetric label="Total Clicks" value={selectedUser.clicks?.[0]?.count || 0} color="#ff66b2" icon={<MousePointerClick size={24} />} />
                                                     </div>
                                                     <div className="md:col-span-2">
                                                         <div className="bg-[#1a1a1a] border-2 border-[#1a1a1a] p-6 shadow-[0_4px_0_0_#000] rounded-[32px] text-white flex justify-between items-center group overflow-hidden relative">
                                                            <div className="relative z-10">
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#97cd7a] mb-1">Efficiency Ratio</h4>
                                                                <span className="text-4xl font-black italic">{Math.round(((selectedUser.clicks?.[0]?.count || 0) / (selectedUser.views || 1)) * 100)}% <span className="text-[10px] font-black uppercase opacity-40">CTR</span></span>
                                                            </div>
                                                            <div className="relative z-10 text-right">
                                                                <div className="text-[8px] font-black uppercase px-2 py-1 bg-[#97cd7a] text-black rounded mb-2">Stable Growth</div>
                                                                <div className="flex gap-1 justify-end">
                                                                    {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-4 bg-white/20 rounded-full" style={{ height: `${20 + Math.random() * 20}px` }} />)}
                                                                </div>
                                                            </div>
                                                            <TrendingUp size={100} className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" />
                                                         </div>
                                                     </div>
                                                 </div>
                                             )}

                                             {activeTab === 'analytics' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                                                    <BrutalCard title="Platform Breakdown" color="#66ccff">
                                                        <div className="space-y-6">
                                                            <BrutalProgressBar label="Desktop Traffic" percentage={45} color="#000" />
                                                            <BrutalProgressBar label="Mobile Traffic" percentage={55} color="#ff66b2" />
                                                            <BrutalProgressBar label="Other" percentage={2} color="#97cd7a" />
                                                        </div>
                                                    </BrutalCard>
                                                    <BrutalCard title="Referral Sources" color="#ff66b2">
                                                        <div className="space-y-4">
                                                            {['Instagram', 'TikTok', 'Direct', 'Other'].map((source, i) => (
                                                                <div key={source} className="flex justify-between items-center bg-black/5 p-4 border-[3px] border-black">
                                                                    <span className="font-black uppercase tracking-widest">{source}</span>
                                                                    <span className="font-black text-2xl">{[65, 20, 10, 5][i]}%</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </BrutalCard>
                                                    <BrutalCard title="Engagement Chronology" color="#fff" className="md:col-span-2">
                                                        <div className="h-48 w-full border-[4px] border-black bg-slate-100 relative flex items-end gap-2 p-2">
                                                            {[40, 70, 45, 90, 65, 30, 85, 40, 55, 95, 20, 60, 40, 75, 50, 80, 45, 70].map((h, i) => (
                                                                <div key={i} className="flex-1 bg-black border-[2px] border-black hover:bg-white transition-colors" style={{ height: `${h}%` }} />
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 flex justify-between text-[10px] font-black uppercase">
                                                            <span>00:00h</span>
                                                            <span>12:00h</span>
                                                            <span>23:59h</span>
                                                        </div>
                                                    </BrutalCard>
                                                </div>
                                             )}


                                            {activeTab === 'manage' && (
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">
                                                     <div className="md:col-span-12">
                                                         <div className="bg-white border-2 border-[#1a1a1a] p-6 shadow-[0_4px_0_0_#1a1a1a] rounded-3xl flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <h3 className="text-xl font-black uppercase tracking-tighter italic text-black">Admin Controls</h3>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-black/30 text-nowrap">Manage user hierarchy & status</p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleVerification(); }}
                                                                disabled={isUpdating}
                                                                className={`px-4 py-2 border-2 border-[#1a1a1a] font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_3px_0_0_#1a1a1a] active:translate-y-1 active:shadow-none rounded-xl flex items-center gap-2 ${selectedUser.is_verified ? 'bg-white text-black' : 'bg-black text-[#97cd7a]'}`}
                                                            >
                                                                {selectedUser.is_verified ? 'REVOKE' : 'VERIFY'}
                                                            </button>
                                                         </div>
                                                     </div>

                                                     <div className="md:col-span-7">
                                                         <BrutalCard title="Plan Configuration" color="#fff">
                                                             <div className="space-y-6">
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    {['free', 'monthly', 'annual'].map((type) => (
                                                                        <button
                                                                            key={type}
                                                                            onClick={() => setEditPlan({ ...editPlan!, type })}
                                                                            className={`
                                                                                p-4 text-[10px] font-black uppercase tracking-widest border-2 border-[#1a1a1a] transition-all flex flex-col items-center gap-3 rounded-2xl
                                                                                ${editPlan?.type === type ? 'bg-[#ffdf00] shadow-[0_4px_0_0_#1a1a1a] -translate-y-1' : 'bg-white hover:bg-black/5'}
                                                                            `}
                                                                        >
                                                                            <Crown size={18} className={editPlan?.type === type ? 'text-black' : 'text-black/10'} />
                                                                            {type}
                                                                            {editPlan?.type === type && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                <div className="bg-slate-50 border-2 border-[#1a1a1a] p-6 rounded-2xl space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                                                                    <div className="flex justify-between items-center">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 italic">Cycle Expiration</label>
                                                                        {editPlan?.expiry && <span className="text-[10px] font-black text-[#97cd7a] uppercase tracking-widest">Expires {new Date(editPlan.expiry).toLocaleDateString()}</span>}
                                                                    </div>
                                                                    <input 
                                                                        type="date"
                                                                        value={editPlan?.expiry}
                                                                        onChange={(e) => setEditPlan({ ...editPlan!, expiry: e.target.value })}
                                                                        className="w-full bg-white border-2 border-[#1a1a1a] p-4 text-xs font-black uppercase focus:outline-none rounded-xl"
                                                                    />
                                                                    <div className="flex gap-3">
                                                                        <button onClick={() => {
                                                                            const d = new Date(); d.setDate(d.getDate() + 30);
                                                                            if (editPlan) setEditPlan({ ...editPlan, expiry: d.toISOString().substring(0, 10) });
                                                                        }} className="flex-1 py-3 bg-black text-white font-black uppercase text-[9px] tracking-widest border-2 border-[#1a1a1a] hover:bg-white hover:text-black transition-colors rounded-xl shadow-[0_3px_0_0_#000]">+30 DAYS</button>
                                                                        <button onClick={() => {
                                                                            const d = new Date(); d.setFullYear(d.getFullYear() + 1);
                                                                            if (editPlan) setEditPlan({ ...editPlan, expiry: d.toISOString().substring(0, 10) });
                                                                        }} className="flex-1 py-3 bg-[#ffdf00] text-black font-black uppercase text-[9px] tracking-widest border-2 border-[#1a1a1a] hover:bg-white transition-colors rounded-xl shadow-[0_3px_0_0_#000]">+1 YEAR</button>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleUpdatePlan(); }}
                                                                    disabled={isUpdating}
                                                                    className="w-full py-5 bg-[#97cd7a] text-black font-black uppercase text-xs tracking-[0.2em] border-2 border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-1 transition-all active:scale-95 rounded-2xl"
                                                                >
                                                                    {isUpdating ? 'SYNCING DATA...' : 'APPLY_CHANGES_&_SYNC'}
                                                                </button>
                                                             </div>
                                                         </BrutalCard>
                                                     </div>

                                                     <div className="md:col-span-5">
                                                        <div className="bg-red-50 border-2 border-[#1a1a1a] p-8 shadow-[0_8px_0_0_#ff3333] rounded-[32px] h-full flex flex-col justify-between">
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-3 text-red-600">
                                                                    <ShieldAlert size={28} />
                                                                    <h4 className="text-xl font-black uppercase tracking-tighter italic">Danger Zone</h4>
                                                                </div>
                                                                <p className="text-[10px] font-bold uppercase leading-relaxed text-black/50">Permament removal of all user assets and intelligence records. This action is irreversible.</p>
                                                            </div>

                                                            {!deleteConfirm ? (
                                                                <button 
                                                                    onClick={() => setDeleteConfirm(true)}
                                                                    className="w-full py-4 bg-white border-2 border-[#1a1a1a] text-red-600 font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-[0_4px_0_0_#1a1a1a] rounded-xl mt-8"
                                                                >
                                                                    PURGE_SYSTEM_USER
                                                                </button>
                                                            ) : (
                                                                <div className="bg-white border-2 border-[#1a1a1a] p-5 space-y-5 shadow-[0_6px_0_0_rgba(0,0,0,0.1)] rounded-2xl mt-6">
                                                                    <div className="space-y-2 text-center">
                                                                        <p className="text-[9px] font-black uppercase text-red-600">VERIFICATION_CODE_REQUIRED</p>
                                                                        <p className="text-[8px] font-bold uppercase opacity-40">TYPE 'DELETE' TO CONFIRM</p>
                                                                        <input
                                                                            type="text"
                                                                            value={deleteInput}
                                                                            onChange={(e) => setDeleteInput(e.target.value)}
                                                                            placeholder="PASSWORD"
                                                                            className="w-full bg-slate-50 border-2 border-[#1a1a1a] p-3 text-center text-sm font-black outline-none rounded-xl"
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(); }}
                                                                            disabled={isUpdating || deleteInput.trim().toUpperCase() !== 'DELETE'}
                                                                            className={`flex-1 py-3 font-black uppercase border-2 border-[#1a1a1a] rounded-xl text-[9px] ${deleteInput.trim().toUpperCase() === 'DELETE' ? 'bg-red-600 text-white shadow-[0_3px_0_0_#000]' : 'bg-slate-200 text-black/20'}`}
                                                                        >
                                                                            PURGE
                                                                        </button>
                                                                        <button onClick={() => { setDeleteConfirm(false); setDeleteInput(''); }} className="flex-1 py-3 bg-white border-2 border-[#1a1a1a] font-black uppercase text-[9px] hover:bg-black hover:text-white transition-colors rounded-xl shadow-[0_3px_0_0_#000]">ABORT</button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                     </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
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

function VisualRow({ label, value, icon, color, onClick }: any) {
    return (
        <div 
            onClick={onClick}
            className={`flex items-center justify-between p-4 bg-[#fafafa] border-2 border-[#1a1a1a] rounded-2xl transition-all duration-300 group shadow-[0_4px_0_0_#1a1a1a] ${onClick ? 'cursor-pointer hover:bg-white hover:shadow-none hover:translate-y-1' : ''}`}
        >
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl border border-black/5 shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: color + '20', color: color }}>
                    {React.cloneElement(icon as any, { size: 16, strokeWidth: 2.5 })}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 group-hover:text-black/50 transition-colors">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[11px] font-black uppercase tracking-tight">{value}</span>
                {onClick && <ExternalLink size={10} className="text-black/20 group-hover:text-[#66ccff] transition-colors" />}
            </div>
        </div>
    );
}

function KPIBox({ label, value, icon, color, sublabel }: any) {
    return (
        <div className="bg-white border-2 border-[#1a1a1a] p-7 rounded-[32px] shadow-[0_6px_0_0_#1a1a1a] flex flex-col relative overflow-hidden group hover:translate-y-1 hover:shadow-none transition-all duration-300">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-3.5 rounded-2xl border border-white/10 shadow-[0_3px_0_0_#1a1a1a] transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110" style={{ backgroundColor: color }}>
                    {React.cloneElement(icon as any, { size: 24, strokeWidth: 3, className: 'text-white' })}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20 leading-none mb-1">Status</span>
                    <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#97cd7a] animate-pulse" /><span className="text-[8px] font-black uppercase text-[#97cd7a] tracking-widest">Active</span></div>
                </div>
            </div>
            <div className="relative z-10 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tighter tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                    <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">{sublabel}</span>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-black/[0.02] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-1000" />
        </div>
    );
}

function AnalyticsRing({ label, value, color, icon }: any) {
    const percentage = parseFloat(value) || 0;
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * Math.max(percentage, percentage > 0 ? 2 : 0) / 100);

    return (
        <div className="flex flex-col items-center group cursor-default">
            <div className="w-28 h-28 md:w-32 md:h-32 relative flex items-center justify-center mb-6 transition-all duration-700 group-hover:scale-110">
                <svg className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.05)]">
                    <circle 
                        cx="50%" cy="50%" r={radius} 
                        fill="transparent" 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="10" 
                    />
                    <motion.circle 
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 2.5, ease: [0.34, 1.56, 0.64, 1] }}
                        cx="50%" cy="50%" r={radius} 
                        fill="transparent" 
                        stroke={color} 
                        strokeWidth="12" 
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
                    />
                </svg>
                <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-full w-14 h-14 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                    <div className="text-white opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500">
                        {React.cloneElement(icon as any, { size: 24, strokeWidth: 2.5 })}
                    </div>
                </div>
            </div>
            <div className="text-center space-y-2">
                <span className="block text-[10px] font-black uppercase text-[#1a1a1a]/30 tracking-[0.4em] mb-1 group-hover:text-black transition-colors">{label}</span>
                <span className="text-4xl font-black text-black tracking-tighter tabular-nums leading-none">{value}</span>
            </div>
        </div>
    );
}

function TrafficRow({ label, value, progress, color }: any) {
    return (
        <div className="group space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: color }} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black/50">{label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tabular-nums">{value}</span>
                    <span className="text-[9px] font-bold text-black/20 uppercase">Yield</span>
                </div>
            </div>
            <div className="h-4 w-full bg-[#fafafa] border border-black/5 rounded-full overflow-hidden p-1 shadow-inner relative group-hover:border-black/5 transition-all">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}40` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
                </motion.div>
            </div>
        </div>
    );
}

function AssetStat({ label, value, icon, color }: any) {
    return (
        <div className="p-8 bg-white border-2 border-[#1a1a1a] rounded-[32px] flex flex-col gap-6 group hover:translate-y-1 hover:shadow-none transition-all duration-500 shadow-[0_6px_0_0_#1a1a1a]">
            <div className="flex items-center justify-between">
                <div className="p-4 rounded-[20px] border border-black/5 shadow-lg transition-transform group-hover:rotate-12 group-hover:scale-110" style={{ backgroundColor: color, color: '#fff' }}>
                    {React.cloneElement(icon as any, { size: 28, strokeWidth: 3 })}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-black/5 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-[#97cd7a] animate-pulse" /><span className="text-[8px] font-black uppercase text-black/40">Verified</span></div>
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-black uppercase text-black/30 tracking-[0.2em]">{label}</p>
                <p className="text-4xl font-black tabular-nums tracking-tighter leading-none">{value.toLocaleString()}</p>
            </div>
        </div>
    );
}

function ContentTypeBar({ label, percentage, color }: any) {
    return (
        <div className="group space-y-4">
            <div className="flex justify-between items-end px-1">
                <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">{label}</span>
                    <div className="h-0.5 w-0 group-hover:w-full bg-white/10 transition-all duration-700" />
                </div>
                <span className="text-lg font-black tabular-nums text-white group-hover:text-[#ffdf00] transition-colors">{percentage}%</span>
            </div>
            <div className="h-6 w-full bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden flex p-1.5 shadow-inner">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 2, ease: "circOut" }}
                    className="h-full rounded-xl relative group-hover:brightness-110 transition-all"
                    style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                </motion.div>
            </div>
        </div>
    );
}

function InfoCard({ label, value, icon, onCopy, isCopied }: any) {
    const { t } = useTranslation();
    return (
        <div className="bg-white border-2 border-black/5 p-4 rounded-2xl shadow-[0_2px_0_0_rgba(26,26,26,0.1)] hover:shadow-none transition-all group">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase text-black/30 flex items-center gap-2">
                    {React.cloneElement(icon as any, { size: 12 })}
                    {label}
                </span>
                <button
                    onClick={onCopy}
                    className="p-1.5 bg-slate-50 border border-black/5 rounded-lg hover:bg-black hover:text-white transition-all shadow-sm"
                    title="Copiar para área de transferência"
                >
                    {isCopied ? <Check size={12} className="text-[#97cd7a]" /> : <Copy size={12} />}
                </button>
            </div>
            <p className="text-sm font-black text-black truncate">{value}</p>
            {isCopied && (
                <div className="absolute -top-10 right-0 bg-black text-white text-[9px] font-black px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl animate-in zoom-in-50">
                    {t('common.copied').toUpperCase()}!
                </div>
            )}
        </div>
    );
}
function GrowthLine({ label, value, percentage }: any) {
    return (
        <div className="flex items-center justify-between group">
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight tabular-nums">{value.toLocaleString()}</span>
                    <span className="text-[10px] font-black text-[#1a1a1a]/30 uppercase">Users</span>
                </div>
            </div>
            <div className="text-right">
                <div className="px-3 py-1 bg-black/5 rounded-lg border border-black/5 group-hover:bg-[#97cd7a] group-hover:text-black transition-all">
                    <span className="text-[11px] font-black tabular-nums">+{percentage}%</span>
                </div>
            </div>
        </div>
    );
}

function StatusIndicator({ label, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white border-2 border-[#1a1a1a] rounded-2xl group hover:shadow-none transition-all shadow-[0_4px_0_0_#1a1a1a]">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#97cd7a] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{label}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#97cd7a]">{status}</span>
        </div>
    );
}

function Grid({ size, className, strokeWidth }: any) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={strokeWidth || 2} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
    );
}

function BrutalCard({ title, children, color = '#fff', textColor = '#000', className = '' }: any) {
    return (
        <div className={`border-2 border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] rounded-[32px] overflow-hidden flex flex-col ${className}`} style={{ backgroundColor: color }}>
            {title && (
                <div className="border-b-2 border-black/5 p-4 flex items-center justify-between bg-[#fafafa]">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/60">{title}</h4>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-black/5" />
                        <div className="w-2.5 h-2.5 rounded-full bg-black/5" />
                    </div>
                </div>
            )}
            <div className="p-6 md:p-8 flex-1" style={{ color: textColor }}>
                {children}
            </div>
        </div>
    );
}

function BrutalMetric({ label, value, color, icon }: any) {
    return (
        <div className="border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] p-6 flex flex-col gap-2 relative overflow-hidden group rounded-[32px] bg-white hover:shadow-none hover:translate-y-0.5 transition-all" style={{ backgroundColor: color }}>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 relative z-10">{label}</span>
            <span className="text-4xl font-black tracking-tighter tabular-nums text-black relative z-10">{value}</span>
        </div>
    );
}

function BrutalProgressBar({ label, percentage, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
                <span className="text-[11px] font-bold uppercase text-black/50">{label}</span>
                <span className="text-xl font-black">{percentage}%</span>
            </div>
            <div className="h-6 w-full border-2 border-black/5 bg-white p-1 rounded-full overflow-hidden shadow-sm">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
}
