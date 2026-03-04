import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { LinkItem, UserProfile } from '../../types';
import { compressImage } from '../../utils/imageUtils';
import { fetchMusicMetadata } from '../../utils/musicUtils';
import { fetchYoutubeChannelInfo, isYoutubeChannelUrl } from '../../utils/socialUtils';
import { SiSpotify } from 'react-icons/si';
import { apiClient } from '../../services/apiClient';
import AgendaEditor from '../AgendaEditor';
import MapEditor from '../MapEditor';
import { SOCIAL_NETWORKS } from '../../constants';
import DeezerIcon from '../icons/DeezerIcon';
import {
    Trash2, GripVertical, Plus, Image as ImageIcon, BarChart2, Pencil, Archive,
    LayoutGrid, LayoutTemplate, MessageCircle, FolderHeart, Zap, ChevronRight,
    ChevronDown, Folder, Sparkles, CreditCard, Youtube, Ban, X, User,
    ExternalLink, Share2, Check, DollarSign, Store, Smartphone, Mail, Type,
    Hash, Send as SendIcon, Columns2, Music, MapPin, ChevronUp,
    Calendar as CalendarIcon
} from 'lucide-react';

// Lazy-imported to break circular dep (LinkEditor uses SortableLinkItem uses LinkEditor)
const LinkEditor = React.lazy(() => import('../LinkEditor'));

export interface SortableLinkItemProps {
    link: LinkItem;
    updateLink: (id: string, field: keyof LinkItem, value: any) => void;
    updateLinkFields: (id: string, updates: Partial<LinkItem>) => void;
    removeLink: (id: string) => void;
    toggleLink: (id: string) => void;
    isExpanded: boolean;
    toggleCollection: (id: string) => void;
    isCollectionExpanded: boolean;
    profile: UserProfile;
    level: number;
    expandedLinks: Record<string, boolean>;
    setExpandedLinks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    expandedCollections: Record<string, boolean>;
    setExpandedCollections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    isAnyExpanded: boolean;
    isMobile: boolean;
}

function SortableLinkItem({
    link,
    updateLink,
    updateLinkFields,
    removeLink,
    toggleLink,
    isExpanded,
    toggleCollection,
    isCollectionExpanded,
    profile,
    level,
    expandedLinks,
    setExpandedLinks,
    expandedCollections,
    setExpandedCollections,
    isAnyExpanded,
    isMobile,
}: SortableLinkItemProps) {
    const { t } = useTranslation();
    const dragControls = useDragControls();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Auto-detect music metadata when URL changes
    React.useEffect(() => {
        if (!link.url) return;

        const checkMusicMetadata = async () => {
            const url = link.url;
            const isSpotify = url.includes('open.spotify.com/') && (url.includes('/track/') || url.includes('/album/') || url.includes('/playlist/'));
            const isDeezer = url.includes('deezer.com/') || url.includes('deezer.page.link/');
            const isTiktok = url.includes('tiktok.com');
            const isYoutubeChannel = isYoutubeChannelUrl(url);
            const isYoutubeVideo = (url.includes('youtube.com') || url.includes('youtu.be')) && !isYoutubeChannel;

            const needsAutoFetch = !link.title || link.title === t('links.newLink') || link.title === t('links.noTitle') || link.title === t('links.unknownLink');

            if (isYoutubeChannel && needsAutoFetch) {
                try {
                    const info = await fetchYoutubeChannelInfo(url);
                    if (info) {
                        updateLinkFields(link.id, { title: info.name, subtitle: info.subscribers, image: info.avatarUrl });
                    }
                } catch (err) {
                    console.error('[SortableLinkItem] YouTube channel fetch error:', err);
                }
                return;
            }

            if ((isSpotify || isDeezer || isTiktok || isYoutubeVideo) && needsAutoFetch) {
                let type: 'spotify' | 'deezer' | 'tiktok' | 'youtube' | 'none' = 'none';
                if (isSpotify) type = 'spotify';
                else if (isDeezer) type = 'deezer';
                else if (isTiktok) type = 'tiktok';
                else if (isYoutubeVideo) type = 'youtube';

                try {
                    if (isTiktok) {
                        const metadata = await fetchMusicMetadata(url);
                        if (metadata) {
                            const updates: Partial<LinkItem> = {};
                            if (metadata.title) updates.title = metadata.title;
                            if (metadata.type === 'video') {
                                updates.embedType = 'tiktok';
                                if (metadata.resolvedUrl) updates.url = metadata.resolvedUrl;
                                if (metadata.videoUrl) updates.videoUrl = metadata.videoUrl;
                            } else {
                                updates.embedType = 'none';
                            }
                            updateLinkFields(link.id, updates);
                            return;
                        }
                    }

                    if (link.embedType !== type) {
                        updateLinkFields(link.id, { embedType: type });
                    }

                    const metadata = await fetchMusicMetadata(url);
                    if (metadata) {
                        const updates: Partial<LinkItem> = {
                            title: metadata.title,
                            subtitle: metadata.platform === 'youtube' ? metadata.followers : (metadata.followers || metadata.artist),
                            image: metadata.thumbnailUrl,
                            embedType: type,
                        };

                        if ((metadata.type === 'album' || metadata.type === 'playlist') && metadata.tracks && metadata.tracks.length > 0) {
                            updates.type = 'collection';
                            updates.layout = 'grid';
                            updates.children = metadata.tracks.map((track: any) => ({
                                id: crypto.randomUUID(),
                                clientId: crypto.randomUUID(),
                                title: track.title,
                                subtitle: track.artist,
                                image: track.image || metadata.thumbnailUrl,
                                url: track.url,
                                embedType: metadata.platform as any,
                                layout: 'classic',
                                isActive: true,
                                clicks: 0,
                            }));
                            updates.url = url;
                        }

                        updateLinkFields(link.id, updates);
                    }
                } catch (error) {
                    console.error('[SortableLinkItem] Error fetching metadata:', error);
                }
            }
        };

        const timeoutId = setTimeout(checkMusicMetadata, 800);
        return () => clearTimeout(timeoutId);
    }, [link.url]);

    const isCollection = link.type === 'collection';
    const itemSize = level > 0 ? 'min-h-[44px]' : 'min-h-[50px]';
    const iconSize = level > 0 ? 14 : 18;
    const dragHandleSize = level > 0 ? 'w-8' : 'w-10';

    const getThumbnailIcon = () => {
        if (link.type === 'map' || link.title?.toLowerCase() === 'localização') {
            return <MapPin size={iconSize} strokeWidth={3} />;
        }
        if (link.type === 'agenda') {
            return <CalendarIcon size={iconSize} strokeWidth={3} />;
        }
        const network = SOCIAL_NETWORKS.find(n => n.id === link.platform) ||
            SOCIAL_NETWORKS.find(n => link.url?.toLowerCase().includes(n.id)) ||
            SOCIAL_NETWORKS.find(n => link.title?.toLowerCase().includes(n.id));
        const Icon = network?.icon;
        return Icon ? <Icon size={iconSize} /> : <ImageIcon size={iconSize} strokeWidth={3} />;
    };

    const renderLinkTags = () => (
        <>
            {link.scheduleStart && new Date(link.scheduleStart) > new Date() && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#97cd7a] text-[8px] font-medium text-black border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {t('links.scheduled').toUpperCase()}
                </span>
            )}
            {link.scheduleEnd && new Date(link.scheduleEnd) < new Date() && (
                <span className="shrink-0 px-1.5 py-0.5 bg-red-400 text-[8px] font-medium text-black border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {t('links.expired').toUpperCase()}
                </span>
            )}
            {(link.embedType === 'youtube' || link.platform === 'youtube' || link.url?.includes('youtube.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">YOUTUBE</span>
            )}
            {(link.embedType === 'tiktok' || link.platform === 'tiktok' || link.url?.includes('tiktok.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">TIKTOK</span>
            )}
            {(link.platform === 'twitch' || link.url?.includes('twitch.tv')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#6441a5] text-[8px] font-medium text-white border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">TWITCH</span>
            )}
            {(link.platform === 'kick' || link.url?.toLowerCase().includes('kick.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#53FC18] text-[8px] font-medium text-black border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">KICK</span>
            )}
            {(link.platform === 'instagram' || link.url?.includes('instagram.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#E1306C] text-[8px] font-medium text-white border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">INSTAGRAM</span>
            )}
            {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.includes('spotify.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">SPOTIFY</span>
            )}
        </>
    );

    const renderTypeLabel = () => {
        if (link.type === 'header') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-white text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">{t('links.headerLabel')}</span>;
        if (link.type === 'map' || link.title?.toLowerCase() === 'localização') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#ffdf00] text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">MAPA</span>;
        if (link.type === 'agenda') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">AGENDA</span>;
        if (link.layout === 'social' || (link.platform && !['custom', 'site', 'telefone', 'email'].includes(link.platform))) return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-white text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">Mesclado</span>;
        return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">Link</span>;
    };

    const DeleteConfirm = ({ message }: { message: string }) => (
        <AnimatePresence>
            {showDeleteConfirm && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-red-50 border-t border-black border-dashed"
                >
                    <div className="p-3 flex items-center justify-between gap-3 px-4">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-red-600">{message}</span>
                        <div className="flex gap-2">
                            <button onClick={() => removeLink(link.id)} className="px-3 py-1.5 bg-red-600 text-white border border-black text-[9px] font-medium uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">{t('common.confirm')}</button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-white text-black border border-black text-[9px] font-medium uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">{t('common.cancel')}</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const ToggleSwitch = () => (
        <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={link.isActive} onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)} className="sr-only peer" />
            <div className={`w-8 h-4 border border-black bg-white peer-focus:outline-none peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-black after:h-3 after:w-3 after:border after:border-black after:transition-all peer-checked:bg-[#97cd7a]`}></div>
        </label>
    );

    const FileInput = () => (
        <input
            type="file"
            id={`file-${link.id}`}
            className="hidden"
            accept="image/*"
            onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                    try {
                        const compressed = await compressImage(e.target.files[0], 400, 0.8);
                        updateLink(link.id, 'image', compressed);
                    } catch (error) {
                        console.error('Error processing image:', error);
                    }
                }
            }}
        />
    );

    const isTwitchOrYoutubeOrKick = link.platform === 'twitch' || link.url?.toLowerCase().includes('twitch.tv') ||
        link.platform === 'youtube' || link.url?.toLowerCase().includes('youtube.com') || link.url?.toLowerCase().includes('youtu.be') ||
        link.platform === 'kick' || link.url?.toLowerCase().includes('kick.com');

    return (
        <Reorder.Item
            value={link}
            dragListener={false}
            dragControls={dragControls}
            id={link.id}
            layout
            onDrag={() => { }}
            onDragEnd={() => { }}
            className={`relative border-2 border-black ${isExpanded ? 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'} select-none`}
            whileDrag={{ scale: 1, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)', zIndex: 50 }}
            style={{ willChange: 'transform' }}
        >
            <div className={`transition-all duration-300 ${level === 0 && isAnyExpanded && !isExpanded && !isCollectionExpanded ? 'opacity-40' : 'opacity-100'} ${isExpanded ? 'bg-[#ffdf00]' : 'bg-white'}`}>
                {isCollection ? (
                    /* COLLECTION ITEM */
                    <div className="overflow-hidden">
                        <div className={`flex border-b border-black items-stretch ${itemSize}`}>
                            <div
                                className={`${dragHandleSize} flex items-center justify-center cursor-move text-black hover:bg-black hover:text-white touch-none border-r border-black transition-colors`}
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                            </div>

                            <div
                                onClick={() => toggleCollection(link.id)}
                                className={`flex-1 ${level > 0 ? 'py-1.5 md:py-2' : 'py-2 md:py-2.5'} pr-3 md:pr-4 flex items-center gap-2 md:gap-3 overflow-hidden bg-white hover:bg-slate-50 transition-colors duration-200 cursor-pointer`}
                            >
                                <div className="text-black p-0.5 transition-colors shrink-0">
                                    {isCollectionExpanded ? <ChevronDown size={iconSize} strokeWidth={3} /> : <ChevronRight size={iconSize} strokeWidth={3} />}
                                </div>

                                <div className="shrink-0">
                                    <div className="relative">
                                        <FileInput />
                                        {link.image ? (
                                            <div className={`${level > 0 ? 'w-8 h-8' : 'w-9 h-9'} border border-black overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
                                                <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); document.getElementById(`file-${link.id}`)?.click(); }}
                                                className={`${level > 0 ? 'w-8 h-8' : 'w-9 h-9'} bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black hover:bg-black hover:text-white transition-all`}
                                            >
                                                {getThumbnailIcon()}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 overflow-hidden">
                                        <div className="font-medium text-black uppercase tracking-widest p-0 text-xs md:text-sm truncate leading-tight">
                                            {link.title || t('links.collectionUnnamed')}
                                        </div>
                                        {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.toLowerCase().includes('spotify.com')) && (
                                            <span className="shrink-0 px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">SPOTIFY</span>
                                        )}
                                        {(link.platform === 'kick' || link.url?.toLowerCase().includes('kick.com')) && (
                                            <span className="shrink-0 px-1.5 py-0.5 bg-[#53FC18] text-[8px] font-medium text-black border border-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">KICK</span>
                                        )}
                                    </div>
                                    <div className="text-[9px] md:text-[10px] text-black/70 font-normal uppercase tracking-[0.2em] truncate leading-none">
                                        {link.children?.length || 0} {(link.children?.length === 1) ? t('links.itemConfigured') : t('links.itemsConfigured')}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                                    <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#ffdf00] text-[9px] md:text-[10px] font-medium text-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] leading-none">
                                        {t('links.collectionLabel')}
                                    </span>
                                    <ToggleSwitch />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                                        className={`p-1.5 md:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all ${showDeleteConfirm ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-red-400'}`}
                                    >
                                        <Trash2 size={isMobile ? 14 : 18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DeleteConfirm message={t('links.deleteCollection')} />

                        {/* Expanded Collection Content */}
                        <AnimatePresence>
                            {isCollectionExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden bg-slate-50/50"
                                >
                                    <div className="overflow-hidden bg-slate-50/50">
                                        <div className="p-2 md:p-3 md:pl-5 border-t border-black space-y-3 md:space-y-4">
                                            {/* Collection Thumbnail Edit */}
                                            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-6 pb-6 border-b border-black md:px-0">
                                                <div className="relative shrink-0">
                                                    {link.image ? (
                                                        <div className="w-14 h-14 md:w-16 md:h-16 overflow-hidden border border-black bg-white relative group/img shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                                            <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                                            <div className="absolute inset-0 bg-white/90 opacity-100 md:opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <button onClick={() => document.getElementById(`file-${link.id}`)?.click()} className="p-1.5 bg-white text-black hover:bg-black hover:text-[#ffdf00] border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"><Pencil size={14} strokeWidth={3} /></button>
                                                                <button onClick={() => updateLink(link.id, 'image', null)} className="p-1.5 bg-white text-red-600 hover:bg-red-600 hover:text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"><Trash2 size={14} strokeWidth={3} /></button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                                                            className="w-14 h-14 md:w-16 md:h-16 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-black hover:bg-[#ffdf00] transition-all group"
                                                        >
                                                            <ImageIcon size={20} strokeWidth={3} />
                                                            <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">{t('common.add')}</span>
                                                        </button>
                                                    )}
                                                    <FileInput />
                                                </div>

                                                <div className="flex-1 w-full space-y-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 px-1">
                                                            <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em]">{t('links.collectionName')}</label>
                                                            {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.includes('spotify.com')) && (
                                                                <div className="flex items-center gap-1.5 ml-auto">
                                                                    <SiSpotify className="text-[#1DB954]" size={14} />
                                                                    <span className="px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">SPOTIFY</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={link.title}
                                                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                                                            className="w-full font-medium text-sm text-black bg-white border border-black px-3 py-2.5 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                                            placeholder={t('links.collectionNamePlaceholder')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Collection Footer Actions */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-6 border-t border-black border-dashed gap-4">
                                                <div className="flex items-center gap-2 text-black font-black uppercase tracking-widest text-[10px] sm:shrink-0">
                                                    <BarChart2 size={14} strokeWidth={3} />
                                                    <span>{link.clicks || 0} {t('analytics.totalClicks').toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                    <button onClick={() => window.dispatchEvent(new CustomEvent('nodus:open-move-modal', { detail: { linkId: link.id } }))} className="flex-1 sm:flex-none px-2 sm:px-3 h-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white border border-black text-black hover:bg-[#ffdf00] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">{t('links.moveTo')}</button>
                                                    <button onClick={() => updateLink(link.id, 'isArchived', !link.isArchived)} className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${link.isArchived ? 'bg-black border-black text-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-black text-black hover:bg-black hover:text-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'}`}>{link.isArchived ? t('links.restore') : t('links.archive')}</button>
                                                    <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${showDeleteConfirm ? 'bg-red-500 border-black text-white' : 'bg-white border-black text-black hover:bg-red-500 hover:text-white'}`}>{t('common.delete')}</button>
                                                </div>
                                            </div>

                                            <div className="md:px-0 pt-6">
                                                <React.Suspense fallback={<div className="py-4 text-center text-xs text-black/40">Carregando...</div>}>
                                                    <LinkEditor
                                                        links={link.children || []}
                                                        onChange={(newChildren) => updateLink(link.id, 'children', newChildren)}
                                                        level={level + 1}
                                                        profile={profile}
                                                        expandedLinks={expandedLinks}
                                                        setExpandedLinks={setExpandedLinks}
                                                        expandedCollections={expandedCollections}
                                                        setExpandedCollections={setExpandedCollections}
                                                    />
                                                </React.Suspense>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* STANDARD LINK ITEM */
                    <div className="flex flex-col">
                        <div className={`flex border-b border-black items-stretch ${itemSize} bg-white`}>
                            <div
                                className={`${dragHandleSize} flex items-center justify-center cursor-move text-black hover:bg-black hover:text-white border-r border-black touch-none transition-colors`}
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                            </div>

                            <div
                                onClick={() => toggleLink(link.id)}
                                className={`flex-1 ${level > 0 ? 'py-1.5 md:py-2' : 'py-2 md:py-2.5'} pr-3 md:pr-4 flex items-center gap-2 md:gap-3 overflow-hidden bg-white hover:bg-slate-50 transition-colors duration-200 cursor-pointer`}
                            >
                                <div className="text-black p-0.5 transition-colors shrink-0">
                                    {isExpanded ? <ChevronDown size={iconSize} strokeWidth={3} /> : <ChevronRight size={iconSize} strokeWidth={3} />}
                                </div>

                                <div className="shrink-0">
                                    <div className="relative">
                                        <FileInput />
                                        {link.type === 'map' || link.title?.toLowerCase() === 'localização' ? (
                                            <div className={`${level > 0 ? 'w-8 h-8' : 'w-9 h-9'} bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black`}><MapPin size={iconSize} strokeWidth={3} /></div>
                                        ) : link.type === 'agenda' ? (
                                            <div className={`${level > 0 ? 'w-8 h-8' : 'w-9 h-9'} bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black`}><CalendarIcon size={iconSize} strokeWidth={3} /></div>
                                        ) : link.image ? (
                                            <div className={`${level > 0 ? 'w-8 h-8' : 'w-9 h-9'} border border-black overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}><img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" loading="lazy" decoding="async" /></div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); document.getElementById(`file-${link.id}`)?.click(); }}
                                                className={`${level > 0 ? 'w-8 h-8' : 'w-9 h-9'} bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black hover:bg-black hover:text-white transition-all`}
                                            >{getThumbnailIcon()}</button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 group/title">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className="font-medium uppercase tracking-widest text-black truncate text-[11px] md:text-xs flex items-center gap-1.5">
                                            {link.title || (link.type === 'header' ? t('links.headerItem') : t('links.untitled'))}
                                            {renderLinkTags()}
                                        </div>
                                    </div>
                                    <div className="text-[9px] md:text-[10px] text-black/60 font-normal uppercase tracking-[0.1em] truncate leading-none">
                                        {link.type === 'header' ? t('links.separatorText') : (link.url || t('links.yourNetworks'))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                                    {renderTypeLabel()}
                                    <ToggleSwitch />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                                        className={`p-1.5 md:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all ${showDeleteConfirm ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-red-400'}`}
                                    >
                                        <Trash2 size={isMobile ? 14 : 18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DeleteConfirm message={t('links.deleteItem')} />

                        {/* Expanded Body */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden bg-[#f8f8f8] border-t border-black border-dashed"
                                >
                                    <div className={`${level > 0 ? 'p-3' : 'px-4 md:px-6 pb-6 pt-5'}`}>
                                        {link.type === 'agenda' ? (
                                            <div className="mb-6">
                                                <div className="space-y-4 mb-6">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.titleLabel')}</label>
                                                        <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} className="w-full font-medium text-base text-black bg-white border border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 select-text shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" placeholder={t('agenda.titlePlaceholder') || 'Título da Agenda'} />
                                                    </div>
                                                </div>
                                                <AgendaEditor link={link} onEventsChange={(events) => updateLink(link.id, 'events', events)} />
                                            </div>
                                        ) : link.type === 'map' ? (
                                            <div className="mb-6"><MapEditor link={link} updateLink={updateLink} /></div>
                                        ) : (
                                            <div className={`flex flex-col md:flex-row items-center md:items-start ${level > 0 ? 'gap-3 mb-4' : 'gap-4 md:gap-6 mb-6'}`}>
                                                {!isTwitchOrYoutubeOrKick && (
                                                    <div className="relative shrink-0">
                                                        {link.image ? (
                                                            <div className="w-14 h-14 md:w-16 md:h-16 overflow-hidden border border-black bg-white relative group/img shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                                                <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                                                <div className="absolute inset-0 bg-white/90 opacity-100 md:opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                    <button onClick={() => document.getElementById(`file-${link.id}`)?.click()} className="p-1.5 bg-white text-black hover:bg-black hover:text-[#ffdf00] border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"><Pencil size={14} strokeWidth={3} /></button>
                                                                    <button onClick={() => updateLink(link.id, 'image', undefined)} className="p-1.5 bg-white text-black hover:bg-red-500 hover:text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"><Trash2 size={14} strokeWidth={3} /></button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                                                                className="w-14 h-14 md:w-16 md:h-16 bg-white border border-dashed border-black flex flex-col items-center justify-center text-black hover:bg-black hover:text-[#ffdf00] transition-all group/btn shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                                            ><ImageIcon size={18} className="mb-0.5" strokeWidth={3} /><span className="text-[8px] font-medium uppercase tracking-widest">{t('links.imageLabel')}</span></button>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0 space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.titleLabel')}</label>
                                                        <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} className="w-full font-medium text-base text-black bg-white border border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 select-text shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" placeholder={link.type === 'header' ? t('links.sectionPlaceholder') : t('links.titlePlaceholder')} />
                                                    </div>
                                                    {link.type !== 'header' && (
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">URL / Link</label>
                                                            <input type="text" value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} className="w-full text-xs font-medium uppercase tracking-widest text-black bg-white border border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 select-text shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" placeholder="https://exemplo.com" />
                                                        </div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.subtitleLabel')}</label>
                                                        <input type="text" value={link.subtitle || ''} onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)} className="w-full text-xs font-normal uppercase tracking-wider text-black bg-white border border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" placeholder={t('links.subtitlePlaceholder')} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Scheduling & Footer Actions */}
                                        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8 pt-4 md:pt-6 border-t border-black border-dashed">
                                            {link.type !== 'agenda' && !isTwitchOrYoutubeOrKick && (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.layoutLabel')}</label>
                                                    <div className="flex flex-col gap-1.5">
                                                        {[
                                                            { id: 'classic', label: t('links.layoutClassic'), desc: t('links.layoutClassicDesc') },
                                                            { id: 'card', label: t('links.layoutCard'), desc: t('links.layoutCardDesc') },
                                                            { id: 'social', label: t('links.layoutSocial'), desc: t('links.layoutSocialDesc') },
                                                            { id: 'carousel', label: t('links.layoutCarousel'), desc: t('links.layoutCarouselDesc') },
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => updateLink(link.id, 'layout', opt.id)}
                                                                className={`p-2 border text-left flex items-start gap-2.5 transition-all ${link.layout === opt.id ? 'bg-[#97cd7a] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-black hover:bg-[#f1f1f1] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'}`}
                                                            >
                                                                <div className="flex-1 mt-0">
                                                                    <div className="text-[11px] font-medium uppercase tracking-widest leading-none mb-1 text-black">{opt.label}</div>
                                                                    <div className="text-[9px] text-black/70 font-normal uppercase tracking-wider leading-none">{opt.desc}</div>
                                                                </div>
                                                                {link.layout === opt.id && (
                                                                    <div className="w-3.5 h-3.5 bg-black border border-black mt-0.5 flex items-center justify-center">
                                                                        <Check size={10} strokeWidth={4} className="text-[#97cd7a]" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {link.type !== 'agenda' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.schedule')} (PRO)</label>
                                                        {(!profile.planType || profile.planType === 'free') && (
                                                            <span className="px-2 py-0.5 bg-black text-[#97cd7a] border-2 border-black text-[9px] font-medium uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{t('links.locked')}</span>
                                                        )}
                                                    </div>
                                                    <div className={`p-2 border mt-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${(!profile.planType || profile.planType === 'free') ? 'bg-slate-100 border-black opacity-60 pointer-events-none grayscale' : 'bg-white border-black'}`}>
                                                        <div className="grid grid-cols-1 gap-2.5">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black">
                                                                    <div className={`w-2.5 h-2.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${(link.scheduleStart && new Date(link.scheduleStart) > new Date()) ? 'bg-[#97cd7a]' : 'bg-white'}`}></div>
                                                                    {t('links.scheduleStart')}
                                                                </div>
                                                                <input type="datetime-local" value={link.scheduleStart ? new Date(link.scheduleStart).toISOString().slice(0, 16) : ''} onChange={(e) => { const date = e.target.value ? new Date(e.target.value).toISOString() : null; updateLink(link.id, 'scheduleStart', date); }} disabled={!profile.planType || profile.planType === 'free'} className="w-full text-[10px] font-black uppercase tracking-widest text-black bg-white border border-black px-2 py-1.5 focus:bg-[#ffdf00] outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black">
                                                                    <div className={`w-2.5 h-2.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${(link.scheduleEnd && new Date(link.scheduleEnd) < new Date()) ? 'bg-red-500' : 'bg-white'}`}></div>
                                                                    {t('links.scheduleEnd')}
                                                                </div>
                                                                <input type="datetime-local" value={link.scheduleEnd ? new Date(link.scheduleEnd).toISOString().slice(0, 16) : ''} onChange={(e) => { const date = e.target.value ? new Date(e.target.value).toISOString() : null; updateLink(link.id, 'scheduleEnd', date); }} disabled={!profile.planType || profile.planType === 'free'} className="w-full text-[10px] font-black uppercase tracking-widest text-black bg-white border border-black px-2 py-1.5 focus:bg-[#ffdf00] outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-black border-dashed gap-4">
                                            <div className="flex items-center gap-2 text-black font-black uppercase tracking-widest text-[10px] sm:shrink-0">
                                                <BarChart2 size={14} strokeWidth={3} />
                                                <span>{link.clicks || 0} {t('analytics.totalClicks').toUpperCase()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                <button onClick={() => window.dispatchEvent(new CustomEvent('nodus:open-move-modal', { detail: { linkId: link.id } }))} className="flex-1 sm:flex-none px-2 sm:px-3 h-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white border border-black text-black hover:bg-[#ffdf00] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{t('links.moveTo')}</button>
                                                <button onClick={() => updateLink(link.id, 'isArchived', !link.isArchived)} className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${link.isArchived ? 'bg-black border-black text-[#ffdf00]' : 'bg-white border-black text-black hover:bg-black hover:text-[#ffdf00]'}`}>{link.isArchived ? t('links.restore') : t('links.archive')}</button>
                                                <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${showDeleteConfirm ? 'bg-red-500 border-black text-white' : 'bg-white border-black text-black hover:bg-red-500 hover:text-white'}`}>{t('common.delete')}</button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </Reorder.Item>
    );
}

export default SortableLinkItem;
