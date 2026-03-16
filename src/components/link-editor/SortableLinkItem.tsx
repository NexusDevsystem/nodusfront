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
    Calendar as CalendarIcon, Loader2, BarChart3, Lock,
    Activity, Sun, Waves, PartyPopper, Box as Package,
    Heart, RotateCw, Disc, RefreshCw,
    Move, Target, Lightbulb, Rainbow, ZapOff, Radio, Vibrate, Bolt
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
    const [animCategory, setAnimCategory] = useState(() => {
        const h = link.highlight || 'none';
        if (['none', 'pulse', 'float', 'heartbeat', 'aura', 'glow'].includes(h)) return 'soft';
        if (['bounce', 'shake', 'tada', 'jello', 'rubberBand', 'vibrate', 'wobble'].includes(h)) return 'dynamic';
        return 'special';
    });
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Handle File Selection and Upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        setIsUploadingImage(true);

        try {
            // First compress locally to save bandwidth
            const compressedBase64 = await compressImage(file, 800, 0.7);

            // Convert base64 back to blob for upload
            const response = await fetch(compressedBase64);
            const blob = await response.blob();
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });

            // Upload to server
            const uploadRes = await apiClient.uploadInternalAsset(compressedFile);

            if (uploadRes.success && uploadRes.file?.url) {
                updateLink(link.id, 'image', uploadRes.file.url);
            } else {
                // Fallback to base64 if upload fails (though not ideal)
                updateLink(link.id, 'image', compressedBase64);
            }
        } catch (error) {
            console.error('[SortableLinkItem] Image upload error:', error);
            // Last resort: try original file if compression failed
            try {
                const uploadRes = await apiClient.uploadInternalAsset(file);
                if (uploadRes.success && uploadRes.file?.url) {
                    updateLink(link.id, 'image', uploadRes.file.url);
                }
            } catch (innerError) {
                console.error('[SortableLinkItem] Total upload failure:', innerError);
            }
        } finally {
            setIsUploadingImage(false);
            if (e.target) e.target.value = ''; // Reset to allow picking same file
        }
    };


    // Keep a ref to always have the latest link data inside async callbacks
    // This prevents stale closures from overwriting freshly-uploaded images
    const linkRef = React.useRef(link);
    React.useLayoutEffect(() => {
        linkRef.current = link;
    });

    // Auto-detect music metadata when URL changes
    React.useEffect(() => {
        if (!link.url) return;

        const checkMusicMetadata = async () => {
            const url = link.url;
            // Always read from ref to get the LATEST state, not the stale closure value
            const currentLink = linkRef.current;

            const isSpotify = url.includes('open.spotify.com') && (url.includes('/track/') || url.includes('/album/') || url.includes('/playlist/') || url.includes('spotify.link'));
            const isDeezer = url.includes('deezer.com') || url.includes('deezer.page.link') || url.includes('link.deezer.com');
            const isTiktok = url.includes('tiktok.com');
            const isYoutubeChannel = isYoutubeChannelUrl(url);
            const isYoutubeVideo = (url.includes('youtube.com') || url.includes('youtu.be')) && !isYoutubeChannel;

            const isSpotifyAlbum = isSpotify && (url.includes('/album/') || url.includes('/playlist/') || url.includes('spotify.link/'));
            const isDeezerAlbum = isDeezer && (url.includes('/album/') || url.includes('/playlist/') || url.includes('deezer.page.link/') || url.includes('link.deezer.com/'));
            const isMissingAlbumTracks = (isSpotifyAlbum || isDeezerAlbum) && !currentLink.children;

            // Only auto-fetch if title is empty/default OR it's an album/playlist that needs track loading
            const needsAutoFetch = !currentLink.title || currentLink.title === t('links.newLink') || currentLink.title === t('links.noTitle') || currentLink.title === t('links.unknownLink') || isMissingAlbumTracks;

            if (isYoutubeChannel && needsAutoFetch) {
                try {
                    const info = await fetchYoutubeChannelInfo(url);
                    if (info) {
                        const fresh = linkRef.current; // re-read after await
                        const updates: Partial<LinkItem> = {};
                        if (!fresh.title || fresh.title === t('links.newLink') || fresh.title === t('links.noTitle')) {
                            updates.title = info.name;
                        }
                        if (!fresh.subtitle) updates.subtitle = info.subscribers;

                        // Internalize image to prevent expiration
                        if (!fresh.image && info.avatarUrl) {
                            try {
                                const proxyRes = await apiClient.proxyUploadAsset(info.avatarUrl);
                                if (proxyRes.success && proxyRes.file?.url) {
                                    updates.image = proxyRes.file.url;
                                } else {
                                    updates.image = info.avatarUrl;
                                }
                            } catch (e) {
                                updates.image = info.avatarUrl;
                            }
                        }

                        if (Object.keys(updates).length > 0) {
                            updateLinkFields(link.id, updates);
                        }
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
                            const fresh = linkRef.current;
                            const updates: Partial<LinkItem> = {};
                            if ((!fresh.title || fresh.title === t('links.newLink') || fresh.title === t('links.noTitle')) && metadata.title) {
                                updates.title = metadata.title;
                            }
                            if (metadata.type === 'video') {
                                updates.embedType = 'tiktok';
                                if (metadata.resolvedUrl && fresh.url !== metadata.resolvedUrl) updates.url = metadata.resolvedUrl;
                                if (metadata.videoUrl) updates.videoUrl = metadata.videoUrl;
                            } else {
                                updates.embedType = 'none';
                            }
                            // NEVER overwrite existing image
                            if (metadata.thumbnailUrl && !fresh.image) {
                                try {
                                    const proxyRes = await apiClient.proxyUploadAsset(metadata.thumbnailUrl);
                                    if (proxyRes.success && proxyRes.file?.url) updates.image = proxyRes.file.url;
                                    else updates.image = metadata.thumbnailUrl;
                                } catch (e) {
                                    updates.image = metadata.thumbnailUrl;
                                }
                            }

                            if (Object.keys(updates).length > 0) {
                                updateLinkFields(link.id, updates);
                            }
                            return;
                        }
                    }

                    if (linkRef.current.embedType !== type) {
                        updateLinkFields(link.id, { embedType: type });
                    }

                    const metadata = await fetchMusicMetadata(url);
                    if (metadata) {
                        const fresh = linkRef.current; // re-read after await
                        const updates: Partial<LinkItem> = {
                            embedType: type,
                        };

                        if (!fresh.title || fresh.title === t('links.newLink') || fresh.title === t('links.noTitle') || isMissingAlbumTracks) {
                            updates.title = metadata.title;
                        }

                        if (!fresh.subtitle || isMissingAlbumTracks) {
                            updates.subtitle = metadata.platform === 'youtube' ? metadata.followers : (metadata.followers || metadata.artist);
                        }

                        // NEVER overwrite an existing image — always check the LATEST state via ref
                        if (!fresh.image && metadata.thumbnailUrl) {
                            try {
                                const proxyRes = await apiClient.proxyUploadAsset(metadata.thumbnailUrl);
                                if (proxyRes.success && proxyRes.file?.url) updates.image = proxyRes.file.url;
                                else updates.image = metadata.thumbnailUrl;
                            } catch (e) {
                                updates.image = metadata.thumbnailUrl;
                            }
                        }

                        if ((metadata.type === 'album' || metadata.type === 'playlist') && metadata.tracks && metadata.tracks.length > 0) {
                            updates.type = 'collection';
                            updates.layout = 'list';
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
        // NOTE: link.image intentionally NOT in deps — it's read via ref inside the callback
        // to avoid re-triggering the effect every time an image is uploaded
    }, [link.url, link.id, link.title, t]);

    const isCollection = link.type === 'collection';
    const itemSize = level > 0 ? 'min-h-[64px]' : 'min-h-[82px]';
    const iconSize = level > 0 ? 14 : 18;
    const dragHandleSize = level > 0 ? 'w-8' : 'w-10';

    const getThumbnailIcon = () => {
        if (link.type === 'collection') {
            return <Folder size={iconSize} strokeWidth={3} />;
        }
        if (link.type === 'map' || link.title?.toLowerCase() === 'localização') {
            return <MapPin size={iconSize} strokeWidth={3} />;
        }
        if (link.type === 'agenda') {
            return <CalendarIcon size={iconSize} strokeWidth={3} />;
        }
        if (link.type === 'mediakit') {
            return <BarChart3 size={iconSize} strokeWidth={3} />;
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
                <span className="shrink-0 px-1.5 py-0.5 bg-[#97cd7a] text-[8px] font-medium text-black border-2 border-[#1a1a1a] uppercase flex items-center gap-1 shadow-[0_2px_0_0_#1a1a1a]">
                    {t('links.scheduled').toUpperCase()}
                </span>
            )}
            {link.scheduleEnd && new Date(link.scheduleEnd) < new Date() && (
                <span className="shrink-0 px-1.5 py-0.5 bg-red-400 text-[8px] font-medium text-black border-2 border-[#1a1a1a] uppercase flex items-center gap-1 shadow-[0_3px_0_0_#1a1a1a]">
                    {t('links.expired').toUpperCase()}
                </span>
            )}
            {(link.embedType === 'youtube' || link.platform === 'youtube' || link.url?.includes('youtube.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">YOUTUBE</span>
            )}
            {(link.embedType === 'tiktok' || link.platform === 'tiktok' || link.url?.includes('tiktok.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">TIKTOK</span>
            )}
            {(link.platform === 'twitch' || link.url?.includes('twitch.tv')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#6441a5] text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">TWITCH</span>
            )}
            {(link.platform === 'kick' || link.url?.toLowerCase().includes('kick.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#53FC18] text-[8px] font-medium text-black border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">KICK</span>
            )}
            {(link.platform === 'instagram' || link.url?.includes('instagram.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#E1306C] text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">INSTAGRAM</span>
            )}
            {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.includes('spotify.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">SPOTIFY</span>
            )}
            {(link.embedType === 'deezer' || link.platform === 'deezer' || link.url?.includes('deezer.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">DEEZER</span>
            )}
        </>
    );

    const renderTypeLabel = () => {
        if (link.type === 'header') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-white text-[9px] md:text-[10px] font-bold text-black border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a] leading-none italic">{t('links.headerLabel')}</span>;
        if (link.type === 'map' || link.title?.toLowerCase() === 'localização') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#ffdf00] text-[9px] md:text-[10px] font-bold text-black border-2 border-[#1a1a1a] uppercase shadow-[0_2px_0_0_rgba(26,26,26,1)] leading-none italic">{t('links.mapLabelMobile').toUpperCase()}</span>;
        if (link.type === 'agenda') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-bold text-black border-2 border-[#1a1a1a] uppercase shadow-[0_2px_0_0_rgba(26,26,26,1)] leading-none italic">{t('links.agendaTag').toUpperCase()}</span>;
        if (link.type === 'mediakit') return (
            <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-bold text-black border-2 border-[#1a1a1a] uppercase shadow-[0_2px_0_0_rgba(26,26,26,1)] leading-none italic">
                {t('mediakit.title')?.toUpperCase() || 'MÍDIA KIT'}
            </span>
        );
        if (link.layout === 'social' || (link.platform && !['custom', 'site', 'telefone', 'email'].includes(link.platform))) return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-white text-[9px] md:text-[10px] font-bold text-black border-2 border-[#1a1a1a] uppercase shadow-[0_2px_0_0_rgba(26,26,26,1)] leading-none italic">{t('links.mergedTag').toUpperCase()}</span>;
        return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-bold text-black border-2 border-[#1a1a1a] uppercase shadow-[0_2px_0_0_rgba(26,26,26,1)] leading-none italic">{t('links.linkLabel').toUpperCase()}</span>;
    };

    const DeleteConfirm = ({ message }: { message: string }) => (
        <AnimatePresence>
            {showDeleteConfirm && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-red-50 border-t border-[#1a1a1a] border-dashed"
                >
                    <div className="p-3 flex items-center justify-between gap-3 px-4">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-red-600">{message}</span>
                        <div className="flex gap-2">
                            <button onClick={() => removeLink(link.id)} className="px-3 py-1.5 bg-red-600 text-white border border-[#1a1a1a] text-[9px] font-medium uppercase tracking-widest shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none">{t('common.confirm')}</button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-white text-black border border-[#1a1a1a] text-[9px] font-medium uppercase tracking-widest shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none">{t('common.cancel')}</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const ToggleSwitch = () => (
        <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={link.isActive} onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)} className="sr-only peer" />
            <div className="w-12 h-6 border-2 border-[#1a1a1a] bg-white rounded-full transition-all duration-300 peer-checked:bg-[#97cd7a] shadow-[0_3px_0_0_#1a1a1a] peer-active:shadow-none peer-active:translate-y-[3px] after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-2 after:border-[#1a1a1a] after:w-4 after:h-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
        </label>
    );

    return (
        <>
            {/* Single stable file input */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            <Reorder.Item
                value={link}
                dragListener={false}
                dragControls={dragControls}
                id={link.id}
                layout
                onDrag={() => { }}
                onDragEnd={() => { }}
                className={`relative border-2 border-[#1a1a1a] rounded-xl ${isExpanded ? 'bg-white shadow-[0_4px_0_0_#1a1a1a]' : 'bg-white shadow-[0_4px_0_0_#1a1a1a]'} select-none ${(!isExpanded && !isCollectionExpanded) ? 'cursor-target' : ''}`}
                whileDrag={{ scale: 1.01, boxShadow: '0px 10px 0px 0px rgba(26,26,26,1)', zIndex: 50, borderRadius: '12px' }}
                style={{ willChange: 'transform' }}
            >
                <div className={`transition-all duration-300 rounded-[10px] overflow-hidden ${level === 0 && isAnyExpanded && !isExpanded && !isCollectionExpanded ? 'opacity-40' : 'opacity-100'} ${(isExpanded || isCollectionExpanded) ? 'bg-[#fefcbf]' : 'bg-white'}`}>
                    {isCollection ? (
                        /* COLLECTION ITEM */
                        <div className="overflow-hidden">
                            <div className={`flex border-b border-[#1a1a1a] items-stretch ${itemSize}`}>
                                <div
                                    className={`${dragHandleSize} flex items-center justify-center cursor-move text-black ${isCollectionExpanded ? 'bg-[#fefcbf]' : 'hover:bg-black hover:text-white'} touch-none border-r-2 border-[#1a1a1a] transition-colors rounded-l-xl`}
                                    onPointerDown={(e) => dragControls.start(e)}
                                >
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                                </div>
                                <div
                                    onClick={() => toggleCollection(link.id)}
                                    className={`flex-1 ${level > 0 ? 'py-2.5 md:py-3.5' : 'py-3.5 md:py-5'} pr-4 md:pr-6 flex items-center gap-3 md:gap-5 overflow-hidden ${isCollectionExpanded ? 'bg-transparent' : 'bg-white hover:bg-slate-50'} transition-colors duration-200 cursor-pointer`}
                                >
                                    <div className="text-black p-0.5 transition-colors shrink-0">
                                        {isCollectionExpanded ? <ChevronDown size={iconSize} strokeWidth={2.5} /> : <ChevronRight size={iconSize} strokeWidth={2.5} />}
                                    </div>

                                    {!isMobile && (
                                        <div className="shrink-0">
                                            <div className="relative">
                                                {link.image ? (
                                                    <div className={`${level > 0 ? 'w-10 h-10' : 'w-12 h-12'} border-2 border-[#1a1a1a] overflow-hidden shadow-[0_3px_0_0_#1a1a1a] rounded-lg`}>
                                                        <img
                                                            src={link.image}
                                                            alt="Thumbnail"
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                        className={`${level > 0 ? 'w-10 h-10' : 'w-12 h-12'} bg-white border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] flex items-center justify-center text-black hover:bg-black hover:text-white transition-all rounded-lg`}
                                                    >
                                                        {getThumbnailIcon()}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 overflow-hidden">
                                            <div className="font-bold text-black uppercase tracking-[0.1em] p-0 text-sm md:text-base truncate leading-tight">
                                                {link.title || t('links.collectionUnnamed')}
                                            </div>
                                            {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.toLowerCase().includes('spotify.com')) && (
                                                <span className="shrink-0 px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase flex items-center gap-1 shadow-[0_3px_0_0_#1a1a1a]">SPOTIFY</span>
                                            )}
                                            {(link.embedType === 'deezer' || link.platform === 'deezer' || link.url?.toLowerCase().includes('deezer.com')) && (
                                                <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase flex items-center gap-1 shadow-[0_3px_0_0_#1a1a1a]">DEEZER</span>
                                            )}
                                            {(link.platform === 'kick' || link.url?.toLowerCase().includes('kick.com')) && (
                                                <span className="shrink-0 px-1.5 py-0.5 bg-[#53FC18] text-[8px] font-medium text-black border-2 border-[#1a1a1a] uppercase flex items-center gap-1 shadow-[0_3px_0_0_#1a1a1a]">KICK</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] md:text-[11px] text-black/70 font-semibold uppercase tracking-[0.15em] truncate leading-tight">
                                            {link.children?.length || 0} {(link.children?.length === 1) ? t('links.itemConfigured') : t('links.itemsConfigured')}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                                        <ToggleSwitch />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                                            className={`p-1.5 transition-all ${showDeleteConfirm ? 'text-red-500' : 'text-black/30 hover:text-red-500'}`}
                                        >
                                            <Trash2 size={isMobile ? 18 : 20} strokeWidth={2.5} />
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
                                        className="overflow-hidden bg-[#fff9c4] border-t border-[#1a1a1a]"
                                    >
                                        <div className="p-2 md:p-3 md:pl-5 space-y-3 md:space-y-4">
                                            {/* Collection Basic Info & Layout */}
                                            <div className="flex flex-col md:flex-row gap-6 md:gap-10 pb-6">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2 px-1 mb-1">
                                                        <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em]">{t('links.collectionName')}</label>
                                                        {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.includes('spotify.com')) && (
                                                            <div className="flex items-center gap-1.5 ml-auto">
                                                                <SiSpotify className="text-[#1DB954]" size={14} />
                                                                <span className="px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">SPOTIFY</span>
                                                            </div>
                                                        )}
                                                        {(link.embedType === 'deezer' || link.platform === 'deezer' || link.url?.includes('deezer.com')) && (
                                                            <div className="flex items-center gap-1.5 ml-auto">
                                                                <DeezerIcon size={14} />
                                                                <span className="px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border-2 border-[#1a1a1a] uppercase shadow-[0_3px_0_0_#1a1a1a]">DEEZER</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={link.title}
                                                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                                                        className="w-full font-medium text-sm text-black bg-white border-2 border-[#1a1a1a] px-3 py-2.5 focus:bg-white outline-none transition-all placeholder:text-black/30 shadow-[0_4px_0_0_#1a1a1a]"
                                                        placeholder={t('links.collectionNamePlaceholder')}
                                                    />
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.layoutLabel')}</label>
                                                    <div className="grid grid-cols-2 gap-3 max-w-[340px]">
                                                        {[
                                                            { id: 'list', label: t('links.layoutList') || 'Lista' },
                                                            { id: 'carousel', label: t('links.layoutCarousel') || 'Carrossel' },
                                                        ].map((opt) => {
                                                            const isActive = link.layout === opt.id;

                                                            return (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => updateLink(link.id, 'layout', opt.id)}
                                                                    className={`group relative flex flex-col items-center justify-between p-3 aspect-square border-2 border-[#1a1a1a] rounded-xl transition-all ${isActive ? 'bg-[#ffdf00] shadow-none translate-y-[3px]' : 'bg-white hover:bg-[#f8f8f8] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_#1a1a1a] shadow-[0_2px_0_0_#1a1a1a]'}`}
                                                                >
                                                                    {isActive && (
                                                                        <div className="absolute top-1 right-1 w-4 h-4 bg-black flex items-center justify-center border border-[#1a1a1a] rounded-md z-10 shadow-[0_1px_0_0_rgba(255,255,255,0.2)]">
                                                                            <Check size={10} strokeWidth={2.5} className="text-[#ffdf00]" />
                                                                        </div>
                                                                    )}

                                                                    <div className="flex-1 flex items-center justify-center w-full mb-1 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                                                                        {opt.id === 'list' && (
                                                                            <svg viewBox="0 0 100 80" className="w-[85%] h-auto max-h-full drop-shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                                                                                <rect x="10" y="10" width="80" height="24" fill="white" stroke="black" strokeWidth="6" rx="4" />
                                                                                <rect x="20" y="20" width="30" height="4" fill="black" rx="1" />
                                                                                <rect x="10" y="46" width="80" height="24" fill="white" stroke="black" strokeWidth="6" rx="4" />
                                                                                <rect x="20" y="56" width="45" height="4" fill="black" rx="1" />
                                                                            </svg>
                                                                        )}
                                                                        {opt.id === 'carousel' && (
                                                                            <svg viewBox="0 0 100 80" className="w-[85%] h-auto max-h-full drop-shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                                                                                <rect x="12" y="15" width="46" height="50" fill="white" stroke="black" strokeWidth="6" strokeLinejoin="round" rx="4" />
                                                                                <rect x="12" y="15" width="46" height="30" fill="black" stroke="black" strokeWidth="6" strokeLinejoin="round" rx="4" />
                                                                                <rect x="22" y="53" width="26" height="4" fill="black" rx="1" />
                                                                                <rect x="68" y="15" width="46" height="50" fill="white" stroke="black" strokeWidth="6" strokeLinejoin="round" rx="4" />
                                                                                <rect x="68" y="15" width="46" height="30" fill="black" opacity="0.3" stroke="black" strokeWidth="6" strokeLinejoin="round" rx="4" />
                                                                            </svg>
                                                                        )}
                                                                    </div>

                                                                    <span className="text-[9px] font-bold uppercase tracking-tight text-black text-center leading-none mt-auto">
                                                                        {opt.label}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Collection Footer Actions */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-6 border-t border-[#1a1a1a] border-dashed gap-4">
                                                <div className="flex items-center gap-2 text-black font-bold uppercase tracking-widest text-[10px] sm:shrink-0">
                                                    <BarChart2 size={14} strokeWidth={2} />
                                                    <span>{link.clicks || 0} {t('analytics.totalClicks').toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                    <button onClick={() => window.dispatchEvent(new CustomEvent('nodus:open-move-modal', { detail: { linkId: link.id } }))} className="flex-1 sm:flex-none px-2 sm:px-3 h-8 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white border-2 border-[#1a1a1a] text-black hover:bg-[#ffdf00] transition-all shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none">{t('links.moveTo')}</button>
                                                    <button onClick={() => updateLink(link.id, 'isArchived', !link.isArchived)} className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${link.isArchived ? 'bg-black border-[#1a1a1a] text-[#ffdf00] shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none' : 'bg-white border-[#1a1a1a] text-black hover:bg-black hover:text-[#ffdf00] shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none'}`}>{link.isArchived ? t('links.restore') : t('links.archive')}</button>
                                                    <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none ${showDeleteConfirm ? 'bg-red-500 border-[#1a1a1a] text-white' : 'bg-white border border-[#1a1a1a] text-black hover:bg-red-500 hover:text-white'}`}>{t('common.delete')}</button>
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* STANDARD LINK ITEM */
                        <div className="flex flex-col">
                            <div className={`flex items-stretch ${isExpanded ? 'bg-transparent' : 'bg-white'}`}>
                                {/* Drag Handle - Full Height */}
                                <div
                                    className={`${dragHandleSize} flex items-center justify-center cursor-move text-black border-r-2 border-[#1a1a1a] touch-none transition-colors hover:bg-black hover:text-[#ffdf00]`}
                                    onPointerDown={(e) => dragControls.start(e)}
                                >
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                                </div>

                                <div className="flex-1 flex flex-col min-w-0">
                                    {/* Top Row: Title & Toggle */}
                                    <div
                                        onClick={() => toggleLink(link.id)}
                                        className="flex items-start justify-between p-4 pb-2 md:p-6 md:pb-3 cursor-pointer group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <h3 className="font-bold text-sm md:text-base text-black uppercase tracking-tight truncate flex items-center gap-2">
                                                    {link.title || (link.type === 'header' ? t('links.headerItem') : t('links.untitled'))}
                                                    <Pencil size={12} className="opacity-0 group-hover:opacity-30 transition-opacity" />
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] md:text-[11px] text-black/50 font-medium uppercase tracking-wider truncate max-w-[80%]">
                                                    {link.type === 'header' ? t('links.separatorText') : (link.url || t('links.yourNetworks'))}
                                                </p>
                                                {link.url && <Pencil size={10} className="opacity-0 group-hover:opacity-30 transition-opacity" />}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0 pl-4">
                                            <ToggleSwitch />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-4 pb-4 md:px-6 md:pb-5">
                                        <div className="flex items-center gap-4 md:gap-7 text-black/30">
                                            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-medium uppercase tracking-widest text-black/40">
                                                <BarChart2 size={iconSize - 4} strokeWidth={2} />
                                                <span>{link.clicks || 0} CLICKS</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                                            className={`p-1.5 transition-colors ${showDeleteConfirm ? 'text-red-500' : 'text-black/20 hover:text-red-500'}`}
                                        >
                                            <Trash2 size={isMobile ? 18 : 20} strokeWidth={2.5} />
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
                                        className="overflow-hidden bg-[#fefcbf] border-t border-[#1a1a1a] border-dashed"
                                    >
                                        <div className={`${level > 0 ? 'p-3' : 'px-4 md:px-6 pb-6 pt-5'}`}>
                                            {link.type === 'agenda' ? (
                                                <div className="mb-6">
                                                    <div className="space-y-4 mb-6">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.titleLabel')}</label>
                                                            <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} className="w-full font-medium text-base text-black bg-white border-2 border-[#1a1a1a] px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 shadow-[0_2px_0_0_#1a1a1a]" placeholder={t('agenda.titlePlaceholder') || 'Título da Agenda'} />
                                                        </div>
                                                    </div>
                                                    <AgendaEditor link={link} onEventsChange={(events) => updateLink(link.id, 'events', events)} />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 pb-6">
                                                    {link.type === 'map' ? (
                                                        <div className="flex-[1.5] w-full">
                                                            <MapEditor link={link} updateLink={updateLink} />
                                                        </div>
                                                    ) : (
                                                        <div className="flex-[1.5] flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full">
                                                            {link.type !== 'collection' && link.type !== 'mediakit' && (
                                                                <div className="relative shrink-0">
                                                                    {link.image ? (
                                                                        <div className="w-14 h-14 md:w-16 md:h-16 overflow-hidden border-2 border-[#1a1a1a] bg-white relative group/img shadow-[0_2px_0_0_#1a1a1a]">
                                                                            <img
                                                                                src={link.image}
                                                                                alt="Thumbnail"
                                                                                className="w-full h-full object-cover"
                                                                                loading="lazy"
                                                                                decoding="async"
                                                                            />
                                                                            <div className="absolute inset-0 bg-white/90 opacity-100 md:opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white text-black hover:bg-black hover:text-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] transition-colors">
                                                                                    {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} strokeWidth={2} />}
                                                                                </button>
                                                                                <button onClick={() => updateLink(link.id, 'image', undefined)} className="p-1.5 bg-white text-black hover:bg-red-500 hover:text-white border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] transition-colors"><Trash2 size={14} strokeWidth={2} /></button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => fileInputRef.current?.click()}
                                                                            disabled={isUploadingImage}
                                                                            className="w-14 h-14 md:w-16 md:h-16 bg-white border-2 border-dashed border-[#1a1a1a] flex flex-col items-center justify-center text-black hover:bg-black hover:text-[#ffdf00] transition-all group/btn shadow-[0_4px_0_0_#1a1a1a] disabled:opacity-50"
                                                                        >
                                                                            {isUploadingImage ? <Loader2 size={18} className="animate-spin mb-0.5" /> : <ImageIcon size={18} className="mb-0.5" strokeWidth={2} />}
                                                                            <span className="text-[8px] font-medium uppercase tracking-widest">{isUploadingImage ? '...' : t('links.imageLabel')}</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="flex-1 min-w-0 space-y-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.titleLabel')}</label>
                                                                    <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} className="w-full font-medium text-base text-black bg-white border-2 border-[#1a1a1a] px-3 py-2.5 focus:bg-white outline-none transition-all placeholder:text-black/30 select-text shadow-[0_4px_0_0_#1a1a1a]" placeholder={link.type === 'header' ? t('links.sectionPlaceholder') : link.type === 'mediakit' ? t('mediakit.titlePlaceholder') || 'Título da Chamada' : t('links.titlePlaceholder')} />
                                                                </div>
                                                                {link.type !== 'header' && (
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{link.type === 'mediakit' ? t('mediakit.contactUrlLabel') || 'URL de Contato (Ex: WhatsApp, Email)' : t('links.urlLabel')}</label>
                                                                        <input type="text" value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} className="w-full text-xs font-medium uppercase tracking-widest text-black bg-white border-2 border-[#1a1a1a] px-3 py-2.5 focus:bg-white outline-none transition-all placeholder:text-black/30 select-text shadow-[0_4px_0_0_#1a1a1a]" placeholder={link.type === 'mediakit' ? t('mediakit.contactPlaceholder') || "https://wa.me/5511999999999" : "https://exemplo.com"} />
                                                                    </div>
                                                                )}
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.subtitleLabel')}</label>
                                                                    <input type="text" value={link.subtitle || ''} onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)} className="w-full text-xs font-normal uppercase tracking-wider text-black bg-white border-2 border-[#1a1a1a] px-3 py-2.5 focus:bg-white outline-none transition-all placeholder:text-black/30 shadow-[0_4px_0_0_#1a1a1a]" placeholder={link.type === 'mediakit' ? t('mediakit.subtitlePlaceholder') || 'Chamada para ação extra' : t('links.subtitlePlaceholder')} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {level === 0 && link.type !== 'mediakit' && (
                                                        <div className="flex-1 space-y-2">
                                                            <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.layoutLabel')}</label>
                                                            <div className="grid grid-cols-2 gap-3 max-w-[340px]">
                                                                {[
                                                                    { id: 'classic', label: t('links.layoutClassic') || 'Botão' },
                                                                    { id: 'card', label: t('links.layoutCard') || 'Card' },
                                                                    { id: 'social', label: t('links.layoutSocial') || 'Ícones' },
                                                                    { id: 'carousel', label: t('links.layoutCarousel') || 'Carousel' },
                                                                ].filter(opt => link.type === 'map' ? (opt.id === 'classic' || opt.id === 'card') : true).map((opt) => {
                                                                    const isActive = link.layout === opt.id;

                                                                    return (
                                                                        <button
                                                                            key={opt.id}
                                                                            onClick={() => updateLink(link.id, 'layout', opt.id)}
                                                                            className={`group relative flex flex-col items-center justify-between p-3 aspect-square border-2 border-[#1a1a1a] rounded-xl transition-all ${isActive ? 'bg-[#97cd7a] shadow-[0_6px_0_0_#1a1a1a] -translate-y-1' : 'bg-white hover:bg-[#f8f8f8] hover:-translate-y-0.5 shadow-[0_4px_0_0_#1a1a1a]'}`}
                                                                        >
                                                                            {isActive && (
                                                                                <div className="absolute top-1 right-1 w-4 h-4 bg-black flex items-center justify-center border border-[#1a1a1a] z-10 shadow-[0_1px_0_0_rgba(255,255,255,0.2)]">
                                                                                    <Check size={10} strokeWidth={2} className="text-[#97cd7a]" />
                                                                                </div>
                                                                            )}

                                                                            <div className="flex-1 flex items-center justify-center w-full mb-1 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                                                                                {opt.id === 'classic' && (
                                                                                    <svg viewBox="0 0 100 80" className="w-[85%] h-auto max-h-full drop-shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                                                                                        <rect x="5" y="25" width="90" height="30" fill="white" stroke="black" strokeWidth="6" rx="4" />
                                                                                        <rect x="15" y="32" width="16" height="16" fill="black" rx="2" />
                                                                                        <rect x="40" y="35" width="45" height="4" fill="black" rx="1" />
                                                                                        <rect x="40" y="44" width="25" height="4" fill="black" opacity="0.3" rx="1" />
                                                                                    </svg>
                                                                                )}
                                                                                {opt.id === 'card' && (
                                                                                    <svg viewBox="0 0 100 80" className="w-[85%] h-auto max-h-full drop-shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                                                                                        <rect x="30" y="5" width="40" height="70" fill="white" stroke="black" strokeWidth="6" rx="4" />
                                                                                        <rect x="30" y="5" width="40" height="35" fill="black" stroke="black" strokeWidth="6" rx="4" />
                                                                                        <rect x="38" y="52" width="24" height="4" fill="black" rx="1" />
                                                                                        <rect x="38" y="62" width="12" height="4" fill="black" opacity="0.3" rx="1" />
                                                                                    </svg>
                                                                                )}
                                                                                {opt.id === 'social' && (
                                                                                    <svg viewBox="0 0 100 80" className="w-[85%] h-auto max-h-full drop-shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                                                                                        <rect x="30" y="10" width="40" height="4" fill="black" opacity="0.1" rx="1" />
                                                                                        <rect x="20" y="18" width="60" height="3" fill="black" opacity="0.1" rx="1" />
                                                                                        <rect x="40" y="30" width="20" height="20" fill="white" stroke="black" strokeWidth="5" rx="4" />
                                                                                        <rect x="47" y="37" width="6" height="6" fill="black" opacity="0.2" rx="1" />
                                                                                        <rect x="10" y="60" width="80" height="6" fill="black" opacity="0.05" rx="1" />
                                                                                    </svg>
                                                                                )}
                                                                                {opt.id === 'carousel' && (
                                                                                    <svg viewBox="0 0 100 80" className="w-[85%] h-auto max-h-full drop-shadow-[2px_2px_0px_rgba(26,26,26,0.15)]">
                                                                                        <rect x="12" y="15" width="46" height="50" fill="white" stroke="black" strokeWidth="6" strokeLinejoin="round" rx="4" />
                                                                                        <rect x="12" y="15" width="46" height="30" fill="black" stroke="black" strokeWidth="6" strokeLinejoin="round" rx="4" />
                                                                                        <rect x="22" y="53" width="26" height="4" fill="black" rx="1" />
                                                                                        <rect x="68" y="15" width="46" height="50" fill="white" stroke="black" strokeWidth="6" strokeLinejoin="round" rx="4" />
                                                                                        <rect x="68" y="15" width="46" height="30" fill="black" opacity="0.3" stroke="black" strokeWidth="6" strokeLinejoin="round" rx="4" />
                                                                                    </svg>
                                                                                )}
                                                                            </div>

                                                                            <span className="text-[9px] font-bold uppercase tracking-tight text-black text-center leading-none mt-auto">
                                                                                {opt.label}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {level === 0 && link.type === 'mediakit' && (
                                                        <div className="flex-1 space-y-4 pt-4 mt-2 border-t border-[#1a1a1a] border-dashed">
                                                            {!(profile.planType === 'monthly' || profile.planType === 'annual') ? (
                                                                <div className="bg-slate-50 border-2 border-[#1a1a1a] p-8 text-center space-y-4 shadow-[0_3px_0_0_#1a1a1a]">
                                                                    <div className="w-16 h-16 bg-white border-2 border-[#1a1a1a] flex items-center justify-center mx-auto shadow-[0_2px_0_0_#1a1a1a]">
                                                                        <Lock size={32} className="text-black" strokeWidth={2} />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-2">{t('mediakit.locked')}</h3>
                                                                        <p className="text-[9px] text-black/50 font-semibold uppercase tracking-widest">{t('links.limitReachedDesc')}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); /* logic to open billing */ }}
                                                                        className="mt-2 text-[10px] font-bold uppercase tracking-widest bg-white border-2 border-[#1a1a1a] px-4 py-2 shadow-[0_2px_0_0_#1a1a1a] hover:bg-[#ffdf00] transition-all active:translate-y-[0.5px] active:shadow-none"
                                                                    >
                                                                        {t('links.seePlans')}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center justify-between px-1">
                                                                        <div className="flex items-end gap-3">
                                                                            <div>
                                                                                <label className="text-[10px] font-bold text-black uppercase tracking-[0.2em] flex items-center gap-1.5"><DollarSign size={14} strokeWidth={2} /> {t('mediakit.myPackages')}</label>
                                                                                <p className="text-[8px] font-medium text-black/50 uppercase tracking-widest mt-0.5">{t('mediakit.myPackagesDesc')}</p>
                                                                            </div>
                                                                            <div className="flex bg-black/[0.05] rounded-sm p-0.5 mb-0.5 border border-[#1a1a1a]/5">
                                                                                <button
                                                                                    onClick={() => updateLink(link.id, 'currency', 'BRL')}
                                                                                    className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm transition-all ${(!link.currency || link.currency === 'BRL') ? 'bg-white text-black shadow-[0_5px_0_0_#1a1a1a]' : 'text-black/30 hover:text-black'}`}
                                                                                >BRL</button>
                                                                                <button
                                                                                    onClick={() => updateLink(link.id, 'currency', 'USD')}
                                                                                    className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm transition-all ${link.currency === 'USD' ? 'bg-white text-black shadow-[0_5px_0_0_#1a1a1a]' : 'text-black/30 hover:text-black'}`}
                                                                                >USD</button>
                                                                            </div>
                                                                        </div>
                                                                        <button onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const defaultPrice = link.currency === 'USD' ? '$ 0.00' : 'R$ 0,00';
                                                                            const newPackage = { id: crypto.randomUUID(), clientId: crypto.randomUUID(), title: 'Publi Completa', subtitle: 'Ex: 1 Reel + 2 Stories', url: defaultPrice, isActive: true, layout: 'list' as const, type: 'link' as const };
                                                                            updateLink(link.id, 'children', [...(link.children || []), newPackage]);
                                                                        }} className="px-2 py-1.5 text-[9px] bg-white border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] text-black hover:bg-[#97cd7a] uppercase font-bold tracking-widest active:translate-y-[1px] active:shadow-none">+ {t('mediakit.addPackage') || t('common.add')}</button>
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        {(link.children || []).map((pkg, i) => (
                                                                            <div key={pkg.id} className="flex gap-3 p-3 bg-white border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] items-center group/pkg">
                                                                                <div className="flex-1 space-y-2">
                                                                                    <input type="text" value={pkg.title} onChange={(e) => {
                                                                                        const newChildren = [...(link.children || [])];
                                                                                        newChildren[i].title = e.target.value;
                                                                                        updateLink(link.id, 'children', newChildren);
                                                                                    }} className="w-full text-[11px] font-bold uppercase tracking-widest text-black border-b border-dashed border-[#1a1a1a]/20 pb-1 focus:border-[#1a1a1a] outline-none bg-transparent" placeholder={t('mediakit.packageTitlePlaceholder')} />
                                                                                    <input type="text" value={pkg.subtitle || ''} onChange={(e) => {
                                                                                        const newChildren = [...(link.children || [])];
                                                                                        newChildren[i].subtitle = e.target.value;
                                                                                        updateLink(link.id, 'children', newChildren);
                                                                                    }} className="w-full text-[9px] font-medium uppercase tracking-[0.1em] text-black/60 border-b border-dashed border-[#1a1a1a]/20 pb-1 focus:border-[#1a1a1a] outline-none bg-transparent" placeholder={t('mediakit.packageSubtitlePlaceholder')} />
                                                                                </div>
                                                                                <div className="w-[120px] shrink-0 flex flex-col items-end gap-1 px-1">
                                                                                    <input type="text" value={pkg.url} onChange={(e) => {
                                                                                        const newChildren = [...(link.children || [])];
                                                                                        newChildren[i].url = e.target.value;
                                                                                        updateLink(link.id, 'children', newChildren);
                                                                                    }} className="w-full text-base font-bold text-right border-b-2 border-[#1a1a1a] focus:border-[#1a1a1a] px-1 py-1 outline-none bg-transparent" placeholder={link.currency === 'USD' ? '$ 0.00' : 'R$ 0,00'} />
                                                                                    <button onClick={() => {
                                                                                        const newChildren = [...(link.children || [])];
                                                                                        newChildren.splice(i, 1);
                                                                                        updateLink(link.id, 'children', newChildren);
                                                                                    }} className="text-black/20 hover:text-red-500 transition-colors p-1"><Trash2 size={12} /></button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {(link.children?.length === 0 || !link.children) && (
                                                                            <div className="text-[9px] text-center p-6 border-2 border-dashed border-[#1a1a1a]/10 bg-black/5 text-black/40 uppercase tracking-[0.2em] font-bold">{t('mediakit.noPackages')}</div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 🛠️ Organized Settings Grid (Animations & PRO Features) */}
                                            {link.type !== 'header' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10 pt-8 mt-8 border-t border-[#1a1a1a] border-dashed items-start">

                                                    {/* 🎬 Section 1: Animations */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 px-1.5 bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] rounded-lg">
                                                                <Zap size={10} strokeWidth={3} className="text-black" />
                                                            </div>
                                                            <label className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">{t('links.animations')}</label>
                                                        </div>

                                                        <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-[#1a1a1a]/5 gap-1.5 overflow-visible">
                                                            {[
                                                                { id: 'soft', label: t('links.categorySoft').includes('links.') ? 'Suave' : t('links.categorySoft') },
                                                                { id: 'dynamic', label: t('links.categoryDynamic').includes('links.') ? 'Energia' : t('links.categoryDynamic') },
                                                                { id: 'special', label: t('links.categorySpecial').includes('links.') ? 'Efeitos' : t('links.categorySpecial') }
                                                            ].map(cat => (
                                                                <button
                                                                    key={cat.id}
                                                                    onClick={() => setAnimCategory(cat.id)}
                                                                    className={`flex-1 py-2 text-[8px] font-bold uppercase tracking-widest transition-all rounded-xl border-2 relative ${animCategory === cat.id ? 'bg-black text-[#ffdf00] border-black shadow-[0_2px_0_0_#1a1a1a] z-10' : 'bg-transparent text-black/40 border-transparent hover:text-black z-0'}`}
                                                                >
                                                                    {cat.label}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                                            {[
                                                                { id: 'none', label: t('links.animNone'), icon: Ban, cat: 'soft' },
                                                                { id: 'pulse', label: t('links.animPulse'), icon: Activity, cat: 'soft' },
                                                                { id: 'float', label: t('links.animFloat'), icon: Move, cat: 'soft' },
                                                                { id: 'heartbeat', label: t('links.animHeartbeat'), icon: Heart, cat: 'soft' },
                                                                { id: 'aura', label: t('links.animAura'), icon: Disc, cat: 'soft' },
                                                                { id: 'glow', label: t('links.animGlow'), icon: Sun, cat: 'soft' },

                                                                { id: 'bounce', label: t('links.animBounce'), icon: Zap, cat: 'dynamic' },
                                                                { id: 'shake', label: t('links.animShake'), icon: Smartphone, cat: 'dynamic' },
                                                                { id: 'tada', label: t('links.animTada'), icon: Sparkles, cat: 'dynamic' },
                                                                { id: 'jello', label: t('links.animJello'), icon: Package, cat: 'dynamic' },
                                                                { id: 'rubberBand', label: t('links.animRubber'), icon: PartyPopper, cat: 'dynamic' },
                                                                { id: 'vibrate', label: t('links.animVibrate'), icon: Vibrate, cat: 'dynamic' },
                                                                { id: 'wobble', label: t('links.animWobble'), icon: Waves, cat: 'dynamic' },

                                                                { id: 'spin', label: t('links.animSpin'), icon: RotateCw, cat: 'special' },
                                                                { id: 'flash', label: t('links.animFlash'), icon: Bolt, cat: 'special' },
                                                                { id: 'pendulum', label: t('links.animPendulum'), icon: RefreshCw, cat: 'special' },
                                                                { id: 'neon', label: t('links.animNeon'), icon: Lightbulb, cat: 'special' },
                                                                { id: 'spotlight', label: t('links.animSpotlight'), icon: Target, cat: 'special' },
                                                                { id: 'rainbow', label: t('links.animRainbow'), icon: Rainbow, cat: 'special' },
                                                                { id: 'glitch', label: t('links.animGlitch'), icon: ZapOff, cat: 'special' },
                                                                { id: 'ping', label: t('links.animPing'), icon: Radio, cat: 'special' }
                                                            ].filter(a => a.cat === animCategory).map((anim) => {
                                                                const AnimIcon = anim.icon;
                                                                const isSelected = (link.highlight || 'none') === anim.id;

                                                                return (
                                                                    <button
                                                                        key={anim.id}
                                                                        onClick={() => updateLink(link.id, 'highlight', anim.id as any)}
                                                                        className={`flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-2xl border-2 transition-all duration-200 group relative
                                                                            ${isSelected
                                                                                ? 'bg-[#ffdf00] border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] translate-y-[-1px]'
                                                                                : 'bg-white border-[#1a1a1a]/10 hover:border-[#1a1a1a] hover:shadow-[0_3px_0_0_#1a1a1a] text-black/40 hover:text-black hover:translate-y-[-1px]'}`}
                                                                    >
                                                                        <AnimIcon size={14} strokeWidth={isSelected ? 3 : 2} className={isSelected ? 'text-black' : 'text-black/30 group-hover:text-black'} />
                                                                        <span className={`text-[8px] font-bold uppercase tracking-wider ${isSelected ? 'text-black' : 'text-black/40 group-hover:text-black'}`}>
                                                                            {anim.label}
                                                                        </span>

                                                                        {isSelected && (
                                                                            <motion.div
                                                                                layoutId={`active-link-anim-${link.id}`}
                                                                                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black border border-white rounded-full z-10"
                                                                            />
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* 📅 Section 2: Scheduling (PRO) */}
                                                    {link.type !== 'agenda' && link.type !== 'mediakit' && (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-black uppercase tracking-[0.2em] px-1 bg-gradient-to-r from-[#ffdf00]/20 to-transparent">{t('links.schedule')} (PRO)</label>
                                                                {(!profile.planType || profile.planType === 'free') && (
                                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-[#ffdf00] to-[#ffd700] text-black border-2 border-[#1a1a1a] text-[9px] font-bold uppercase tracking-tight shadow-[0_2px_0_0_#1a1a1a] relative overflow-hidden rounded-lg">
                                                                        <motion.div
                                                                            animate={{ x: ['-200%', '200%'] }}
                                                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-0"
                                                                        />
                                                                        <span className="relative z-10">{t('links.locked')}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className={`p-4 border-2 shadow-[0_4px_0_0_#1a1a1a] rounded-3xl ${(!profile.planType || profile.planType === 'free') ? 'bg-slate-100 border-[#1a1a1a] opacity-60 pointer-events-none grayscale' : 'bg-white border-[#1a1a1a]'}`}>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-black">
                                                                            <div className={`w-2.5 h-2.5 border-2 border-[#1a1a1a] shadow-[0_1.5px_0_0_#1a1a1a] rounded-sm ${(link.scheduleStart && new Date(link.scheduleStart) > new Date()) ? 'bg-[#97cd7a]' : 'bg-white'}`}></div>
                                                                            {t('links.scheduleStart')}
                                                                        </div>
                                                                        <input type="datetime-local" value={link.scheduleStart ? new Date(new Date(link.scheduleStart).getTime() - new Date(link.scheduleStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={(e) => { const date = e.target.value ? new Date(e.target.value).toISOString() : null; updateLink(link.id, 'scheduleStart', date); }} disabled={!profile.planType || profile.planType === 'free'} className="w-full text-[10px] font-bold uppercase tracking-widest text-black bg-white border-2 border-[#1a1a1a] px-2 py-1.5 focus:bg-[#ffdf00] outline-none transition-all shadow-[0_2px_0_0_#1a1a1a] rounded-xl" />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-black">
                                                                            <div className={`w-2.5 h-2.5 border-2 border-[#1a1a1a] shadow-[0_1.5px_0_0_#1a1a1a] rounded-sm ${(link.scheduleEnd && new Date(link.scheduleEnd) < new Date()) ? 'bg-red-500' : 'bg-white'}`}></div>
                                                                            {t('links.scheduleEnd')}
                                                                        </div>
                                                                        <input type="datetime-local" value={link.scheduleEnd ? new Date(new Date(link.scheduleEnd).getTime() - new Date(link.scheduleEnd).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={(e) => { const date = e.target.value ? new Date(e.target.value).toISOString() : null; updateLink(link.id, 'scheduleEnd', date); }} disabled={!profile.planType || profile.planType === 'free'} className="w-full text-[10px] font-bold uppercase tracking-widest text-black bg-white border-2 border-[#1a1a1a] px-2 py-1.5 focus:bg-[#ffdf00] outline-none transition-all shadow-[0_2px_0_0_#1a1a1a] rounded-xl" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 🔐 Section 3: Password Protection (PRO) */}
                                                    {link.type !== 'agenda' && link.type !== 'mediakit' && (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-black uppercase tracking-[0.2em] px-1 bg-gradient-to-r from-[#ffdf00]/20 to-transparent">{t('passwordLink.toggle') || 'Proteger com Senha'} (PRO)</label>
                                                                {(!profile.planType || profile.planType === 'free') && (
                                                                    <span className="px-2 py-0.5 bg-gradient-to-r from-[#ffdf00] to-[#ffd700] text-black border-2 border-[#1a1a1a] text-[9px] font-bold uppercase tracking-tight shadow-[0_2px_0_0_#1a1a1a] relative overflow-hidden rounded-lg">
                                                                        <motion.div
                                                                            animate={{ x: ['-200%', '200%'] }}
                                                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-0"
                                                                        />
                                                                        <span className="relative z-10">{t('links.locked')}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className={`p-4 border-2 shadow-[0_4px_0_0_#1a1a1a] rounded-3xl ${(!profile.planType || profile.planType === 'free') ? 'bg-slate-100 border-[#1a1a1a] opacity-60 pointer-events-none grayscale' : 'bg-white border-[#1a1a1a]'}`}>
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateLink(link.id, 'isPasswordProtected', !link.isPasswordProtected)}
                                                                        className={`relative w-10 h-5 border-2 border-[#1a1a1a] transition-colors shadow-[0_1.5px_0_0_#1a1a1a] rounded-full ${link.isPasswordProtected ? 'bg-black' : 'bg-white'}`}
                                                                    >
                                                                        <div className={`absolute top-[1.5px] w-3 h-3 transition-all rounded-full ${link.isPasswordProtected ? 'left-[22px] bg-[#97cd7a]' : 'left-[2px] bg-black/30'}`} />
                                                                    </button>
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-black/70">
                                                                        {link.isPasswordProtected ? (t('passwordLink.enabled') || 'Ativado') : (t('passwordLink.disabled') || 'Desativado')}
                                                                    </span>
                                                                </div>
                                                                {link.isPasswordProtected && (
                                                                    <input
                                                                        type="password"
                                                                        value={(link as any).linkPassword || ''}
                                                                        onChange={e => updateLink(link.id, 'linkPassword' as any, e.target.value)}
                                                                        placeholder={t('passwordLink.placeholder') || 'Digite a senha...'}
                                                                        className="w-full text-[10px] font-medium uppercase tracking-widest text-black bg-white border-2 border-[#1a1a1a] px-2 py-1.5 focus:bg-[#ffdf00] outline-none transition-all shadow-[0_2px_0_0_#1a1a1a] rounded-xl"
                                                                        autoComplete="new-password"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-[#1a1a1a] border-dashed gap-4">
                                                <div className="flex items-center gap-2 text-black font-bold uppercase tracking-widest text-[10px] sm:shrink-0">
                                                    <BarChart2 size={14} strokeWidth={2} />
                                                    <span>{link.clicks || 0} {t('analytics.totalClicks').toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                    <button onClick={() => window.dispatchEvent(new CustomEvent('nodus:open-move-modal', { detail: { linkId: link.id } }))} className="flex-1 sm:flex-none px-2 sm:px-3 h-8 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white border-2 border-[#1a1a1a] text-black hover:bg-[#ffdf00] transition-all shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[0.5px] active:shadow-none">{t('links.moveTo')}</button>
                                                    <button onClick={() => updateLink(link.id, 'isArchived', !link.isArchived)} className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${link.isArchived ? 'bg-black border-[#1a1a1a] text-[#ffdf00] shadow-[0_2px_0_0_#1a1a1a]' : 'bg-white border-[#1a1a1a] text-black hover:bg-black hover:text-[#ffdf00] shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[0.5px] active:shadow-none'}`}>{link.isArchived ? t('links.restore') : t('links.archive')}</button>
                                                    <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className={`flex-1 sm:flex-none px-2 sm:px-3 h-8 border-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[0.5px] active:shadow-none ${showDeleteConfirm ? 'bg-red-500 border-[#1a1a1a] text-white' : 'bg-white border border-[#1a1a1a] text-black hover:bg-red-500 hover:text-white'}`}>{t('common.delete')}</button>
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
        </>
    );
}

export default SortableLinkItem;
