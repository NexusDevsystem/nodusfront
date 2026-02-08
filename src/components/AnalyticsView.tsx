import React, { useEffect, useState } from 'react';
import {
    Activity,
    MousePointer,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Zap,
    Filter,
    ArrowRight
} from 'lucide-react';
import { LinkItem } from '../types';
import { apiClient } from '../services/apiClient';

interface AnalyticsSummary {
    totalViews: number;
    totalClicks: number;
    ctr: number;
    dailyData: Array<{ date: string; views: number; clicks: number }>;
    topLinks: Array<{ id: string; clicks: number }>;
}

export default function AnalyticsView() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [analyticsData, linksData] = await Promise.all([
                    apiClient.getAnalytics(),
                    apiClient.getMyLinks()
                ]);
                setSummary(analyticsData);
                setLinks(linksData);
                setError(null);
            } catch (error: any) {
                console.error('Failed to load analytics data:', error);
                setError(error.message || 'Erro ao carregar dados');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-[#acc8a2] rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando dados...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <Activity size={24} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Não foi possível carregar os dados</h3>
                <p className="text-slate-400 text-sm mt-2 mb-6 max-w-xs">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (!summary) return null;

    // Flatten links map for fast lookup
    const linkMap = new Map();
    const processLinks = (items: LinkItem[]) => {
        items.forEach(l => {
            linkMap.set(l.id, l);
            if (l.children) processLinks(l.children);
        });
    };
    processLinks(links);

    const enrichedTopLinks = summary.topLinks
        .map(stat => ({
            ...stat,
            metadata: linkMap.get(stat.id) || { title: 'Link Deletado', url: '#' }
        }))
        .filter(l => l.metadata);

    const maxViews = Math.max(...summary.dailyData.map(d => d.views), 5); // Minimum scale of 5

    return (
        <div className="space-y-8 animate-fade-in w-full pb-20 font-sans">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        Visão Geral
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Acompanhe o desempenho do seu perfil nos últimos 14 dias.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        <span>14 Dias</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                    label="Visualizações Totais"
                    value={summary.totalViews}
                    icon={Activity}
                    trend={summary.totalViews > 0}
                />
                <KpiCard
                    label="Cliques em Links"
                    value={summary.totalClicks}
                    icon={MousePointer}
                    isPrimary
                    trend={summary.totalClicks > 0}
                />
                <KpiCard
                    label="Taxa de Cliques (CTR)"
                    value={summary.ctr.toFixed(1) + '%'}
                    icon={TrendingUp}
                    trend={summary.ctr > 0}
                />
            </div>

            {/* Main Chart Section */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-800">Engajamento</h3>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#acc8a2]"></span>
                            <span className="text-slate-500">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                            <span className="text-slate-500">Cliques</span>
                        </div>
                    </div>
                </div>

                {/* Custom SVG Chart */}
                <div className="h-64 w-full relative">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        {/* Grid Lines */}
                        <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                        <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />

                        {/* Views Area (Green) */}
                        <path
                            d={createPath(summary.dailyData.map(d => d.views), maxViews, true)}
                            fill="url(#greenGradient)"
                            className="opacity-40 transition-all duration-1000 ease-out"
                        />
                        <path
                            d={createPath(summary.dailyData.map(d => d.views), maxViews)}
                            fill="none"
                            stroke="#acc8a2"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-sm transition-all duration-1000 ease-out"
                        />

                        {/* Clicks Line (Black) */}
                        <path
                            d={createPath(summary.dailyData.map(d => d.clicks), maxViews)}
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-md transition-all duration-1000 ease-out delay-150"
                        />

                        <defs>
                            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#acc8a2" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#acc8a2" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Interactive Points Overlay */}
                        {summary.dailyData.map((d, i) => (
                            <g key={i} className="group/point">
                                <rect
                                    x={i * (100 / (summary.dailyData.length - 1)) - 2}
                                    y="0"
                                    width="4"
                                    height="100"
                                    fill="transparent"
                                    className="cursor-pointer"
                                />
                                {/* Tooltip would go here in a more complex implementation */}
                            </g>
                        ))}
                    </svg>

                    {/* Date Labels */}
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {summary.dailyData.filter((_, i) => i % 2 === 0).map((d, i) => (
                            <span key={i}>{new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Links Section */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-800">Links Mais Acessados</h3>
                </div>

                <div className="space-y-4">
                    {enrichedTopLinks.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <Zap size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Ainda não há dados de cliques suficientes.</p>
                        </div>
                    ) : (
                        enrichedTopLinks.map((link, i) => (
                            <div key={link.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-slate-200 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{link.metadata.title}</h4>
                                        <p className="text-[10px] text-slate-400 truncate font-medium">{link.metadata.url}</p>
                                    </div>
                                </div>
                                <div className="text-right pl-4">
                                    <span className="block text-sm font-black text-slate-900">{link.clicks}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cliques</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, icon: Icon, isPrimary, trend }: any) {
    return (
        <div className={`
            p-6 rounded-[24px] border transition-all duration-300
            ${isPrimary
                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10'
                : 'bg-white border-slate-100 text-slate-900 hover:border-[#acc8a2] shadow-sm'}
        `}>
            <div className="flex items-start justify-between mb-6">
                <div className={`
                    p-3 rounded-xl
                    ${isPrimary ? 'bg-white/10' : 'bg-[#acc8a2]/10'}
                `}>
                    <Icon size={20} className={isPrimary ? 'text-white' : 'text-[#acc8a2]'} />
                </div>
                {trend && (
                    <div className={`
                        flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter
                        ${isPrimary ? 'bg-white/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}
                    `}>
                        <ArrowUpRight size={10} strokeWidth={3} />
                        <span>Ativo</span>
                    </div>
                )}
            </div>
            <div>
                <span className={`block text-xs font-bold uppercase tracking-widest mb-1 ${isPrimary ? 'text-slate-400' : 'text-slate-400'}`}>
                    {label}
                </span>
                <span className="block text-3xl font-black tracking-tight">
                    {value.toLocaleString()}
                </span>
            </div>
        </div>
    );
}

// SVG Path Generator
function createPath(data: number[], max: number, close: boolean = false): string {
    if (!data.length) return "";

    const points = data.map((val, i) => {
        const x = i * (100 / (data.length - 1));
        const y = 100 - (val / max) * 80 - 10; // Keeping within 10-90% vertical range
        return `${x},${y}`;
    });

    let path = `M ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
        const [prevX, prevY] = points[i - 1].split(',').map(Number);
        const [currX, currY] = points[i].split(',').map(Number);

        // Cubic bezier for smooth curves
        const cp1x = prevX + (currX - prevX) / 2;
        path += ` C ${cp1x},${prevY} ${cp1x},${currY} ${currX},${currY}`;
    }

    if (close) {
        path += ` L 100,100 L 0,100 Z`;
    }

    return path;
}
