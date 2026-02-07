import React, { useEffect, useState } from 'react';
import { Activity, MousePointer, TrendingUp, Calendar, ExternalLink, ArrowUpRight } from 'lucide-react';
import { LinkItem } from '../types';
import { apiClient } from '../services/apiClient';

export default function AnalyticsView() {
    const [isLoading, setIsLoading] = useState(true);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [analytics, setAnalytics] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [linksData, analyticsData] = await Promise.all([
                    apiClient.getMyLinks(),
                    apiClient.getAnalytics()
                ]);
                setLinks(linksData);
                setAnalytics(analyticsData);
            } catch (error) {
                console.error('Failed to load analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Flatten links for easier calculation
    const allLinks = links.reduce((acc: LinkItem[], link) => {
        acc.push(link);
        if (link.children) acc.push(...link.children);
        return acc;
    }, []);

    // Calculate Stats
    const totalClicks = allLinks.reduce((acc, link) => acc + (link.clicks || 0), 0);

    // Simulated Views for Demo (In real app, we'd track page loads)
    const totalViews = Math.round(totalClicks * 1.8) + 42;
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

    // Sort by clicks
    const topLinks = [...allLinks].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* Header */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Visão Geral</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Performance dos seus links nos últimos 30 dias</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 text-xs font-semibold text-slate-600">
                    <Calendar size={14} />
                    <span>Últimos 30 dias</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Visualizações"
                    value={totalViews}
                    icon={Activity}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    trend="+12%"
                />
                <StatCard
                    title="Total de Cliques"
                    value={totalClicks}
                    icon={MousePointer}
                    color="text-green-600"
                    bg="bg-green-50"
                    trend="+5.4%"
                />
                <StatCard
                    title="Click Rate (CTR)"
                    value={`${ctr}%`}
                    icon={TrendingUp}
                    color="text-purple-600"
                    bg="bg-purple-50"
                    trend="+2.1%"
                />
            </div>

            {/* Chart Placeholder (Simulated Bars) */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-lg text-slate-800">Atividade Recente</h3>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-brand-500"></span>
                        <span className="text-xs text-slate-500 font-medium">Cliques</span>
                    </div>
                </div>

                <div className="h-48 flex items-end justify-between gap-2">
                    {[35, 45, 20, 60, 40, 75, 50, 65, 80, 55, 90, 45].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-full relative h-full flex items-end">
                                <div
                                    className="w-full bg-brand-100 rounded-t-sm group-hover:bg-brand-200 transition-colors relative"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h * 2}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {i * 2 + 1}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Links */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800">Top Links</h3>
                    <button className="text-sm text-brand-600 font-semibold hover:text-brand-700">Ver todos</button>
                </div>
                <div>
                    {topLinks.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Nenhum dado ainda.</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {topLinks.map((link, i) => (
                                <div key={link.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 text-sm truncate">{link.title}</h4>
                                        <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 truncate hover:underline flex items-center gap-1">
                                            {link.url} <ExternalLink size={10} />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-slate-800">{link.clicks || 0}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Clicks</span>
                                        </div>
                                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand-500 rounded-full"
                                                style={{ width: `${Math.min(((link.clicks || 0) / Math.max(1, totalClicks)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bg, trend }: any) {
    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                    <Icon size={22} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <ArrowUpRight size={12} />
                    {trend}
                </div>
            </div>
            <div>
                <span className="block text-slate-500 text-sm font-medium mb-1">{title}</span>
                <span className="block text-3xl font-extrabold text-slate-800 tracking-tight">{value}</span>
            </div>
        </div>
    )
}
