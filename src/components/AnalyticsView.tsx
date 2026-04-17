import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Activity,
    MousePointer,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Zap,
    BarChart3,
    ArrowRight,
    MousePointer2,
    Lock,
    Filter,
    PieChart,
    Plus
} from 'lucide-react';
import { LinkItem, UserProfile } from '../types';
import { apiClient } from '../services/apiClient';
import BrutalistLoader from './BrutalistLoader';

interface AnalyticsSummary {
    totalViews: number;
    totalClicks: number;
    ctr: number;
    dailyData: Array<{ date: string; views: number; clicks: number }>;
    topLinks: Array<{ id: string; clicks: number }>;
}

type DateRange = '7d' | '14d' | '30d' | '1y' | 'all';

interface AnalyticsViewProps {
    userProfile: UserProfile;
}

export default function AnalyticsView({ userProfile }: AnalyticsViewProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Default to 7d for free users
    const [dateRange, setDateRange] = useState<DateRange>('7d');

    // Helper to get numeric days
    const getDaysFromRange = (range: DateRange): number => {
        switch (range) {
            case '7d': return 7;
            case '14d': return 14;
            case '30d': return 30;
            case '1y': return 365;
            case 'all': return 0;
            default: return 14;
        }
    };

    const isPro = userProfile.plan_type === 'monthly' || userProfile.plan_type === 'annual';

    const handleRangeChange = (range: DateRange) => {
        if ((range === '14d' || range === '30d' || range === '1y' || range === 'all') && !isPro) {
            // Trigger upgrade modal via window event (standard pattern in this app)
            window.dispatchEvent(new CustomEvent('open-billing-modal'));
            return;
        }
        setDateRange(range);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const days = getDaysFromRange(dateRange);

                const [analyticsData, linksData, productsData] = await Promise.all([
                    apiClient.getAnalytics(days),
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
                setError(error.message || t('common.error'));
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [dateRange]); // Reload when range changes

    if (isLoading) {
        return (
            <div className="w-full h-[70vh] flex items-center justify-center p-6">
                <BrutalistLoader
                    message={t('loading.syncingAnalytics')}
                    progress={75}
                    subtext={t('admin.systemStats')}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] flex items-center justify-center mb-6 rounded-xl">
                    <Activity size={24} strokeWidth={3} className="text-black" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-widest">{t('common.error')}</h3>
                <p className="text-[10px] text-black/50 font-bold uppercase tracking-widest mt-2 mb-8">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-black text-[#ffdf00] border-2 border-[#1a1a1a] text-[10px] font-black uppercase tracking-widest shadow-[0_4px_0_0_#1a1a1a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all rounded-xl"
                >
                    {t('common.reload')}
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
                    ? { title: linkMatch.title, url: linkMatch.url, type: t('links.linkLabel') }
                    : productMatch
                        ? { title: productMatch.name, url: productMatch.url, type: t('links.productLabel') }
                        : { title: t('links.untitled'), url: '#', type: t('common.unknown') }
            };
        });

    const maxViews = Math.max(...summary.dailyData.map(d => d.views), 1);

    const getRangeLabel = () => {
        switch (dateRange) {
            case '7d': return t('analytics.sevenDays');
            case '14d': return `14 ${t('analytics.days')}`;
            case '30d': return t('analytics.thirtyDays');
            case '1y': return t('analytics.oneYear');
            case 'all': return t('analytics.allTime');
            default: return `14 ${t('analytics.days')}`;
        }
    }

    const averageViews = summary.dailyData.length > 0
        ? Math.round(summary.totalViews / summary.dailyData.length)
        : 0;

    const bestDayObj = summary.dailyData.length > 0
        ? summary.dailyData.reduce((prev, current) => (prev.views > current.views) ? prev : current)
        : null;

    const bestDayDate = bestDayObj && bestDayObj.views > 0
        ? new Date(bestDayObj.date).toLocaleDateString(t('common.locale', { defaultValue: 'pt-BR' }), { day: '2-digit', month: 'short' })
        : '--';

    const activeLinksCount = summary.topLinks.length;

    return (
        <div className="space-y-6 animate-fade-in w-full pb-20">
            {/* Standard Header Card */}
            <div className="bg-white p-5 border-2 border-black shadow-[0_4px_0_0_#000] rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-[#1a1a1a]/10 pb-4">
                    <div className="flex items-center gap-2 text-black">
                        <BarChart3 size={16} strokeWidth={4} />
                        <h3 className="text-xs font-black uppercase tracking-widest">{t('sidebar.analytics')}</h3>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] overflow-hidden self-start md:self-auto rounded-xl">
                        {(['7d', '14d', '30d', '1y', 'all'] as DateRange[]).map((range) => {
                            const isLocked = (range === '14d' || range === '30d' || range === '1y' || range === 'all') && !isPro;
                            const isActive = dateRange === range;

                            return (
                                <button
                                    key={range}
                                    onClick={() => handleRangeChange(range)}
                                    className={`
                                        relative px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-r last:border-r-0 border-[#1a1a1a]
                                        ${isActive
                                            ? 'bg-[#ffdf00] text-black'
                                            : 'bg-white text-black hover:bg-slate-50'}
                                        ${isLocked ? 'opacity-80' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {range === '7d' && '7D'}
                                        {range === '14d' && '14D'}
                                        {range === '30d' && '30D'}
                                        {range === '1y' && '1A'}
                                        {range === 'all' && t('analytics.all').toUpperCase()}
                                        {isLocked && <Lock size={8} strokeWidth={3} className="text-[#97cd7a]" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-[10px] text-black font-bold uppercase tracking-widest opacity-60">
                        {t('analytics.tagline')}
                    </p>
                    <div className="px-3 py-1.5 bg-black text-[#ffdf00] border-2 border-black text-[9px] font-black uppercase tracking-widest shadow-[0_3px_0_0_#000] rounded-xl">
                        {getRangeLabel()}
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <KpiCard
                    label={t('analytics.totalViews')}
                    value={summary.totalViews}
                    icon={Activity}
                />
                <KpiCard
                    label={t('links.clicksLabel')}
                    value={summary.totalClicks}
                    icon={MousePointer2}
                    isActive
                />
                <KpiCard
                    label={t('analytics.ctrLabel')}
                    value={summary.ctr.toFixed(1) + '%'}
                    icon={TrendingUp}
                />
                <KpiCard
                    label={t('analytics.dailyAverage')}
                    value={averageViews}
                    icon={BarChart3}
                />
                <KpiCard
                    label={t('analytics.bestDay')}
                    value={bestDayDate}
                    icon={Calendar}
                />
                <KpiCard
                    label={t('analytics.activeLinks')}
                    value={activeLinksCount}
                    icon={Zap}
                />
            </div>

            {/* Performance Chart Section */}
            <div className="bg-white p-5 border-2 border-black shadow-[0_4px_0_0_#000] rounded-xl">
                <div className="flex items-center justify-between mb-8 border-b border-[#1a1a1a]/10 pb-4">
                    <div className="flex items-center gap-2 text-black">
                        <Activity size={16} strokeWidth={4} />
                        <h3 className="text-xs font-black uppercase tracking-widest">{t('analytics.trend')}</h3>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 border border-[#1a1a1a] bg-[#97cd7a]"></div>
                            <span className="text-[9px] font-black text-black uppercase tracking-widest">{t('analytics.views')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 border border-[#1a1a1a] bg-black"></div>
                            <span className="text-[9px] font-black text-black uppercase tracking-widest">{t('analytics.clicks')}</span>
                        </div>
                    </div>
                </div>

                <div className="h-64 w-full relative pt-4 flex flex-col">
                    {summary.dailyData.length > 0 ? (
                        <div className="relative flex-1 flex items-end justify-between gap-0.5 sm:gap-1 w-full pt-4 px-2">
                            {summary.dailyData.map((d, i) => {
                                const maxVal = Math.max(maxViews, 1);
                                const heightViews = `${Math.max((d.views / maxVal) * 100, 1)}%`;

                                return (
                                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer">

                                        {/* Bars Container */}
                                        <div className="relative w-full max-w-[32px] flex flex-col justify-end items-center h-full">
                                            {/* Views Bar */}
                                            <div
                                                className="w-full bg-[#97cd7a] border-2 border-b-0 border-[#1a1a1a] transition-all group-hover:-translate-y-1 absolute bottom-0 flex flex-col justify-end group-hover:bg-[#aef18e] rounded-t-lg"
                                                style={{ height: heightViews }}
                                            >
                                                {/* Clicks Bar Nested (Colors the bottom of the Views bar black natively proportional to clicks/views) */}
                                                <div
                                                    className="w-full bg-black border-t-2 border-[#1a1a1a] rounded-t-md"
                                                    style={{ height: `${(d.clicks / Math.max(d.views, 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-black opacity-20 uppercase tracking-widest">
                            {t('analytics.noDataFound')}
                        </div>
                    )}

                    <div className="flex justify-between mt-4 text-[8px] font-black text-black uppercase tracking-widest border-t-2 border-[#1a1a1a] pt-4">
                        {/* Intelligent date labelling based on range */}
                        {(() => {
                            const data = summary.dailyData;
                            if (data.length <= 7) return data.map((d, i) => <span key={i}>{new Date(d.date).toLocaleDateString(t('common.locale', { defaultValue: 'pt-BR' }), { day: '2-digit', month: 'short' })}</span>);
                            if (data.length <= 14) return data.filter((_, i) => i % 2 === 0).map((d, i) => <span key={i}>{new Date(d.date).toLocaleDateString(t('common.locale', { defaultValue: 'pt-BR' }), { day: '2-digit', month: 'short' })}</span>);
                            if (data.length <= 30) return data.filter((_, i) => i % 5 === 0).map((d, i) => <span key={i}>{new Date(d.date).toLocaleDateString(t('common.locale', { defaultValue: 'pt-BR' }), { day: '2-digit', month: 'short' })}</span>);
                            return data.filter((_, i) => i % 30 === 0).map((d, i) => <span key={i}>{new Date(d.date).toLocaleDateString(t('common.locale', { defaultValue: 'pt-BR' }), { month: 'short', year: '2-digit' })}</span>);
                        })()}
                    </div>
                </div>
            </div>

            {/* Advanced Analytics Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Funil de Conversão */}
                <div className="bg-white p-5 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] flex flex-col rounded-xl">
                    <div className="flex items-center justify-between mb-8 border-b border-[#1a1a1a]/5 pb-4">
                        <div className="flex items-center gap-2 text-black">
                            <Filter size={16} strokeWidth={3} />
                            <h3 className="text-xs font-black uppercase tracking-widest">{t('analytics.retentionFunnel')}</h3>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-4">
                        <div className="w-full relative group">
                            <div className="w-full bg-[#ffdf00] border-2 border-[#1a1a1a] h-12 flex items-center justify-between px-4 shadow-[0_3px_0_0_#1a1a1a] transition-transform group-hover:-translate-y-1 rounded-xl">
                                <span className="text-[10px] font-black text-black uppercase tracking-widest">1. {t('analytics.totalViews')}</span>
                                <span className="text-sm font-black text-black">{summary.totalViews}</span>
                            </div>
                        </div>

                        <div className="flex justify-center w-full">
                            <div className="w-1 h-4 bg-black"></div>
                        </div>

                        <div className="w-full relative flex justify-center group">
                            <div
                                className="bg-black border-2 border-[#1a1a1a] h-12 flex items-center justify-between px-4 shadow-[0_3px_0_0_#1a1a1a] transition-transform group-hover:-translate-y-1 rounded-xl"
                                style={{ width: summary.totalViews > 0 ? `${Math.max((summary.totalClicks / summary.totalViews) * 100, 30)}%` : '100%' }}
                            >
                                <span className="text-[10px] font-black text-white uppercase tracking-widest truncate mr-2">2. {t('analytics.clicks')}</span>
                                <span className="text-sm font-black text-[#ffdf00]">{summary.totalClicks}</span>
                            </div>
                        </div>

                        <div className="flex justify-center w-full">
                            <div className="w-1 h-4 bg-black"></div>
                        </div>

                        <div className="w-full flex justify-center mt-2">
                            <div className="border-2 border-[#1a1a1a] bg-white px-6 py-3 shadow-[0_4px_0_0_#1a1a1a] text-center cursor-default hover:bg-[#ffdf00] hover:text-[#97cd7a] transition-colors group rounded-xl">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 group-hover:text-white mb-1">{t('analytics.conversionRate')}</p>
                                <p className="text-2xl font-black">{summary.ctr.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribuição de Cliques */}
                <div className="bg-white p-5 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] flex flex-col rounded-xl">
                    <div className="flex items-center justify-between mb-8 border-b border-[#1a1a1a]/5 pb-4">
                        <div className="flex items-center gap-2 text-black">
                            <PieChart size={16} strokeWidth={3} />
                            <h3 className="text-xs font-black uppercase tracking-widest">{t('analytics.clickComposition')}</h3>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {summary.totalClicks === 0 ? (
                            <div className="text-center py-8 text-[10px] font-black text-black opacity-20 uppercase tracking-widest border-2 border-dashed border-[#1a1a1a]">
                                {t('analytics.noDataFound')}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Barra Compartilhada */}
                                <div className="h-8 w-full border-2 border-[#1a1a1a] flex shadow-[0_3px_0_0_#1a1a1a] overflow-hidden rounded-xl">
                                    {enrichedTopLinks.slice(0, 3).map((link, i) => {
                                        const percent = (link.clicks / summary.totalClicks) * 100;
                                        const colors = ['bg-[#97cd7a]', 'bg-black', 'bg-slate-300'];
                                        return (
                                            <div
                                                key={link.id}
                                                style={{ width: `${percent}%` }}
                                                className={`h-full ${colors[i % colors.length]} ${i > 0 ? 'border-l-2 border-[#1a1a1a]' : ''} transition-all hover:opacity-80`}
                                                title={`${link.metadata.title}: ${link.clicks} cliques`}
                                            ></div>
                                        )
                                    })}
                                    {/* Restante */}
                                    {(() => {
                                        const top3Clicks = enrichedTopLinks.slice(0, 3).reduce((acc, curr) => acc + curr.clicks, 0);
                                        const remainingClicks = summary.totalClicks - top3Clicks;
                                        if (remainingClicks > 0) {
                                            const percent = (remainingClicks / summary.totalClicks) * 100;
                                            return (
                                                <div
                                                    style={{ width: `${percent}%` }}
                                                    className="h-full bg-white border-l-2 border-[#1a1a1a] pattern-diagonal-lines pattern-black pattern-bg-white pattern-size-2 pattern-opacity-20"
                                                    title={`Outros: ${remainingClicks} cliques`}
                                                ></div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                {/* Legenda */}
                                <div className="space-y-3">
                                    {enrichedTopLinks.slice(0, 3).map((link, i) => {
                                        const percent = ((link.clicks / summary.totalClicks) * 100).toFixed(1);
                                        const colors = ['bg-[#97cd7a]', 'bg-black', 'bg-slate-300'];
                                        return (
                                            <div key={link.id} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                <div className="flex items-center gap-2 truncate">
                                                    <div className={`w-3 h-3 border border-[#1a1a1a] ${colors[i % colors.length]} shrink-0`}></div>
                                                    <span className="truncate">{link.metadata.title}</span>
                                                </div>
                                                <span className="ml-4 tabular-nums">{percent}%</span>
                                            </div>
                                        )
                                    })}

                                    {/* Restante Legenda */}
                                    {(() => {
                                        const top3Clicks = enrichedTopLinks.slice(0, 3).reduce((acc, curr) => acc + curr.clicks, 0);
                                        const remainingClicks = summary.totalClicks - top3Clicks;
                                        if (remainingClicks > 0) {
                                            const percent = ((remainingClicks / summary.totalClicks) * 100).toFixed(1);
                                            return (
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60 pt-2 border-t border-[#1a1a1a]/10">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <div className="w-3 h-3 border border-[#1a1a1a] bg-white pattern-diagonal-lines pattern-black pattern-bg-white pattern-size-2 pattern-opacity-20 shrink-0"></div>
                                                        <span className="truncate">{t('analytics.otherLinks')}</span>
                                                    </div>
                                                    <span className="ml-4 tabular-nums">{percent}%</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Links Section */}
            <div className="bg-white p-5 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl">
                <div className="flex items-center gap-2 mb-6 border-b border-[#1a1a1a] pb-4">
                    <Zap size={16} strokeWidth={3} className="text-black" />
                    <h3 className="text-xs font-black uppercase tracking-widest">{t('analytics.clickRanking')}</h3>
                </div>

                <div className="space-y-2.5">
                    {enrichedTopLinks.length === 0 ? (
                        <div className="py-10 text-center border-2 border-dashed border-[#1a1a1a]">
                            <p className="text-[10px] text-black/30 font-black uppercase tracking-widest">{t('analytics.awaitingEngagement')}</p>
                        </div>
                    ) : (
                        enrichedTopLinks.map((link, i) => (
                            <div key={link.id} className="flex items-center justify-between p-4 border-2 border-[#1a1a1a] bg-white hover:bg-[#ffdf00]/10 transition-all group shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] rounded-xl">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-8 h-8 border-2 border-[#1a1a1a] bg-black text-[#ffdf00] flex items-center justify-center text-[10px] font-black shrink-0 shadow-[0_2px_0_0_#1a1a1a] rounded-xl">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-[11px] font-black text-black uppercase tracking-widest truncate">{link.metadata.title}</h4>
                                            <span className={`text-[7px] px-1.5 py-0.5 border border-[#1a1a1a] font-black uppercase tracking-tighter rounded-xl ${link.metadata.type === 'Produto' ? 'bg-[#97cd7a] text-black' : 'bg-black text-white'
                                                }`}>
                                                {link.metadata.type}
                                            </span>
                                        </div>
                                        <p className="text-[8px] text-black font-bold truncate opacity-40 uppercase tracking-widest mt-0.5">
                                            {(() => {
                                                if (!link.metadata.url || link.metadata.url === '#') return t('common.unknown').toUpperCase();
                                                try {
                                                    // Ensure URL has a protocol for the URL constructor
                                                    const urlToParse = link.metadata.url.includes('://') 
                                                        ? link.metadata.url 
                                                        : `https://${link.metadata.url}`;
                                                    return new URL(urlToParse).hostname;
                                                } catch (e) {
                                                    return link.metadata.url.split('/')[0] || t('common.unknown').toUpperCase();
                                                }
                                            })()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right pl-4">
                                    <span className="block text-lg font-black text-black tracking-widest leading-none">{link.clicks}</span>
                                    <span className="text-[8px] font-black text-black opacity-30 uppercase tracking-widest">{t('analytics.clicks')}</span>
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
        <div className={`p-5 border-2 border-black shadow-[0_4px_0_0_#000] transition-all rounded-xl active:translate-y-[2px] active:shadow-none ${isActive
            ? 'bg-[#ffdf00] text-black'
            : 'bg-white text-black'
            }`}>
            <div className="flex items-center justify-between mb-6">
                <div className={`p-2 border-2 border-black shadow-[0_3px_0_0_#000] rounded-xl ${isActive ? 'bg-[#ffdf00] text-black' : 'bg-white text-black'}`}>
                    <Icon size={16} strokeWidth={4} />
                </div>
                <div className="w-2 h-2 border border-black bg-black"></div>
            </div>
            <div>
                <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1 opacity-60">{label}</p>
                <p className="text-2xl font-black tracking-tighter leading-none">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
}
