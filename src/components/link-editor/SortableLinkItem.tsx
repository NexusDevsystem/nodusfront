import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { LinkItem, UserProfile } from '../../types';
import { compressImage } from '../../utils/imageUtils';
import { fetchMusicMetadata } from '../../utils/musicUtils';
import { fetchYoutubeChannelInfo, fetchInstagramProfileInfo, fetchTiktokProfileInfo, isYoutubeChannelUrl, fetchSocialMetadata, isLinkIncomplete } from '../../utils/socialUtils';
import { SiSpotify } from 'react-icons/si';
import { apiClient } from '../../services/apiClient';
import AgendaEditor from '../AgendaEditor';
import MapEditor from '../MapEditor';
import MonetizationView from '../MonetizationView';
import { SOCIAL_NETWORKS } from '../../constants';
import DeezerIcon from '../icons/DeezerIcon';
import { IconPicker } from '../IconPicker';
import {
    Trash2, GripVertical, Plus, Image as ImageIcon, BarChart2, Pencil, Archive,
    LayoutGrid, LayoutTemplate, MessageCircle, FolderHeart, Zap, ChevronRight,
    ChevronDown, Folder, Sparkles, CreditCard, Youtube, Ban, X, User,
    ExternalLink, Share2, Check, DollarSign, Store, Smartphone, Mail, Type,
    Hash, Send as SendIcon, Columns2, Music, MapPin, ChevronUp,
    Calendar as CalendarIcon, Loader2, BarChart3, Lock, Hourglass,
    Activity, Sun, Waves, PartyPopper, Box as Package,
    Heart, RotateCw, Disc, RefreshCw,
    Move, Target, Lightbulb, Rainbow, ZapOff, Radio, Vibrate, Bolt, Instagram,
    AlertCircle, Link as LinkIcon, Layout, Grid
} from 'lucide-react'; // Standardized imports

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
    setProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
    isOnboarding?: boolean;
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
    setProfile,
    isOnboarding
}: SortableLinkItemProps) {
    const { t, i18n } = useTranslation();
    const isPT = i18n.language?.startsWith('pt');
    const dragControls = useDragControls();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [animCategory, setAnimCategory] = useState(() => {
        const h = link.highlight || 'none';
        if (['none', 'pulse', 'float', 'heartbeat', 'aura', 'glow'].includes(h)) return 'soft';
        if (['bounce', 'shake', 'tada', 'jello', 'rubberBand', 'vibrate', 'wobble'].includes(h)) return 'dynamic';
        return 'special';
    });
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
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

    const isDiscord = link.url?.toLowerCase().includes('discord.gg') || link.url?.toLowerCase().includes('discord.com/invite');

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
            const isInstagram = url.includes('instagram.com');
            const isTwitch = url.includes('twitch.tv');
            const isYoutubeChannel = isYoutubeChannelUrl(url);
            const isYoutubeVideo = (url.includes('youtube.com') || url.includes('youtu.be')) && !isYoutubeChannel;
            const isSocialProfile = (isTiktok && url.includes('@')) || isYoutubeChannel || isInstagram || isTwitch;


            const isSpotifyAlbum = isSpotify && (url.includes('/album/') || url.includes('/playlist/') || url.includes('spotify.link/'));
            const isDeezerAlbum = isDeezer && (url.includes('/album/') || url.includes('/playlist/') || url.includes('deezer.page.link/') || url.includes('link.deezer.com/'));
            const isMissingAlbumTracks = (isSpotifyAlbum || isDeezerAlbum) && !currentLink.children;
            const isDiscord = url.toLowerCase().includes('discord.gg') || url.toLowerCase().includes('discord.com/invite');

            // Trigger fetch if:
            // 1. Title is missing/generic
            // 2. OR it is a social profile currently stuck in 'tiktok' or 'youtube' embed type
            // 3. OR it is a Discord link and doesn't have the member stats yet
            // 4. OR it is a YouTube channel with no real subscriber data (subtitle is generic or missing)
            const hasGenericYtSubtitle = isYoutubeChannel && (
                !currentLink.subtitle ||
                /^canal do youtube$/i.test((currentLink.subtitle || '').trim()) ||
                /^youtube channel$/i.test((currentLink.subtitle || '').trim()) ||
                /^youtube$/i.test((currentLink.subtitle || '').trim()) ||
                !/inscritos|subscribers/i.test(currentLink.subtitle || '')
            );
            const hasGenericIgData = isInstagram && (
                currentLink.title === 'Instagram' ||
                !currentLink.title ||
                !currentLink.subtitle ||
                !/seguidores|followers/i.test(currentLink.subtitle || '') ||
                !currentLink.image
            );
            const hasGenericTiktokData = isTiktok && (
                ['TikTok', 'Tiktok'].includes(currentLink.title || '') ||
                !currentLink.title ||
                !currentLink.subtitle ||
                !/seguidores|followers/i.test(currentLink.subtitle || '') ||
                !currentLink.image
            );
            const hasGenericTwitchData = isTwitch && (
                currentLink.title === 'Twitch' ||
                !currentLink.title ||
                !currentLink.subtitle ||
                !/seguidores|followers/i.test(currentLink.subtitle || '') ||
                !currentLink.image
            );
            const needsAutoFetch = !currentLink.title ||
                currentLink.title === t('links.newLink') ||
                currentLink.title === t('links.noTitle') ||
                currentLink.title === t('links.unknownLink') ||
                (isSocialProfile && (['Instagram', 'TikTok', 'YouTube', 'Twitch'].includes(currentLink.title || '') || currentLink.embedType !== 'none')) ||
                isMissingAlbumTracks ||
                (isDiscord && (!currentLink.subtitle || !currentLink.subtitle.includes('○'))) ||
                hasGenericYtSubtitle ||
                hasGenericIgData ||
                hasGenericTiktokData ||
                hasGenericTwitchData;


            if (isYoutubeChannel && needsAutoFetch) {
                try {
                    const info = await fetchYoutubeChannelInfo(url);
                    if (info) {
                        const fresh = linkRef.current; // re-read after await
                        const updates: Partial<LinkItem> = {};
                        if (!fresh.title || fresh.title === t('links.newLink') || fresh.title === t('links.noTitle')) {
                            updates.title = info.name;
                        }
                        const isGenericSubtitle = !fresh.subtitle || 
                            /^canal do youtube$/i.test(fresh.subtitle.trim()) || 
                            /^youtube channel$/i.test(fresh.subtitle.trim()) ||
                            /^youtube$/i.test(fresh.subtitle.trim());
                        if (isGenericSubtitle && info.subscribers) updates.subtitle = info.subscribers;

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



            if ((isSpotify || isDeezer || isTiktok || isInstagram || isYoutubeVideo || isSocialProfile || isDiscord) && needsAutoFetch) {
                let type: 'spotify' | 'deezer' | 'tiktok' | 'instagram' | 'youtube' | 'none' = 'none';
                if (isSpotify) type = 'spotify';
                else if (isDeezer) type = 'deezer';
                else if (isTiktok) type = 'tiktok';
                else if (isInstagram) type = 'instagram';
                else if (isYoutubeVideo) type = 'youtube';

                try {
                    let metadata;
                    if (isSocialProfile || isInstagram || isTiktok) {
                        const meta = await fetchSocialMetadata(url);
                        if (meta) {
                            const fresh = linkRef.current;
                            const updates: Partial<LinkItem> = {};

                            // Update Title if generic
                            const platformName = isInstagram ? 'Instagram' : isYoutubeChannel ? 'YouTube' : isTwitch ? 'Twitch' : 'TikTok';
                            if (!fresh.title || fresh.title === t('links.newLink') || ['Instagram', 'TikTok', 'Tiktok', 'YouTube', 'Twitch'].includes(fresh.title) || fresh.title.toLowerCase().includes('on tiktok')) {
                                if (isTiktok && meta.username) {
                                    updates.title = `@${meta.username.replace('@', '')}`;
                                } else {
                                    updates.title = meta.name || meta.username || platformName;
                                }
                            }
                            
                            // Update Subtitle with followers
                            const currentSub = (fresh.subtitle || '').trim();
                            const isGenericSub = !currentSub || 
                                /^perfil do/i.test(currentSub) || 
                                /profile$/i.test(currentSub) ||
                                /^@[\w\.]+$/i.test(currentSub) ||
                                currentSub.toLowerCase() === platformName.toLowerCase() ||
                                currentSub.toLowerCase().includes('seguidores');

                            if (isGenericSub && meta.subscribers) {
                                updates.subtitle = meta.subscribers;
                            }

                            if (meta.platform) {
                                updates.platform = meta.platform as any;
                            }


                            // Update Image if missing
                            if (!fresh.image && meta.avatarUrl) {
                                try {
                                    const proxyRes = await apiClient.proxyUploadAsset(meta.avatarUrl);
                                    updates.image = (proxyRes.success && proxyRes.file?.url) ? proxyRes.file.url : meta.avatarUrl;
                                } catch (e) {
                                    updates.image = meta.avatarUrl;
                                }
                            }

                            if (Object.keys(updates).length > 0) {
                                updateLinkFields(link.id, updates);
                            }
                        }
                        return;
                    }

                    if (isTiktok && !isSocialProfile) {
                        metadata = await fetchMusicMetadata(url);
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

                    if (isDiscord) {
                        try {
                            console.log('[DiscordFetch] Fetching info for:', url);
                            const discordInfo = await apiClient.getDiscordInfo(url);
                            console.log('[DiscordFetch] Data received:', discordInfo);
                            const fresh = linkRef.current;
                            const updates: Partial<LinkItem> = {};

                            const lowerTitle = (fresh.title || '').toLowerCase();
                            const isGenericTitle = !fresh.title || 
                                fresh.title === t('links.newLink') || 
                                fresh.title === t('links.noTitle') || 
                                lowerTitle === 'discord' || 
                                lowerTitle === 'discord server' ||
                                lowerTitle === 'servidor';

                            if (isGenericTitle && discordInfo.name) {
                                updates.title = discordInfo.name;
                            }

                            // Format exactly like the preview card button
                            const memberText = `● ${discordInfo.online.toLocaleString()} ONLINE ○ ${discordInfo.total.toLocaleString()}`;
                            
                            // Force update if subtitle is empty or doesn't have the circle symbol
                            if (!fresh.subtitle || !fresh.subtitle.includes('○')) {
                                updates.subtitle = memberText;
                            }

                            if (discordInfo.icon && !fresh.image) {
                                updates.image = discordInfo.icon;
                            }

                            if (fresh.embedType !== 'discord') {
                                updates.embedType = 'discord';
                            }

                            if (Object.keys(updates).length > 0) {
                                console.log('[DiscordFetch] Applying updates:', updates);
                                updateLinkFields(link.id, updates);
                            }
                        } catch (e) {
                            console.error('[SortableLinkItem] Discord fetch error:', e);
                        }
                        return;
                    }

                    if (linkRef.current.embedType !== type) {
                        updateLinkFields(link.id, { embedType: type });
                    }

                    metadata = await fetchMusicMetadata(url);
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

                        if (Object.keys(updates).length > 0) {
                            updateLinkFields(link.id, updates);
                        }
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
        if (link.type === 'incentives') {
            return <DollarSign size={iconSize} strokeWidth={3} />;
        }
        const network = SOCIAL_NETWORKS.find(n => n.id === link.platform) ||
            SOCIAL_NETWORKS.find(n => link.url?.toLowerCase().includes(n.id)) ||
            SOCIAL_NETWORKS.find(n => link.title?.toLowerCase().includes(n.id));
        const Icon = network?.icon;
        return Icon ? <Icon size={iconSize} /> : <ImageIcon size={iconSize} strokeWidth={3} />;
    };

    const isIncomplete = isLinkIncomplete(link.url || '', link.platform);

    const renderLinkTags = () => (
        <>
            {link.scheduleStart && new Date(link.scheduleStart) > new Date() && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#97cd7a] text-[8px] font-medium text-black border-2 border-black uppercase flex items-center gap-1 shadow-[0_2.5px_0_0_#000]">
                    {t('links.scheduled').toUpperCase()}
                </span>
            )}
            {link.scheduleEnd && new Date(link.scheduleEnd) < new Date() && (
                <span className="shrink-0 px-1.5 py-0.5 bg-red-400 text-[8px] font-medium text-black border-2 border-black uppercase flex items-center gap-1 shadow-[0_2.5px_0_0_#000]">
                    {t('links.expired').toUpperCase()}
                </span>
            )}
            {(link.embedType === 'youtube' || link.platform === 'youtube' || link.url?.includes('youtube.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#ff0000] text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">YOUTUBE</span>
            )}
            {(link.embedType === 'tiktok' || link.platform === 'tiktok' || link.url?.includes('tiktok.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#FE2C55] text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">TIKTOK</span>
            )}
            {(link.platform === 'twitch' || link.url?.includes('twitch.tv')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#6441a5] text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">TWITCH</span>
            )}
            {(link.embedType === 'discord' || link.platform === 'discord' || link.url?.includes('discord.gg') || link.url?.includes('discord.com/invite')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#5865F2] text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">DISCORD</span>
            )}
            {(link.platform === 'kick' || link.url?.toLowerCase().includes('kick.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#53FC18] text-[8px] font-medium text-black border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">KICK</span>
            )}
            {(link.platform === 'instagram' || link.url?.includes('instagram.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#E1306C] text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">INSTAGRAM</span>
            )}
            {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.includes('spotify.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">SPOTIFY</span>
            )}
            {(link.embedType === 'deezer' || link.platform === 'deezer' || link.url?.includes('deezer.com')) && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#A238FF] text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">DEEZER</span>
            )}
        </>
    );

    const renderTypeLabel = () => {
        if (link.type === 'header') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-white text-[9px] md:text-[10px] font-bold text-black border-2 border-black uppercase shadow-[0_2.5px_0_0_#000] leading-none italic">{t('links.headerLabel')}</span>;
        if (link.type === 'map' || link.title?.toLowerCase() === 'localização') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#ffdf00] text-[9px] md:text-[10px] font-bold text-black border-2 border-black uppercase shadow-[0_2.5px_0_0_#000] leading-none italic">{t('links.mapLabelMobile').toUpperCase()}</span>;
        if (link.type === 'agenda') return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-bold text-black border-2 border-black uppercase shadow-[0_2.5px_0_0_#000] leading-none italic">{t('links.agendaTag').toUpperCase()}</span>;
        if (link.type === 'mediakit') return (
            <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-bold text-black border-2 border-black uppercase shadow-[0_2.5px_0_0_#000] leading-none italic">
                {t('mediakit.title')?.toUpperCase() || 'MÍDIA KIT'}
            </span>
        );
        if (link.type === 'incentives') return (
            <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#ffdf00] text-[9px] md:text-[10px] font-bold text-black border-2 border-black uppercase shadow-[0_2.5px_0_0_#000] leading-none italic">
                {t('links.incentives')?.toUpperCase() || 'MONETIZAÇÃO'}
            </span>
        );
        if (link.layout === 'social' || (link.platform && !['custom', 'site', 'telefone', 'email'].includes(link.platform))) return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-white text-[9px] md:text-[10px] font-bold text-black border-2 border-black uppercase shadow-[0_2.5px_0_0_#000] leading-none italic">{t('links.mergedTag').toUpperCase()}</span>;
        return <span className="shrink-0 px-1.5 py-0.5 md:px-2 md:py-1 bg-[#97cd7a] text-[9px] md:text-[10px] font-bold text-black border-2 border-black uppercase shadow-[0_2.5px_0_0_#000] leading-none italic">{t('links.linkLabel').toUpperCase()}</span>;
    };


    const ToggleSwitch = () => (
        <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={link.isActive} onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)} className="sr-only peer" />
            <div className="w-12 h-6 border-2 border-black bg-white rounded-full transition-all duration-300 peer-checked:bg-[#97cd7a] shadow-[2.5px_2.5px_0_0_#000] hover:translate-x-[0.5px] hover:translate-y-[0.5px] peer-active:shadow-none peer-active:translate-y-[2.5px] after:content-[''] after:absolute after:top-[2.5px] after:left-[4px] after:bg-white after:border-2 after:border-black after:w-4 after:h-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
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
                className={`relative border-2 ${isIncomplete && link.type === 'link' && !link.isArchived
                        ? 'border-red-500 shadow-[4px_4px_0_0_#991b1b] bg-red-500' // Red if incomplete
                        : isCollection
                            ? 'border-[#fef08a] shadow-[4px_4px_0_0_#d9c84a] bg-[#fef08a]'
                            : 'border-[#97cd7a] shadow-[4px_4px_0_0_#76a45f] bg-[#97cd7a]'
                    } rounded-xl ${(!isExpanded && !isCollectionExpanded) ? 'mb-3' : ''} select-none ${(!isExpanded && !isCollectionExpanded) ? 'cursor-target' : ''}`}
                whileDrag={{ zIndex: 50, borderRadius: '12px' }}
                style={{ willChange: 'transform' }}
            >
                <div className={`transition-all duration-300 rounded-[12px] overflow-hidden ${level === 0 && isAnyExpanded && !isExpanded && !isCollectionExpanded ? 'opacity-40' : 'opacity-100'} ${isIncomplete && link.type === 'link' && !link.isArchived
                        ? 'bg-red-500'
                        : isCollection ? 'bg-[#fef08a]' : 'bg-[#97cd7a]'
                    }`}>
                    {isCollection ? (
                        /* COLLECTION ITEM */
                        <div className="overflow-hidden">
                            <div className={`flex border-b ${isCollection ? 'border-[#fef08a]' : 'border-black'} items-stretch ${itemSize}`}>
                                <div
                                    className={`${dragHandleSize} flex items-center justify-center cursor-move text-black ${isCollectionExpanded ? 'bg-black/10' : 'bg-[#fef08a]'} touch-none border-r-2 ${isCollection ? 'border-[#fef08a]' : 'border-black'} transition-colors`}
                                    onPointerDown={(e) => dragControls.start(e)}
                                >
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                                </div>
                                <div className="flex-1 flex flex-col min-w-0 bg-[#fdfcf0]">
                                    {/* Top Row: Title & Toggle */}
                                    <div
                                        onClick={() => toggleCollection(link.id)}
                                        className="flex items-start justify-between p-2 pb-1 md:p-4 md:pb-2 cursor-pointer group"
                                    >
                                        <div className="flex-1 flex flex-col min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="flex-1 font-bold text-black uppercase tracking-[0.1em] text-sm md:text-base truncate leading-tight">
                                                    {link.title || t('links.collectionUnnamed')}
                                                </div>
                                                <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-black text-[#fef08a] border-2 border-black text-[8px] font-black uppercase tracking-widest shadow-[0_2px_0_0_#000] italic rounded-xl">
                                                    <FolderHeart size={10} strokeWidth={3} />
                                                    {isPT ? 'Coleção' : 'Collection'}
                                                </div>
                                                {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.toLowerCase().includes('spotify.com')) && (
                                                    <span className="shrink-0 px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border-2 border-black uppercase flex items-center gap-1 shadow-[0_2.5px_0_0_#000]">SPOTIFY</span>
                                                )}
                                                {(link.embedType === 'deezer' || link.platform === 'deezer' || link.url?.toLowerCase().includes('deezer.com')) && (
                                                    <span className="shrink-0 px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border-2 border-black uppercase flex items-center gap-1 shadow-[0_2.5px_0_0_#000]">DEEZER</span>
                                                )}
                                                {(link.platform === 'kick' || link.url?.toLowerCase().includes('kick.com')) && (
                                                    <span className="shrink-0 px-1.5 py-0.5 bg-[#53FC18] text-[8px] font-medium text-black border-2 border-black uppercase flex items-center gap-1 shadow-[0_2.5px_0_0_#000]">KICK</span>
                                                )}
                                            </div>
                                            <div className="text-[10px] md:text-[11px] font-medium text-black/40 uppercase tracking-widest truncate">
                                                {link.children?.length || 0} {(link.children?.length === 1) ? t('links.itemConfigured') : t('links.itemsConfigured')}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 md:gap-4 shrink-0 pl-4">
                                            <div className="text-black/30 group-hover:text-black transition-colors shrink-0">
                                                {isCollectionExpanded ? <ChevronDown size={iconSize} strokeWidth={2.5} /> : <ChevronRight size={iconSize} strokeWidth={2.5} />}
                                            </div>
                                            <ToggleSwitch />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-2 pb-2 md:px-4 md:pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] md:text-[11px] font-bold text-black/40 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                                <BarChart2 size={12} strokeWidth={2.5} />
                                                {link.clicks || 0} CLICKS
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('nodus:open-move-modal', { detail: { linkId: link.id } })); }}
                                                className="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-slate-50 transition-all rounded-md"
                                                title={t('links.moveTo')}
                                            >
                                                <Move size={isMobile ? 18 : 20} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateLink(link.id, 'isArchived', !link.isArchived); }}
                                                className={`p-1.5 transition-all rounded-md hover:bg-slate-50 ${link.isArchived ? 'text-black' : 'text-amber-500 hover:text-amber-600'}`}
                                                title={link.isArchived ? t('links.restore') : t('links.archive')}
                                            >
                                                {link.isArchived ? <RefreshCw size={isMobile ? 18 : 20} strokeWidth={2.5} className="animate-pulse" /> : <Archive size={isMobile ? 18 : 20} strokeWidth={2.5} />}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                                                className={`p-1.5 transition-all rounded-xl hover:bg-red-50 ${showDeleteConfirm ? 'text-red-600' : 'text-red-500 hover:text-red-600'}`}
                                            >
                                                <Trash2 size={isMobile ? 18 : 20} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Collection Content */}
                            <AnimatePresence>
                                {isCollectionExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden bg-[#fdfcf0] border-t border-[#fef08a]"
                                    >
                                        <div className="px-1.5 md:px-3 py-3 md:py-4 space-y-3 md:space-y-4">
                                            {/* Collection Basic Info & Layout */}
                                            <div className="flex flex-col md:flex-row gap-6 md:gap-10 pb-6">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2 px-1 mb-1">
                                                        <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em]">{t('links.collectionName')}</label>
                                                        {(link.embedType === 'spotify' || link.platform === 'spotify' || link.url?.includes('spotify.com')) && (
                                                            <div className="flex items-center gap-1.5 ml-auto">
                                                                <SiSpotify className="text-[#1DB954]" size={14} />
                                                                <span className="px-1.5 py-0.5 bg-[#1DB954] text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">SPOTIFY</span>
                                                            </div>
                                                        )}
                                                        {(link.embedType === 'deezer' || link.platform === 'deezer' || link.url?.includes('deezer.com')) && (
                                                            <div className="flex items-center gap-1.5 ml-auto">
                                                                <DeezerIcon size={14} />
                                                                <span className="px-1.5 py-0.5 bg-black text-[8px] font-medium text-white border-2 border-black uppercase shadow-[0_2.5px_0_0_#000]">DEEZER</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={link.title}
                                                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                                                        className="w-full font-medium text-sm text-black bg-white border-2 border-black px-3 py-2.5 focus:bg-white outline-none transition-all placeholder:text-black/30 shadow-[2.5px_2.5px_0_0_#000] rounded-xl"
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
                                                                    className={`group relative flex flex-col items-center justify-between p-3 aspect-square border-2 border-black rounded-xl transition-all ${isActive ? 'bg-[#ffdf00] shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white hover:bg-[#f8f8f8] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1.5px_1.5px_0_0_#000] shadow-[2.5px_2.5px_0_0_#000]'}`}
                                                                >
                                                                    {isActive && (
                                                                        <div className="absolute top-1 right-1 w-4 h-4 bg-black flex items-center justify-center border border-black rounded-xl z-10 shadow-[0_1px_0_0_rgba(255,255,255,0.2)]">
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
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-6 border-t border-[#fef08a] border-dashed gap-4">
                                                <div className="flex items-center gap-2 text-black font-bold uppercase tracking-widest text-[10px] sm:shrink-0">
                                                    <BarChart2 size={14} strokeWidth={2} />
                                                    <span>{link.clicks || 0} {t('analytics.totalClicks').toUpperCase()}</span>
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
                                                        setProfile={setProfile}
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
                            <div className="flex items-stretch bg-transparent">
                                {/* Drag Handle - Full Height */}
                                <div
                                    className={`${dragHandleSize} flex items-center justify-center cursor-move text-black border-r-2 ${isIncomplete && link.type === 'link' && !link.isArchived
                                            ? 'border-red-500 bg-red-500'
                                            : 'border-[#97cd7a] bg-[#97cd7a]'
                                        } touch-none transition-colors`}
                                    onPointerDown={(e) => dragControls.start(e)}
                                >
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                                </div>

                                <div className="flex-1 flex flex-col min-w-0 bg-[#fdfcf0]">
                                    {/* Top Row: Title & Toggle */}
                                    <div
                                        onClick={() => toggleLink(link.id)}
                                        className="flex items-start justify-between p-2 pb-1 md:p-4 md:pb-2 cursor-pointer group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <h3 className="font-black text-[13px] md:text-[14px] text-black uppercase tracking-tight truncate flex items-center gap-2">
                                                    {link.title || (link.type === 'header' ? t('links.headerItem') : t('links.untitled'))}
                                                    {isIncomplete && link.type === 'link' && !link.isArchived && (
                                                        <motion.div
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="text-red-500 shrink-0"
                                                            title={t('social.incompleteLink') || 'Link Incompleto'}
                                                        >
                                                            <AlertCircle size={14} strokeWidth={3} className="animate-pulse" />
                                                        </motion.div>
                                                    )}
                                                    {link.type === 'incentives' && (
                                                        <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-black text-[#ffdf00] border-2 border-black text-[7px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] rounded-sm italic ml-1">
                                                            <Zap size={8} strokeWidth={4} />
                                                            {isPT ? 'MONETIZAÇÃO' : 'MONETIZATION'}
                                                        </div>
                                                    )}
                                                    {link.type === 'agenda' && (
                                                        <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-black text-[#97cd7a] border-2 border-black text-[7px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] rounded-sm italic ml-1">
                                                            <CalendarIcon size={8} strokeWidth={4} />
                                                            {isPT ? 'AGENDA' : 'AGENDA'}
                                                        </div>
                                                    )}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] md:text-[11px] text-black/40 font-bold uppercase tracking-widest truncate max-w-[80%]">
                                                    {link.type === 'header' ? t('links.separatorText') : (link.url || t('links.yourNetworks'))}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 pl-4">
                                            <div className={`px-2 py-1 border-2 border-black rounded-lg text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] transition-colors ${link.isActive ? 'bg-[#97cd7a]' : 'bg-white text-black/30'}`}>
                                                {link.isActive ? 'LIVE' : 'OFF'}
                                            </div>
                                            <ToggleSwitch />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-2 pb-2 md:px-4 md:pb-3">
                                        <div className="flex items-center gap-4 md:gap-7 text-black/30">
                                            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-medium uppercase tracking-widest text-black/40">
                                                <BarChart2 size={iconSize - 4} strokeWidth={2} />
                                                <span>{link.clicks || 0} CLICKS</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('nodus:open-move-modal', { detail: { linkId: link.id } })); }}
                                                className="w-9 h-9 flex items-center justify-center text-indigo-500 hover:bg-indigo-500/10 transition-all rounded-xl"
                                                title={t('links.moveTo')}
                                            >
                                                <Move size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateLink(link.id, 'isArchived', !link.isArchived); }}
                                                className={`w-9 h-9 flex items-center justify-center transition-all rounded-xl ${link.isArchived ? 'bg-black text-[#ffdf00]' : 'text-amber-500 hover:bg-amber-500/10'}`}
                                                title={link.isArchived ? t('links.restore') : t('links.archive')}
                                            >
                                                <Archive size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                                                className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all rounded-xl"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Body */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`overflow-hidden bg-[#fdfcf0] border-t border-dashed ${isIncomplete && link.type === 'link' && !link.isArchived
                                                ? 'border-red-500'
                                                : 'border-[#97cd7a]'
                                            }`}
                                    >
                                        <div className={`${level > 0 ? 'p-3' : 'px-4 md:px-6 pb-6 pt-5'}`}>
                                            {link.type === 'agenda' ? (
                                                <div className="mb-6">
                                                    <div className="space-y-4 mb-6">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.titleLabel')}</label>
                                                            <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} className="w-full font-medium text-base text-black bg-white border-2 border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 shadow-[0_2.5px_0_0_#000]" placeholder={t('agenda.titlePlaceholder') || 'Título da Agenda'} />
                                                        </div>
                                                    </div>
                                                    <AgendaEditor link={link} onEventsChange={(events) => updateLink(link.id, 'events', events)} />
                                                </div>
                                            ) : link.type === 'incentives' ? (
                                                <div className="mb-6">
                                                    <div className="space-y-4 mb-8">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('links.titleLabel')}</label>
                                                            <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} className="w-full font-medium text-base text-black bg-white border-2 border-black px-3 py-2 focus:bg-[#f1f1f1] outline-none transition-all placeholder:text-black/30 shadow-[0_2.5px_0_0_#000]" placeholder={t('links.incentives') || 'Monetização'} />
                                                        </div>
                                                        <div className="mt-8 border-t-2 border-black/5 pt-6">
                                                            <MonetizationView
                                                                profile={profile}
                                                                onChange={(newProfile) => {
                                                                    if (setProfile) setProfile(newProfile);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 pb-6">
                                                    <>
                                                        {link.type === 'map' ? (
                                                            <div className="flex-[1.5] w-full">
                                                                <MapEditor link={link} updateLink={updateLink} />
                                                            </div>
                                                        ) : (
                                                            <div className="flex-[1.5] flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full">
                                                                {link.type !== 'collection' && link.type !== 'mediakit' && (
                                                                    <div className="relative shrink-0 flex flex-col items-center gap-4">
                                                                        <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">{t('links.visuals') || 'Visual'}</label>
                                                                        
                                                                        <div className="flex flex-col gap-4">
                                                                            {/* 🖼️ Image Thumbnail */}
                                                                            <div className="relative group/thumb">
                                                                                {link.image ? (
                                                                                    <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden border-2 border-black bg-white relative shadow-[0_4px_0_0_#000] rounded-xl transition-transform hover:scale-[1.02]">
                                                                                        <img src={link.image} alt={link.title} className="w-full h-full object-cover" />
                                                                                        <div className="absolute inset-0 bg-white/95 opacity-0 group-hover/thumb:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 px-2">
                                                                                            <button 
                                                                                                onClick={() => fileInputRef.current?.click()} 
                                                                                                className="p-2 bg-white border-2 border-black hover:bg-[#ffdf00] shadow-[0_2px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-xl"
                                                                                                title={t('links.changeImage')}
                                                                                            >
                                                                                                {isUploadingImage ? <Loader2 size={16} className="animate-spin text-black" /> : <Pencil size={16} strokeWidth={3} className="text-black" />}
                                                                                            </button>
                                                                                            <button 
                                                                                                onClick={() => updateLink(link.id, 'image', undefined)} 
                                                                                                className="p-2 bg-white border-2 border-black text-black hover:bg-red-500 hover:text-white shadow-[0_2px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-xl"
                                                                                                title={t('links.remove')}
                                                                                            >
                                                                                                <Trash2 size={16} strokeWidth={3} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => fileInputRef.current?.click()}
                                                                                        disabled={isUploadingImage}
                                                                                        className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-dashed border-black/20 flex flex-col items-center justify-center text-black/30 hover:text-black hover:bg-[#ffdf00]/10 hover:border-black transition-all group/btn shadow-[0_4px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_4px_0_0_#000] disabled:opacity-50 rounded-xl"
                                                                                    >
                                                                                        {isUploadingImage ? (
                                                                                            <Loader2 size={24} className="animate-spin mb-1 text-black" />
                                                                                        ) : (
                                                                                            <div className="flex flex-col items-center gap-1.5">
                                                                                                <ImageIcon size={20} strokeWidth={2.5} />
                                                                                                <span className="text-[8px] font-black uppercase tracking-widest">{t('links.imageLabel')}</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </button>
                                                                                )}
                                                                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                                                            </div>

                                                                            {/* 🎨 Icon Picker Trigger */}
                                                                            <button
                                                                                onClick={() => setShowIconPicker(true)}
                                                                                className={`group relative w-20 h-10 md:w-24 md:h-12 border-2 border-black rounded-xl flex items-center justify-center transition-all ${link.icon ? 'bg-[#ffdf00] shadow-[0_3px_0_0_#000] -translate-y-0.5' : 'bg-white hover:bg-slate-50 shadow-[0_3px_0_0_#000] active:translate-y-[1px] active:shadow-none'}`}
                                                                            >
                                                                                {link.icon ? (
                                                                                    <div className="text-black flex items-center gap-1">
                                                                                        {React.createElement((LucideIcons as any)[link.icon] || Grid, { size: 18, strokeWidth: 2.5 })}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex items-center gap-1.5 text-black/20 group-hover:text-black/40 transition-colors">
                                                                                        <Grid size={16} strokeWidth={2.5} />
                                                                                        <span className="text-[8px] font-black uppercase tracking-widest">Ícone</span>
                                                                                    </div>
                                                                                )}
                                                                                {link.icon && (
                                                                                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-white">
                                                                                        <Check size={8} className="text-white" strokeWidth={4} />
                                                                                    </div>
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="flex-1 min-w-0 flex flex-col gap-8">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                                                                <Type size={12} strokeWidth={3} className="text-black/30" />
                                                                                {t('links.titleLabel')}
                                                                            </label>
                                                                            <input 
                                                                                type="text" 
                                                                                value={link.title} 
                                                                                onChange={(e) => updateLink(link.id, 'title', e.target.value)} 
                                                                                className="w-full font-bold text-sm md:text-base text-black bg-white border-2 border-black px-5 py-4 md:py-4.5 focus:bg-white focus:ring-4 focus:ring-[#ffdf00]/10 outline-none transition-all placeholder:text-black/20 select-text shadow-[0_4px_0_0_#000] rounded-xl" 
                                                                                placeholder={link.type === 'header' ? t('links.sectionPlaceholder') : link.type === 'mediakit' ? t('mediakit.titlePlaceholder') || 'Título da Chamada' : t('links.titlePlaceholder')} 
                                                                            />
                                                                        </div>
                                                                        
                                                                        {link.type !== 'header' && (
                                                                            <div className="space-y-2">
                                                                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                                                                    <LinkIcon size={12} strokeWidth={3} className="text-black/30" />
                                                                                    {link.type === 'mediakit' ? t('mediakit.contactUrlLabel') || 'URL de Contato' : t('links.urlLabel')}
                                                                                </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    value={link.url} 
                                                                                    onChange={(e) => updateLink(link.id, 'url', e.target.value)} 
                                                                                    className={`w-full text-[11px] md:text-xs font-bold uppercase tracking-widest text-black bg-white border-2 px-5 py-4 md:py-4.5 focus:bg-white focus:ring-4 focus:ring-[#ffdf00]/10 outline-none transition-all placeholder:text-black/20 select-text shadow-[0_4px_0_0_#000] rounded-xl ${isIncomplete ? 'border-red-500 bg-red-50/10' : 'border-black'}`} 
                                                                                    placeholder={link.type === 'mediakit' ? t('mediakit.contactPlaceholder') || "https://wa.me/..." : "https://exemplo.com"} 
                                                                                />
                                                                                {isIncomplete && link.type === 'link' && (
                                                                                    <motion.div
                                                                                        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                                                                                        className="px-1 flex items-center gap-1.5 text-red-500 font-black text-[8px] uppercase tracking-wider mt-1.5"
                                                                                    >
                                                                                        <AlertCircle size={10} strokeWidth={3} />
                                                                                        {t('social.incompleteLinkHint')}
                                                                                    </motion.div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center justify-between px-1">
                                                                            <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                                                <Pencil size={12} strokeWidth={3} className="text-black/30" />
                                                                                {t('links.subtitleLabel')}
                                                                            </label>
                                                                            {isDiscord && (
                                                                                <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2 bg-[#5865F2] border-2 border-black px-3 py-1 shadow-[0_2px_0_0_#000] rounded-lg">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                                                    {t('social.discordSynced') || 'Sincronizado'}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                         <div className="relative group">
                                                                            <textarea 
                                                                                value={link.subtitle || ''} 
                                                                                onChange={(e) => !isDiscord && updateLink(link.id, 'subtitle', e.target.value)} 
                                                                                readOnly={!!isDiscord}
                                                                                rows={3}
                                                                                style={{ resize: 'none' }}
                                                                                className={`w-full text-xs font-bold uppercase tracking-wider text-black border-2 border-black px-4 py-4 md:py-4.5 outline-none transition-all placeholder:text-black/20 shadow-[0_4px_0_0_#000] rounded-xl ${isDiscord ? 'bg-white cursor-not-allowed select-none' : 'bg-white focus:bg-white focus:ring-4 focus:ring-[#ffdf00]/10'}`} 
                                                                                placeholder={link.type === 'mediakit' ? t('mediakit.subtitlePlaceholder') || 'Chamada para ação extra' : t('links.subtitlePlaceholder')} 
                                                                            />
                                                                            {isDiscord && (
                                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-black/10">
                                                                                    <Lock size={16} strokeWidth={3} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {(link.platform === 'instagram' || link.url?.includes('instagram.com')) && (
                                                                        <div className="pt-4 border-t border-[#000]/5 mt-4">
                                                                            <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] px-1 mb-4 flex items-center gap-2">
                                                                                <Instagram size={14} strokeWidth={3} className="text-black/30" />
                                                                                {t('links.instagramLayout') || 'Estilo de Exibição'}
                                                                            </label>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[500px]">
                                                                                {[
                                                                                    { id: 'classic', label: 'LISTA SIMPLES', desc: 'Apenas link e seguidores', icon: 'list' },
                                                                                    { id: 'card', label: 'FEED DE POSTS', desc: 'Visual premium com posts', icon: 'grid' },
                                                                                ].map((opt) => {
                                                                                    const isActive = opt.id === 'card' ? link.layout === 'card' : link.layout !== 'card';
                                                                                    return (
                                                                                        <button
                                                                                            key={opt.id}
                                                                                            onClick={() => updateLink(link.id, 'layout', opt.id)}
                                                                                            className={`group relative flex items-center gap-4 p-4 border-2 border-black rounded-xl transition-all ${isActive ? 'bg-[#ffdf00] shadow-[0_4px_0_0_#000] -translate-y-0.5' : 'bg-white hover:bg-[#f8f8f8] shadow-[0_4px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_4px_0_0_#000] hover:-translate-y-0.5'}`}
                                                                                        >
                                                                                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 border-black ${isActive ? 'bg-white' : 'bg-slate-50'}`}>
                                                                                                {opt.id === 'classic' ? <LinkIcon size={18} strokeWidth={3} /> : <Grid size={18} strokeWidth={3} />}
                                                                                            </div>
                                                                                            <div className="flex flex-col items-start text-left">
                                                                                                <span className="text-[10px] font-black uppercase tracking-tight text-black leading-none">{opt.label}</span>
                                                                                                <span className="text-[8px] font-bold uppercase tracking-widest text-black/40 mt-1">{opt.desc}</span>
                                                                                            </div>
                                                                                            {isActive && (
                                                                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-black flex items-center justify-center border-2 border-white rounded-full z-10">
                                                                                                    <Check size={12} strokeWidth={4} className="text-[#ffdf00]" />
                                                                                                </div>
                                                                                            )}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {level === 0 && link.type !== 'mediakit' && (
                                                            <div className="flex-1 space-y-4 pt-4 mt-4 border-t border-[#000]/5 lg:border-t-0 lg:mt-0 lg:pt-0">
                                                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                                                    <Layout size={14} strokeWidth={3} className="text-black/30" />
                                                                    {t('links.layoutLabel')}
                                                                </label>
                                                                <div className="grid grid-cols-2 gap-4 max-w-[400px]">
                                                                    {[
                                                                        { id: 'classic', label: t('links.layoutClassic') || 'Botão', icon: <Smartphone size={16} /> },
                                                                        { id: 'card', label: (link.platform === 'instagram' || link.url?.includes('instagram.com')) ? 'Feed' : (t('links.layoutCard') || 'Card'), icon: <Grid size={16} /> },
                                                                        { id: 'social', label: t('links.layoutSocial') || 'Ícones', icon: <Share2 size={16} /> },
                                                                        { id: 'carousel', label: t('links.layoutCarousel') || 'Carrossel', icon: <Layout size={16} /> },
                                                                    ].filter(opt => {
                                                                        if (link.type === 'map') return opt.id === 'classic' || opt.id === 'card';
                                                                        if (link.platform === 'instagram' || link.url?.includes('instagram.com')) return false;
                                                                        return true;
                                                                    }).map((opt) => {
                                                                        const isActive = link.layout === opt.id;

                                                                        return (
                                                                            <button
                                                                                key={opt.id}
                                                                                onClick={() => updateLink(link.id, 'layout', opt.id)}
                                                                                className={`group relative flex items-center gap-3 p-3 border-2 border-black rounded-xl transition-all ${isActive ? 'bg-[#97cd7a] shadow-[0_4px_0_0_#000] -translate-y-0.5' : 'bg-white hover:bg-[#f8f8f8] shadow-[0_4px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_4px_0_0_#000] hover:-translate-y-0.5'}`}
                                                                            >
                                                                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black ${isActive ? 'bg-white' : 'bg-slate-50'}`}>
                                                                                    {opt.icon}
                                                                                </div>
                                                                                <span className="text-[9px] font-black uppercase tracking-tight text-black leading-none">
                                                                                    {opt.label}
                                                                                </span>
                                                                                {isActive && (
                                                                                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black flex items-center justify-center border-2 border-white rounded-full z-10">
                                                                                        <Check size={10} strokeWidth={4} className="text-[#97cd7a]" />
                                                                                    </div>
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {level === 0 && link.type === 'mediakit' && (
                                                            <div className="flex-1 space-y-4 pt-4 mt-2 border-t border-[#000] border-dashed">
                                                                {!(profile.plan_type === 'monthly' || profile.plan_type === 'annual') ? (
                                                                    <div className="bg-slate-50 border-2 border-[#000] p-8 text-center space-y-4 shadow-[0_3px_0_0_#000]">
                                                                        <div className="w-16 h-16 bg-white border-2 border-[#000] flex items-center justify-center mx-auto shadow-[0_2px_0_0_#000]">
                                                                            <Lock size={32} className="text-black" strokeWidth={2} />
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-2">{t('mediakit.locked')}</h3>
                                                                            <p className="text-[9px] text-black/50 font-semibold uppercase tracking-widest">{t('links.limitReachedDesc')}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); /* logic to open billing */ }}
                                                                            className="mt-2 text-[10px] font-bold uppercase tracking-widest bg-white border-2 border-[#000] px-4 py-2 shadow-[0_2px_0_0_#000] hover:bg-[#ffdf00] transition-all active:translate-y-[0.5px] active:shadow-none"
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
                                                                                <div className="flex bg-black/[0.05] rounded-sm p-0.5 mb-0.5 border border-[#000]/5">
                                                                                    <button
                                                                                        onClick={() => updateLink(link.id, 'currency', 'BRL')}
                                                                                        className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm transition-all ${(!link.currency || link.currency === 'BRL') ? 'bg-white text-black shadow-[0_5px_0_0_#000]' : 'text-black/30 hover:text-black'}`}
                                                                                    >BRL</button>
                                                                                    <button
                                                                                        onClick={() => updateLink(link.id, 'currency', 'USD')}
                                                                                        className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm transition-all ${link.currency === 'USD' ? 'bg-white text-black shadow-[0_5px_0_0_#000]' : 'text-black/30 hover:text-black'}`}
                                                                                    >USD</button>
                                                                                </div>
                                                                            </div>
                                                                            <button onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const defaultPrice = link.currency === 'USD' ? '$ 0.00' : 'R$ 0,00';
                                                                                const newPackage = { id: crypto.randomUUID(), clientId: crypto.randomUUID(), title: 'Publi Completa', subtitle: 'Ex: 1 Reel + 2 Stories', url: defaultPrice, isActive: true, layout: 'list' as const, type: 'link' as const };
                                                                                updateLink(link.id, 'children', [...(link.children || []), newPackage]);
                                                                            }} className="px-2 py-1.5 text-[9px] bg-white border-2 border-[#000] shadow-[0_3px_0_0_#000] text-black hover:bg-[#97cd7a] uppercase font-bold tracking-widest active:translate-y-[1px] active:shadow-none">+ {t('mediakit.addPackage') || t('common.add')}</button>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            {(link.children || []).map((pkg, i) => (
                                                                                <div key={pkg.id} className="flex gap-3 p-3 bg-white border-2 border-[#000] shadow-[0_2px_0_0_#000] items-center group/pkg">
                                                                                    <div className="flex-1 space-y-2">
                                                                                        <input type="text" value={pkg.title} onChange={(e) => {
                                                                                            const newChildren = [...(link.children || [])];
                                                                                            newChildren[i].title = e.target.value;
                                                                                            updateLink(link.id, 'children', newChildren);
                                                                                        }} className="w-full text-[11px] font-bold uppercase tracking-widest text-black border-b border-dashed border-[#000]/20 pb-1 focus:border-[#000] outline-none bg-transparent" placeholder={t('mediakit.packageTitlePlaceholder')} />
                                                                                        <input type="text" value={pkg.subtitle || ''} onChange={(e) => {
                                                                                            const newChildren = [...(link.children || [])];
                                                                                            newChildren[i].subtitle = e.target.value;
                                                                                            updateLink(link.id, 'children', newChildren);
                                                                                        }} className="w-full text-[9px] font-medium uppercase tracking-[0.1em] text-black/60 border-b border-dashed border-[#000]/20 pb-1 focus:border-[#000] outline-none bg-transparent" placeholder={t('mediakit.packageSubtitlePlaceholder')} />
                                                                                    </div>
                                                                                    <div className="w-[120px] shrink-0 flex flex-col items-end gap-1 px-1">
                                                                                        <input type="text" value={pkg.url} onChange={(e) => {
                                                                                            const newChildren = [...(link.children || [])];
                                                                                            newChildren[i].url = e.target.value;
                                                                                            updateLink(link.id, 'children', newChildren);
                                                                                        }} className="w-full text-base font-bold text-right border-b-2 border-[#000] focus:border-[#000] px-1 py-1 outline-none bg-transparent" placeholder={link.currency === 'USD' ? '$ 0.00' : 'R$ 0,00'} />
                                                                                        <button onClick={() => {
                                                                                            const newChildren = [...(link.children || [])];
                                                                                            newChildren.splice(i, 1);
                                                                                            updateLink(link.id, 'children', newChildren);
                                                                                        }} className="text-black/20 hover:text-red-500 transition-colors p-1"><Trash2 size={12} /></button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            {(link.children?.length === 0 || !link.children) && (
                                                                                <div className="text-[9px] text-center p-6 border-2 border-dashed border-[#000]/10 bg-black/5 text-black/40 uppercase tracking-[0.2em] font-bold">{t('mediakit.noPackages')}</div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                </div>
                                            )}

                                            {/* 🛠️ Organized Settings Grid (Animations & PRO Features) - HIDDEN ON ONBOARDING */}
                                            {link.type !== 'header' && !isOnboarding && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10 pt-8 mt-8 border-t border-[#000] border-dashed items-start">

                                                    {/* 🎬 Section 1: Animations */}
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex items-center gap-3 mb-5 px-1">
                                                            <div className="w-10 h-10 bg-[#ffdf00] border-2 border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#000]">
                                                                <Zap size={18} strokeWidth={2.5} className="text-black" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[12px] font-black text-black uppercase tracking-widest leading-none">{t('links.animations')}</h4>
                                                                <span className="text-[9px] font-bold text-black/40 uppercase tracking-tighter mt-1 block">Visual e Efeitos</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 bg-white border-2 border-black rounded-3xl p-4 shadow-[4px_4px_0_0_#000]">
                                                            <div className="flex bg-[#f5f5f5] p-1.5 rounded-2xl gap-1.5 mb-6 border border-black/5">
                                                                {[
                                                                    { id: 'soft', label: 'SUAVE' },
                                                                    { id: 'dynamic', label: 'ENERGIA' },
                                                                    { id: 'special', label: 'EFEITOS' }
                                                                ].map(cat => (
                                                                    <button
                                                                        key={cat.id}
                                                                        onClick={() => setAnimCategory(cat.id)}
                                                                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-[0.15em] transition-all rounded-xl ${animCategory === cat.id ? 'bg-[#ffdf00] text-black border-2 border-black shadow-[2px_2px_0_0_#000]' : 'bg-transparent text-black/30 hover:text-black/50'}`}
                                                                    >
                                                                        {cat.label}
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            <div className="grid grid-cols-3 gap-3">
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
                                                                            onClick={() => {
                                                                                if (anim.id !== 'none' && (!profile.plan_type || profile.plan_type === 'free')) return;
                                                                                updateLink(link.id, 'highlight', anim.id as any);
                                                                            }}
                                                                            className={`flex flex-col items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all duration-200
                                                                                ${isSelected
                                                                                    ? 'bg-[#ffdf00] border-black text-black shadow-[2px_2px_0_0_#000] -translate-y-0.5'
                                                                                    : 'bg-white border-transparent text-black/30 hover:bg-[#f1f1f1] hover:text-black hover:border-black/10'}`}
                                                                        >
                                                                            <AnimIcon size={16} strokeWidth={isSelected ? 3 : 2} />
                                                                            <span className={`text-[8px] font-black uppercase tracking-tight text-center leading-tight`}>
                                                                                {anim.label}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 📅 Column 2: Scheduling (PRO) */}
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex items-center gap-3 mb-5 px-1">
                                                            <div className="w-10 h-10 bg-[#ffdf00] border-2 border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#000]">
                                                                <CalendarIcon size={18} strokeWidth={2.5} className="text-black" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-[12px] font-black text-black uppercase tracking-widest leading-none">{t('links.schedule')}</h4>
                                                                <span className="text-[9px] font-bold text-black/40 uppercase tracking-tighter mt-1 block">Visibilidade Automática</span>
                                                            </div>
                                                            {(!profile.plan_type || profile.plan_type === 'free') && (
                                                                <div className="px-2 py-1 bg-[#ffdf00] text-black text-[8px] font-black uppercase border-2 border-black shadow-[2px_2px_0_0_#000] rounded-lg">PRO</div>
                                                            )}
                                                        </div>

                                                        <div className={`flex-1 bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0_0_#000] ${(!profile.plan_type || profile.plan_type === 'free') ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                                            <div className="space-y-6">
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/60">
                                                                        <div className="w-2 h-2 bg-black rounded-full" />
                                                                        {t('links.scheduleStart')}
                                                                    </div>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="datetime-local" 
                                                                            value={link.scheduleStart ? new Date(new Date(link.scheduleStart).getTime() - new Date(link.scheduleStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
                                                                            onChange={(e) => { const date = e.target.value ? new Date(e.target.value).toISOString() : null; updateLink(link.id, 'scheduleStart', date); }} 
                                                                            className="w-full text-[11px] font-black uppercase tracking-widest text-black bg-[#f1f1f1] border-2 border-black px-4 py-4 focus:bg-[#ffdf00] outline-none transition-all rounded-2xl shadow-[2px_2px_0_0_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]" 
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/60">
                                                                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                                                                        {t('links.scheduleEnd')}
                                                                    </div>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="datetime-local" 
                                                                            value={link.scheduleEnd ? new Date(new Date(link.scheduleEnd).getTime() - new Date(link.scheduleEnd).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
                                                                            onChange={(e) => { const date = e.target.value ? new Date(e.target.value).toISOString() : null; updateLink(link.id, 'scheduleEnd', date); }} 
                                                                            className="w-full text-[11px] font-black uppercase tracking-widest text-black bg-[#f1f1f1] border-2 border-black px-4 py-4 focus:bg-[#ffdf00] outline-none transition-all rounded-2xl shadow-[2px_2px_0_0_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]" 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 🔐 Column 3: Pro Features (Password & Countdown) */}
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex items-center gap-3 mb-5 px-1">
                                                            <div className="w-10 h-10 bg-[#ffdf00] border-2 border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#000]">
                                                                <Lock size={18} strokeWidth={2.5} className="text-black" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-[12px] font-black text-black uppercase tracking-widest leading-none">Segurança e Ferramentas</h4>
                                                                <span className="text-[9px] font-bold text-black/40 uppercase tracking-tighter mt-1 block">Proteção e Conversão</span>
                                                            </div>
                                                        </div>

                                                        <div className={`flex-1 bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0_0_#000] ${(!profile.plan_type || profile.plan_type === 'free') ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                                            <div className="space-y-10">
                                                                {/* Password */}
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[11px] font-black uppercase tracking-widest text-black">Senha de Acesso</span>
                                                                            <span className="text-[8px] font-bold text-black/40 uppercase mt-1">{link.isPasswordProtected ? 'Ativada' : 'Sem Proteção'}</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateLink(link.id, 'isPasswordProtected', !link.isPasswordProtected)}
                                                                            className={`relative w-12 h-6 border-2 border-black rounded-full transition-all ${link.isPasswordProtected ? 'bg-[#ffdf00]' : 'bg-white'}`}
                                                                        >
                                                                            <div className={`absolute top-0.5 w-4 h-4 border-2 border-black transition-all rounded-full ${link.isPasswordProtected ? 'left-[24px] bg-black shadow-[-2px_0_0_0_#fff]' : 'left-[2px] bg-black/10'}`} />
                                                                        </button>
                                                                    </div>
                                                                    {link.isPasswordProtected && (
                                                                        <input
                                                                            type="password"
                                                                            value={(link as any).linkPassword || ''}
                                                                            onChange={e => updateLink(link.id, 'linkPassword' as any, e.target.value)}
                                                                            placeholder="Sua senha secreta..."
                                                                            className="w-full text-[11px] font-black uppercase tracking-widest text-black bg-[#f1f1f1] border-2 border-black px-4 py-4 focus:bg-[#ffdf00] outline-none transition-all rounded-2xl shadow-[2px_2px_0_0_#000]"
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div className="h-[2px] bg-black" />

                                                                {/* Countdown */}
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[11px] font-black uppercase tracking-widest text-black">Contagem Regressiva</span>
                                                                            <span className="text-[8px] font-bold text-black/40 uppercase mt-1">{link.showCountdown ? 'Visível' : 'Oculta'}</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateLink(link.id, 'showCountdown', !link.showCountdown)}
                                                                            className={`relative w-12 h-6 border-2 border-black rounded-full transition-all ${link.showCountdown ? 'bg-[#ffdf00]' : 'bg-white'}`}
                                                                        >
                                                                            <div className={`absolute top-0.5 w-4 h-4 border-2 border-black transition-all rounded-full ${link.showCountdown ? 'left-[24px] bg-black shadow-[-2px_0_0_0_#fff]' : 'left-[2px] bg-black/10'}`} />
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-[8px] font-bold text-black/40 uppercase leading-relaxed tracking-tight">Exibe um contador regressivo para o início do agendamento.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer Actions Row - HIDDEN ON ONBOARDING */}
                                            {!isOnboarding && (
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-[#000] border-dashed gap-4">
                                                    <div className="flex items-center gap-2 text-black font-bold uppercase tracking-widest text-[10px] sm:shrink-0">
                                                        <BarChart2 size={14} strokeWidth={2} />
                                                        <span>{link.clicks || 0} {t('analytics.totalClicks').toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </Reorder.Item>

            {createPortal(
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowDeleteConfirm(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white border-4 border-black p-8 rounded-xl shadow-[0_12px_0_0_#000] max-w-sm w-full"
                            >
                                <div className="flex flex-col items-center text-center gap-6">
                                    <div className="w-16 h-16 bg-red-100 border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000]">
                                        <Trash2 size={32} className="text-red-600" strokeWidth={3} />
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-black mb-2">Confirmar Exclusão?</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest text-black/50 leading-relaxed">
                                            Essa ação é permanente. Deseja realmente excluir "{link.title || 'este item'}"?
                                        </p>
                                    </div>

                                    <div className="flex flex-col w-full gap-3 pt-2">
                                        <button
                                            onClick={() => { removeLink(link.id); setShowDeleteConfirm(false); }}
                                            className="w-full py-4 bg-red-600 text-white font-black uppercase text-[12px] tracking-widest border-2 border-black shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none transition-all"
                                        >
                                            Sim, Excluir Item
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="w-full py-4 bg-white text-black font-black uppercase text-[12px] tracking-widest border-2 border-black hover:bg-slate-50 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* 🎨 Icon Picker Modal */}
            {createPortal(
                <AnimatePresence>
                    {showIconPicker && (
                        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowIconPicker(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <div className="relative w-full max-w-lg z-10">
                                <IconPicker 
                                    currentIcon={link.icon}
                                    onSelect={(iconName) => {
                                        updateLink(link.id, 'icon', iconName);
                                        setShowIconPicker(false);
                                    }}
                                    onClose={() => setShowIconPicker(false)}
                                />
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

export default React.memo(SortableLinkItem);

