import React, { useEffect, useState } from 'react';
import {
    Activity,
    MousePointer,
    TrendingUp,
    Calendar,
    ExternalLink,
    ChevronRight,
    ArrowUpRight,
    Users,
    Smartphone,
    Monitor,
    Zap,
    Download
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
                    <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Calculando Métricas</span>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="w-full p-12 bg-red-50 rounded-[32px] border border-red-100 text-center">
                <Activity size={40} className="mx-auto text-red-400 mb-4" />
                <h3 className="text-lg font-bold text-red-800">Ops! Erro ao carregar dados</h3>
                <p className="text-sm text-red-600/80 mt-1">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (!summary) return (
        <div className="w-full h-96 flex items-center justify-center text-slate-400 italic font-medium">
            Nenhum dado disponível no momento.
        </div>
    );

    // Flatten links for metadata
    const linkMap = new Map(links.map(l => [l.id, l]));
    links.forEach(l => {
        if (l.children) l.children.forEach(c => linkMap.set(c.id, c));
    });

    const enrichedTopLinks = summary.topLinks.map(stat => ({
        ...stat,
        metadata: linkMap.get(stat.id)
    })).filter(l => l.metadata);

    const maxDaily = Math.max(...summary.dailyData.map(d => d.views), 10);

    return (
        <div className="space-y-8 animate-fade-in w-full pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em]">Live Insights</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Performance <span className="text-slate-400">Geral</span>
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-600">
                        <Calendar size={14} className="text-brand-500" />
                        <span>Últimos 14 dias</span>
                    </div>
                    <button className="p-2.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/10">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Página Visualizada"
                    value={summary.totalViews.toLocaleString()}
                    trend="+12.5%"
                    icon={Activity}
                    color="brand"
                    data={summary.dailyData.map(d => d.views)}
                />
                <MetricCard
                    label="Total de Cliques"
                    value={summary.totalClicks.toLocaleString()}
                    trend="+8.2%"
                    icon={MousePointer}
                    color="blue"
                    data={summary.dailyData.map(d => d.clicks)}
                />
                <MetricCard
                    label="Taxa de Conversão"
                    value={`${summary.ctr.toFixed(1)}%`}
                    trend="+2.1%"
                    icon={TrendingUp}
                    color="purple"
                    data={summary.dailyData.map(d => (d.views > 0 ? (d.clicks / d.views) * 100 : 0))}
                />
            </div>

            {/* Engagement Graph */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-8 lg:p-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Engajamento Diário</h3>
                        <p className="text-sm text-slate-400 font-medium">Visualizações vs Cliques por dia</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-brand-500"></span>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Cliques</span>
                        </div>
                    </div>
                </div>

                <div className="h-64 w-full relative group">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        {/* Views Path */}
                        <path
                            d={createPath(summary.dailyData.map(d => d.views), maxDaily, true)}
                            fill="url(#viewsGradient)"
                            className="opacity-20"
                        />
                        <path
                            d={createPath(summary.dailyData.map(d => d.views), maxDaily)}
                            fill="none"
                            stroke="#acc8a2"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                        />

                        {/* Clicks Path */}
                        <path
                            d={createPath(summary.dailyData.map(d => d.clicks), maxDaily)}
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="2.5"
                            strokeDasharray="0 0"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <defs>
                            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#acc8a2" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#acc8a2" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Data Points */}
                        {summary.dailyData.map((d, i) => (
                            <g key={i} className="cursor-pointer">
                                <rect
                                    x={i * (100 / 13) - 2}
                                    y="0"
                                    width="4"
                                    height="100"
                                    fill="transparent"
                                    className="hover:fill-slate-50/50"
                                />
                            </g>
                        ))}
                    </svg>

                    {/* X Axis Mock Labels */}
                    <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-1">
                        {summary.dailyData.filter((_, i) => i % 3 === 0).map((d, i) => (
                            <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Performing Links */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900">Links de Elite</h3>
                        <Zap size={20} className="text-brand-500" fill="currentColor" />
                    </div>

                    {enrichedTopLinks.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-30">
                            <Activity size={40} className="mb-4" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">Aguardando interações</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {enrichedTopLinks.map((link, i) => (
                                <div key={link.id} className="flex items-center gap-4 p-4 rounded-[20px] bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-brand-600 transition-colors">
                                        0{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-sm truncate">{link.metadata?.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{link.metadata?.url}</span>
                                            <ExternalLink size={10} className="text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="block text-lg font-black text-slate-900 leading-none">{link.clicks}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliques</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Device Distribution Mock */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-8">Dispositivos</h3>

                    <div className="space-y-10 py-6">
                        <DeviceBar label="Mobile" percentage={84} icon={Smartphone} color="brand" />
                        <DeviceBar label="Desktop" percentage={14} icon={Monitor} color="slate" />
                        <DeviceBar label="Outros" percentage={2} icon={Users} color="slate" />
                    </div>

                    <div className="mt-12 p-6 bg-brand-50 rounded-2xl border border-brand-100">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-200">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-900 text-sm">Insight do Dia</h4>
                                <p className="text-xs text-brand-700/80 mt-1 font-medium leading-relaxed">
                                    Seu público é massivamente mobile. Considere usar links de "Elite" com layouts de grade para melhor visibilidade em telas pequenas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, trend, icon: Icon, color, data }: any) {
    const colorClass = color === 'brand' ? 'bg-brand-50 text-brand-600' :
        color === 'blue' ? 'bg-blue-50 text-blue-500' :
            'bg-purple-50 text-purple-500';

    const strokeColor = color === 'brand' ? '#acc8a2' :
        color === 'blue' ? '#60a5fa' :
            '#a78bfa';

    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-8">
                <div className={`p-4 rounded-2xl ${colorClass} transition-transform group-hover:scale-110 duration-500`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                    <ArrowUpRight size={12} strokeWidth={3} />
                    {trend}
                </div>
            </div>

            <div className="flex items-end justify-between gap-4">
                <div>
                    <span className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{label}</span>
                    <span className="block text-4xl font-black text-slate-900 tracking-tight leading-none">{value}</span>
                </div>

                {/* Mini Sparkline */}
                <div className="w-20 h-10 shrink-0">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path
                            d={createPath(data, Math.max(...data, 10))}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}

function DeviceBar({ label, percentage, icon: Icon, color }: any) {
    const colorClass = color === 'brand' ? 'bg-brand-500' : 'bg-slate-200';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <Icon size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{label}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// Utility to create SVG path from data points
function createPath(data: number[], max: number, close: boolean = false): string {
    if (!data.length) return "";

    const points = data.map((val, i) => {
        const x = i * (100 / (data.length - 1));
        const y = 100 - (val / max) * 90 - 5; // 5% padding
        return `${x},${y}`;
    });

    let path = `M ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
        const [prevX, prevY] = points[i - 1].split(',').map(Number);
        const [currX, currY] = points[i].split(',').map(Number);

        // Simple cubic bezier smoothing
        const cp1x = prevX + (currX - prevX) / 2;
        path += ` C ${cp1x},${prevY} ${cp1x},${currY} ${currX},${currY}`;
    }

    if (close) {
        path += ` L 100,100 L 0,100 Z`;
    }

    return path;
}
