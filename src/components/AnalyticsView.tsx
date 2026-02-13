import React, { useEffect, useState } from 'react';
import {
    Activity,
    MousePointer,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Zap,
    BarChart3,
    ArrowRight,
    MousePointer2
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
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [analyticsData, linksData, productsData] = await Promise.all([
                    apiClient.getAnalytics(),
                    apiClient.getMyLinks(),
                    apiClient.getMyProducts()
                ]);
                setSummary(analyticsData);
                setLinks(linksData);
                // We'll store products in a local map for lookup
                const prodMap = new Map();
                productsData.forEach(p => prodMap.set(p.id, p));
                setProducts(productsData);
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
                    <div className="w-10 h-10 border-2 border-slate-100 border-t-[#32a800] rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Carregando estatísticas...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Activity size={24} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Falha na conexão</h3>
                <p className="text-slate-400 text-xs mt-2 mb-6 max-w-xs">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 border border-slate-200 text-slate-600 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (!summary) return null;

    // Flatten links and products map for fast lookup
    const linkMap = new Map();
    const processLinks = (items: LinkItem[]) => {
        items.forEach(l => {
            linkMap.set(l.id, l);
            if (l.children) processLinks(l.children);
        });
    };
    processLinks(links);

    const productMap = new Map();
    products.forEach(p => productMap.set(p.id, p));

    const enrichedTopLinks = summary.topLinks
        .map(stat => {
            const linkMatch = linkMap.get(stat.id);
            const productMatch = productMap.get(stat.id);

            return {
                ...stat,
                metadata: linkMatch
                    ? { title: linkMatch.title, url: linkMatch.url, type: 'Link' }
                    : productMatch
                        ? { title: productMatch.name, url: productMatch.url, type: 'Produto' }
                        : { title: 'Item Removido', url: '#', type: 'Desconhecido' }
            };
        });

    const maxViews = Math.max(...summary.dailyData.map(d => d.views), 1);

    return (
        <div className="space-y-6 animate-fade-in w-full pb-20 max-w-4xl mx-auto">
            {/* Standard Header Card */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-500">
                        <BarChart3 size={18} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Estatísticas</h3>
                    </div>
                    <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Últimos 14 dias
                    </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                    Acompanhe o desempenho e engajamento do seu perfil em tempo real.
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                    label="Visualizações"
                    value={summary.totalViews}
                    icon={Activity}
                />
                <KpiCard
                    label="Cliques Únicos"
                    value={summary.totalClicks}
                    icon={MousePointer2}
                    isActive
                />
                <KpiCard
                    label="Taxa de Cliques"
                    value={summary.ctr.toFixed(1) + '%'}
                    icon={TrendingUp}
                />
            </div>

            {/* Performance Chart Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Activity size={18} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Desempenho Diário</h3>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#32a800]"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliques</span>
                        </div>
                    </div>
                </div>

                <div className="h-48 w-full relative pt-4">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        {/* Area Gradient (Views) */}
                        <path
                            d={createPath(summary.dailyData.map(d => d.views), maxViews, true)}
                            fill="url(#viewsGradient)"
                            className="opacity-30"
                        />

                        {/* Views Line */}
                        <path
                            d={createPath(summary.dailyData.map(d => d.views), maxViews)}
                            fill="none"
                            stroke="#32a800"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Clicks Line */}
                        <path
                            d={createPath(summary.dailyData.map(d => d.clicks), maxViews)}
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <defs>
                            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#32a800" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#32a800" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="flex justify-between mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {summary.dailyData.filter((_, i) => i % 2 === 0).map((d, i) => (
                            <span key={i}>{new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Links Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <Zap size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Links mais acessados</h3>
                </div>

                <div className="space-y-3">
                    {enrichedTopLinks.length === 0 ? (
                        <div className="py-10 text-center bg-slate-50/50 rounded-md border border-slate-100">
                            <p className="text-xs text-slate-400 font-medium">Aguardando mais dados de engajamento...</p>
                        </div>
                    ) : (
                        enrichedTopLinks.map((link, i) => (
                            <div key={link.id} className="flex items-center justify-between p-4 rounded-md border border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200 transition-all group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-slate-800 truncate">{link.metadata.title}</h4>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ${link.metadata.type === 'Produto' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {link.metadata.type}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 truncate font-medium uppercase tracking-wider">
                                            {link.metadata.url && link.metadata.url !== '#' ? new URL(link.metadata.url).hostname : 'Link Direto'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right pl-4">
                                    <span className="block text-sm font-black text-slate-900">{link.clicks}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cliques</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, icon: Icon, isActive }: any) {
    return (
        <div className={`p-6 rounded-lg border transition-all ${isActive
            ? 'bg-slate-50 border-[#32a800] text-slate-900'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded ${isActive ? 'bg-[#32a800] text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <Icon size={16} />
                </div>
                <TrendingUp size={12} className={isActive ? 'text-[#32a800]' : 'text-slate-300'} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
                <p className="text-2xl font-black tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            </div>
        </div>
    );
}

function createPath(data: number[], max: number, close: boolean = false): string {
    if (!data.length) return "";
    const points = data.map((val, i) => {
        const x = i * (100 / (data.length - 1));
        const y = 100 - (val / (max || 1)) * 80 - 10;
        return `${x},${y}`;
    });
    let path = `M ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
        const [prevX, prevY] = points[i - 1].split(',').map(Number);
        const [currX, currY] = points[i].split(',').map(Number);
        const cp1x = prevX + (currX - prevX) / 2;
        path += ` C ${cp1x},${prevY} ${cp1x},${currY} ${currX},${currY}`;
    }
    if (close) {
        path += ` L 100,100 L 0,100 Z`;
    }
    return path;
}
