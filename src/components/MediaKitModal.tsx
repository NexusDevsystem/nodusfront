import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Users, TrendingUp, Mail, ExternalLink, DollarSign, BarChart3 } from 'lucide-react';
import { UserProfile, LinkItem } from '../types';
import { useTranslation } from 'react-i18next';
import { SOCIAL_NETWORKS } from '../constants';

interface MediaKitModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
    links: LinkItem[];
    mediaKitLink: LinkItem | null;
    isPreview?: boolean;
}

const MediaKitModal: React.FC<MediaKitModalProps> = ({ isOpen, onClose, profile, links, mediaKitLink, isPreview }) => {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calcula audiência total das integrações
    const integrations = profile.integrations || [];
    const totalAudience = integrations.reduce((acc, integration) => {
        const profileData = integration.profile_data || {};
        const count = profileData.follower_count || profileData.subscriber_count || integration.follower_count || 0;
        return acc + count;
    }, 0);

    // Encontra os links mais clicados (Top 3), excluindo headers, coleções vazias e o próprio mediakit
    const getTopLinks = () => {
        const flattenLinks = (items: LinkItem[]): LinkItem[] => {
            let flat: LinkItem[] = [];
            items.forEach(item => {
                if (item.type !== 'header' && item.type !== 'collection' && item.type !== 'mediakit' && !item.isArchived) {
                    flat.push(item);
                }
                if (item.children) {
                    flat = flat.concat(flattenLinks(item.children));
                }
            });
            return flat;
        };

        const allValidLinks = flattenLinks(links);
        return allValidLinks
            .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
            .slice(0, 3);
    };

    const topLinks = getTopLinks();

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num.toString();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-[99999] flex items-end justify-center pointer-events-none overflow-hidden`}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={`${isPreview ? 'absolute' : 'fixed'} inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto`}
                    />

                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.8 }}
                        className={`bg-white flex flex-col pointer-events-auto border-t-4 border-x-4 border-black w-full max-w-lg h-auto max-h-[85%] rounded-t-[40px] relative overflow-hidden`}
                        style={{ willChange: 'transform' }}
                    >
                        <div className="flex-none bg-white">
                            {/* Header (Título e Perfil) */}
                            <div className="p-5 pt-8 border-b border-[#1a1a1a]/5 relative">
                                <button
                                    onClick={onClose}
                                    className="absolute right-5 top-8 w-10 h-10 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-md group z-10"
                                >
                                    <X size={24} strokeWidth={4} />
                                </button>

                                <div className="flex items-center gap-4 pt-1">
                                    <div className="w-20 h-20 bg-white shadow-[0_4px_0_0_#1a1a1a] rounded-md shrink-0 overflow-hidden border-2 border-[#1a1a1a]">
                                        {profile.avatarUrl ? (
                                            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-800 font-bold text-3xl">
                                                {profile.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-10">
                                        <div className="inline-flex items-center gap-1.5 text-[#609942] text-[10px] font-bold uppercase tracking-widest mb-2">
                                            <BarChart3 size={12} strokeWidth={2} /> Mídia Kit
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight truncate leading-none mb-1">
                                            {profile.name}
                                        </h2>
                                        <p className="text-sm font-semibold text-slate-500 tracking-wide truncate">
                                            @{profile.username}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Corpo Scrollável */}
                        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-10 bg-white">

                            {/* Bio / Apresentação */}
                            {profile.bio && (
                                <div className="space-y-3">
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                                        <Award size={20} strokeWidth={1.5} className="text-[#609942]" /> {t('mediakit.about') || 'Sobre Mim'}
                                    </h3>
                                    <div className="p-0 text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-[13px]">
                                        {profile.bio}
                                    </div>
                                </div>
                            )}

                            {/* Audiência */}
                            <div className="space-y-4">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                                    <Users size={20} strokeWidth={1.5} className="text-[#609942]" /> {t('mediakit.audience') || 'Minha Audiência'}
                                </h3>

                                {integrations.length > 0 ? (
                                    <div className="space-y-0">
                                        {/* Total - Highlight */}
                                        <div className="py-8 px-0 flex items-center justify-between border-b border-slate-100 relative">
                                            <div className="relative z-10">
                                                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-slate-400 mb-2">{t('mediakit.totalFollowers') || 'Total de Seguidores'}</p>
                                                <p className="text-5xl md:text-6xl font-bold tracking-tight leading-none text-slate-900">{formatNumber(totalAudience)}</p>
                                            </div>
                                            <BarChart3 size={40} strokeWidth={1.5} className="text-[#97cd7a]/20" />
                                        </div>

                                        {/* Redes Individuais - LIST STYLE */}
                                        <div className="divide-y divide-slate-50">
                                            {integrations.map((integration) => {
                                                const provider = (integration.provider || integration.platform || '').toLowerCase();
                                                const network = SOCIAL_NETWORKS.find(n => n.id === provider);
                                                const Icon = network?.icon;

                                                const profileData = integration.profile_data || {};
                                                const followerCount = profileData.follower_count || profileData.subscriber_count || integration.follower_count || 0;
                                                const handle = profileData.username || profileData.title || integration.handle;

                                                return (
                                                    <div key={integration.id} className="py-5 flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:border-slate-200 transition-all text-sm overflow-hidden">
                                                                {Icon ? (
                                                                    <Icon size={18} className="opacity-70" />
                                                                ) : (
                                                                    <div className="text-[10px] font-bold uppercase">{provider.slice(0, 2)}</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800 capitalize leading-none mb-1">{network?.name || provider}</p>
                                                                <p className="text-[11px] font-medium text-slate-400">{handle ? `@${handle}` : t('mediakit.followers') || 'Seguidores'}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xl font-bold text-slate-900 tracking-tight">{formatNumber(followerCount)}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 border border-dashed border-slate-100 rounded-sm text-center flex flex-col items-center justify-center">
                                        <Users size={32} className="text-slate-100 mb-3" />
                                        <p className="text-sm font-semibold text-slate-300">{t('mediakit.noAudience') || 'Audiência não vinculada'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Pacotes e Valores */}
                            {mediaKitLink?.children && mediaKitLink.children.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                                        <DollarSign size={20} strokeWidth={1.5} className="text-[#609942]" /> {t('mediakit.myPackages') || 'Pacotes e Valores'}
                                    </h3>
                                    <div className="divide-y divide-slate-50">
                                        {mediaKitLink.children.map((pkg) => (
                                            <div key={pkg.id} className="py-5 flex flex-col justify-between group">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">{pkg.title}</h4>
                                                        <p className="text-xs font-medium text-slate-400 line-clamp-2 leading-relaxed">{pkg.subtitle}</p>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-lg font-bold text-[#609942] tracking-tighter">{pkg.url}</p>
                                                        <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest leading-none">{t('mediakit.startingAt') || 'A partir de'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Links */}
                            <div className="space-y-4">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                                    <TrendingUp size={20} strokeWidth={1.5} className="text-[#609942]" /> {t('mediakit.topContents') || 'Conteúdos em Alta'}
                                </h3>

                                <div className="divide-y divide-slate-50">
                                    {topLinks.length > 0 ? topLinks.map((link, index) => {
                                        const isFirst = index === 0;
                                        return (
                                            <a
                                                key={link.id}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`py-4 flex items-center justify-between group transition-all`}
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs rounded-full shrink-0 ${isFirst ? 'bg-[#609942] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-slate-800 truncate mb-0.5 group-hover:text-slate-900 transition-colors">{link.title}</p>
                                                        <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><ExternalLink size={12} className="opacity-50" /> {link.clicks || 0} {t('analytics.clicks') || 'Cliques'}</p>
                                                    </div>
                                                </div>
                                                <div className="p-2 rounded-full opacity-0 group-hover:opacity-100 bg-slate-50 text-slate-400 transition-all">
                                                    <ExternalLink size={14} />
                                                </div>
                                            </a>
                                        );
                                    }) : (
                                        <div className="p-8 border border-dashed border-slate-100 rounded-sm text-center flex flex-col items-center justify-center">
                                            <TrendingUp size={32} className="text-slate-100 mb-3" />
                                            <p className="text-sm font-semibold text-slate-300">{t('mediakit.noLinks') || 'Ainda não há dados suficientes'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Rodapé Fixo com Botão de Contato */}
                        <div className="flex-none p-5 border-t border-[#1a1a1a]/5 bg-white shrink-0">
                            <a
                                href={mediaKitLink?.url || `mailto:${profile.email || ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-4 bg-[#609942] text-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-md font-bold text-sm hover:translate-y-[1px] hover:shadow-none transition-all"
                            >
                                <Mail size={18} />
                                {mediaKitLink?.subtitle || t('mediakit.contactMe') || 'Entrar em Contato'}
                            </a>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MediaKitModal;
