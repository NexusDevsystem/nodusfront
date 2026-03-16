import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { LinkItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus,
    Trash2,
    Instagram,
    Twitter,
    Linkedin,
    Github,
    Youtube,
    Facebook,
    Info,
    X,
    MessageCircle,
    Hash,
    Send,
    Cloud,
    Twitch,
    Music,
    Chrome,
    Phone,
    Mail as MailIcon,
    ShoppingBag,
    Search,
    ChevronLeft,
    ChevronRight,
    Zap,
    ExternalLink,
    Loader2,
    Check,
    AlertCircle,
    Globe
} from 'lucide-react';
import { SiSpotify, SiTiktok } from 'react-icons/si';
import { SOCIAL_NETWORKS, KickIcon } from '../constants';
import Tooltip from './Tooltip';

interface SocialLinksEditorProps {
    links: LinkItem[];
    onChange: (links: LinkItem[] | ((prev: LinkItem[]) => LinkItem[])) => void;
    profile?: any;
    setProfile?: (profile: any) => void;
}

export default function SocialLinksEditor({ links, onChange, profile: propProfile, setProfile: propSetProfile }: SocialLinksEditorProps) {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [configuringPlatform, setConfiguringPlatform] = useState<string | null>(null);
    const [tempUrl, setTempUrl] = useState('');
    const { profile: authProfile, setProfile: authSetProfile } = useAuth();
    const profile = propProfile || authProfile;
    const setProfile = propSetProfile || authSetProfile;

    const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
    const [isConnectingTikTok, setIsConnectingTikTok] = useState(false);
    const [isConnectingTwitch, setIsConnectingTwitch] = useState(false);
    const [isConnectingYoutube, setIsConnectingYoutube] = useState(false);
    const [isConnectingKick, setIsConnectingKick] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const isAuthorized = profile?.username === 'nodus' || profile?.username === 'nexus' || profile?.username === 'nyill' || profile?.username === 'jaoom' || authProfile?.email === 'jaoomarcos75@gmail.com';

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const socialLinks = links.filter(link => link.layout === 'social' && link.type !== 'collection');
    const instagramIntegration = profile?.integrations?.find((i: any) => i.provider === 'instagram');
    const isInstagramConnected = !!instagramIntegration;

    const twitchIntegration = profile?.integrations?.find((i: any) => i.provider === 'twitch');
    const isTwitchConnected = !!twitchIntegration;

    const youtubeIntegration = profile?.integrations?.find((i: any) => i.provider === 'youtube');
    const isYoutubeConnected = !!youtubeIntegration;

    const kickIntegration = profile?.integrations?.find((i: any) => i.provider === 'kick');
    const isKickConnected = !!kickIntegration;

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSearchTerm('');
        setConfiguringPlatform(null);
        setTempUrl('');
        setShowDisconnectConfirm(false);
    };

    const toggleSocialLink = (platformId: string) => {
        const existing = links.find(l => l.layout === 'social' && (l.platform === platformId || (platformId !== 'site' && platformId !== 'custom' && l.url.includes(platformId))));
        const platform = SOCIAL_NETWORKS.find(p => p.id === platformId);

        if (existing && platform) {
            setConfiguringPlatform(platformId);
            if (existing.url.startsWith(platform.baseUrl)) {
                setTempUrl(existing.url.replace(platform.baseUrl, ''));
            } else {
                setTempUrl(existing.url);
            }
        } else {
            setConfiguringPlatform(platformId);
            setTempUrl('');
        }
        setIsModalOpen(true);
    };

    const confirmPlatform = () => {
        if (!configuringPlatform) return;

        const platform = SOCIAL_NETWORKS.find(p => p.id === configuringPlatform);
        if (!platform) return;

        let finalUrl = tempUrl.trim();

        if (!finalUrl.startsWith('http') && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:')) {
            const cleanUser = finalUrl.startsWith('@') ? finalUrl.substring(1) : finalUrl;
            finalUrl = `${platform.baseUrl}${cleanUser}`;
        }

        const platformLinks = links.filter(l => l.platform === configuringPlatform);

        if (platformLinks.length > 0) {
            onChange(links.map(l => l.platform === configuringPlatform ? { ...l, url: finalUrl } : l));
        } else {
            const now = Date.now();
            const newSocialLink: LinkItem = {
                id: now.toString(),
                type: 'link',
                platform: configuringPlatform,
                title: platform.name,
                url: finalUrl,
                isActive: true,
                clicks: 0,
                layout: 'social'
            };

            onChange([...links, newSocialLink]);
        }

        handleCloseModal();
    };



    const filteredPlatforms = SOCIAL_NETWORKS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeConfigPlatform = SOCIAL_NETWORKS.find(p => p.id === configuringPlatform);

    return (
        <div className="bg-white border-2 border-[#1a1a1a] mb-4 group transition-all overflow-hidden shadow-[0_6px_0_0_#1a1a1a] rounded-2xl">
            <div className="p-4 md:p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-xs md:text-sm font-medium text-black uppercase tracking-widest leading-none">{t('social.title')}</h3>
                        <p className="text-[9px] md:text-[10px] text-black font-normal uppercase tracking-wider mt-1 opacity-60 leading-none">{t('social.subtitle')}</p>
                    </div>
                    <Tooltip text={t('social.manage')} position="top">
                         <button
                             onClick={handleOpenModal}
                             className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-black bg-white border-2 border-[#1a1a1a] hover:bg-[#ffdf00] transition-all shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none shrink-0 rounded-xl"
                         >
                            <Plus size={22} strokeWidth={4} />
                        </button>
                    </Tooltip>
                </div>

                {(socialLinks.length > 0 || isInstagramConnected || isTwitchConnected || isYoutubeConnected || isKickConnected) && (
                    <div className="flex flex-wrap gap-4 md:gap-5 py-1">
                        {/* Auto-render Instagram if connected but not explicitly added as link */}
                        {isInstagramConnected && !socialLinks.some(l => l.platform === 'instagram') && (
                            <button
                                onClick={() => toggleSocialLink('instagram')}
                                className="text-black transition-all hover:scale-110 active:scale-90 p-0.5 relative"
                            >
                                <Instagram size={22} className="md:w-6 md:h-6" />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#32a800] rounded-full border border-white" />
                            </button>
                        )}

                        {/* Auto-render Twitch if connected */}
                        {isTwitchConnected && !socialLinks.some(l => l.platform === 'twitch') && (
                            <button
                                onClick={() => toggleSocialLink('twitch')}
                                className="text-black transition-all hover:scale-110 active:scale-90 p-0.5 relative"
                            >
                                <Twitch size={22} className="md:w-6 md:h-6" />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#6441a5] rounded-full border border-white" />
                            </button>
                        )}

                        {/* Auto-render YouTube if connected */}
                        {isYoutubeConnected && !socialLinks.some(l => l.platform === 'youtube') && (
                            <button
                                onClick={() => toggleSocialLink('youtube')}
                                className="text-black transition-all hover:scale-110 active:scale-90 p-0.5 relative"
                            >
                                <Youtube size={22} className="md:w-6 md:h-6" />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff0000] rounded-full border border-white" />
                            </button>
                        )}

                        {/* Auto-render Kick if connected */}
                        {isKickConnected && !socialLinks.some(l => l.platform === 'kick') && (
                            <button
                                onClick={() => toggleSocialLink('kick')}
                                className="text-black transition-all hover:scale-110 active:scale-90 p-0.5 relative"
                            >
                                <KickIcon size={22} className="md:w-6 md:h-6" />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#53FC18] rounded-full border border-white" />
                            </button>
                        )}

                        {socialLinks.map(link => {
                            const network = SOCIAL_NETWORKS.find(n => n.id === link.platform) ||
                                SOCIAL_NETWORKS.find(n => n.id !== 'custom' && link.url.toLowerCase().includes(n.id)) ||
                                SOCIAL_NETWORKS.find(n => n.id === 'site' || n.id === 'custom') ||
                                SOCIAL_NETWORKS[0];
                            const Icon = network.icon;

                            let dotColor = null;
                            if (network.id === 'instagram' && isInstagramConnected) dotColor = '#32a800';
                            if (network.id === 'twitch' && isTwitchConnected) dotColor = '#6441a5';
                            if (network.id === 'youtube' && isYoutubeConnected) dotColor = '#ff0000';
                            if (network.id === 'kick' && isKickConnected) dotColor = '#53FC18';

                            return (
                                <button
                                    key={link.id}
                                    onClick={() => toggleSocialLink(link.platform!)}
                                    className="text-black transition-all hover:scale-110 active:scale-90 p-0.5 relative"
                                >
                                    <Icon size={22} className="md:w-6 md:h-6" />
                                    {dotColor && (
                                        <div
                                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                                            style={{ backgroundColor: dotColor }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={handleCloseModal}
                            />
                                <div
                                    className={`
                                        relative bg-white flex flex-col overflow-hidden border-2 border-[#1a1a1a]
                                        ${isMobile ? 'w-full h-[92vh] rounded-t-3xl shadow-none translate-y-1' : 'w-full max-w-sm max-h-[70vh] shadow-[0_8px_0_0_#1a1a1a] rounded-[2rem]'}
                                    `}
                                >

                                <div className="p-4 flex items-center justify-between shrink-0 relative border-b-2 border-[#1a1a1a]">
                                    <button
                                        onClick={() => configuringPlatform ? setConfiguringPlatform(null) : handleCloseModal()}
                                        className="p-1.5 text-black border-2 border-transparent hover:border-[#1a1a1a] hover:bg-[#ffdf00] transition-colors"
                                    >
                                        <ChevronLeft size={20} strokeWidth={3} />
                                    </button>

                                    <h3 className={`absolute left-1/2 -translate-x-1/2 font-medium uppercase tracking-widest text-black truncate max-w-[200px] ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                                        {configuringPlatform
                                            ? (links.some(l => l.layout === 'social' && (l.platform === configuringPlatform || (configuringPlatform !== 'site' && configuringPlatform !== 'custom' && l.url.includes(configuringPlatform))))
                                                ? t('social.editPlatform', { platform: activeConfigPlatform?.name })
                                                : t('social.addPlatform', { platform: activeConfigPlatform?.name }))
                                            : t('social.modalTitle')}
                                    </h3>

                                    <button
                                        onClick={handleCloseModal}
                                        className="w-10 h-10 flex items-center justify-center text-black bg-white border-2 border-[#1a1a1a] transition-all active:translate-y-[2px] active:shadow-none shadow-[0_4px_0_0_#1a1a1a] rounded-xl"
                                    >
                                        <X size={20} strokeWidth={4} />
                                    </button>
                                </div>

                                {!configuringPlatform ? (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="p-4 pb-3">
                                            <div className="relative">
                                                <Search size={14} strokeWidth={3} className="absolute left-3 top-1/2 -translate-y-1/2 text-black opacity-40" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder={t('common.searchPlaceholder')}
                                                     className="w-full bg-white border-2 border-[#1a1a1a] py-2 pl-9 pr-4 text-[10px] font-medium uppercase tracking-widest text-black outline-none focus:bg-[#ffdf00] placeholder:text-black/30 transition-colors shadow-[0_4px_0_0_#1a1a1a] rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={`flex-1 overflow-y-auto px-6 pb-6 ${isMobile ? 'scrollbar-hide' : 'custom-scrollbar'}`}
                                            style={isMobile ? {
                                                msOverflowStyle: 'none',
                                                scrollbarWidth: 'none'
                                            } : {}}
                                        >
                                            <div className="grid grid-cols-2 gap-3 px-1">
                                                {SOCIAL_NETWORKS.filter(p =>
                                                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).map(platform => {
                                                    const isSelected = !!links.find(l => l.layout === 'social' && (l.platform === platform.id || (platform.id !== 'site' && platform.id !== 'custom' && l.url.includes(platform.id))));
                                                    const isConnected = !!profile?.integrations?.find((i: any) => i.provider === platform.id);
                                                    const Icon = platform.icon;

                                                    return (
                                                         <div
                                                            key={platform.id}
                                                            onClick={() => toggleSocialLink(platform.id)}
                                                             className={`
                                                                relative flex flex-col items-center justify-center p-5 group cursor-pointer transition-all rounded-2xl
                                                                ${isSelected ? 'bg-[#97cd7a] border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a]' : 'bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none hover:bg-[#ffdf00]'}
                                                            `}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    toggleSocialLink(platform.id);
                                                                }
                                                            }}
                                                        >
                                                            <div className="text-black mb-1 flex items-center justify-center h-8">
                                                                <Icon size={24} />
                                                            </div>
                                                            <span className="text-[9px] font-medium text-black uppercase tracking-widest text-center truncate w-full leading-none">
                                                                {platform.name}
                                                            </span>

                                                            {isConnected && (
                                                                <div className="absolute top-1 left-1 px-1 py-0.5 bg-[#1a1a1a] text-[#97cd7a] text-[6px] font-medium uppercase tracking-widest border border-[#1a1a1a] shadow-[0_1px_0_0_#1a1a1a] flex items-center gap-0.5">
                                                                    <div className="w-1.5 h-1.5 bg-[#97cd7a] rounded-full animate-pulse"></div>
                                                                    {t('integrations.sync')}
                                                                </div>
                                                            )}

                                                            {isSelected && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onChange(links.filter(l => !(l.layout === 'social' && (l.platform === platform.id || (platform.id !== 'site' && platform.id !== 'custom' && l.url.includes(platform.id))))));
                                                                    }}
                                                                    className="absolute top-1.5 right-1.5 p-1 text-black border-2 border-transparent hover:border-[#1a1a1a] hover:bg-red-500 hover:text-white transition-colors"
                                                                    title={t('common.delete')}
                                                                >
                                                                    <Trash2 size={14} strokeWidth={3} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {filteredPlatforms.length === 0 && (
                                                <div className="py-10 text-center text-slate-400 font-medium">
                                                    {t('social.noIcons')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col flex-1 px-8 pb-10">
                                        <div className="mt-4 space-y-6">
                                            {!(
                                                (configuringPlatform === 'instagram' && isInstagramConnected) ||
                                                (configuringPlatform === 'twitch' && isTwitchConnected) ||
                                                (configuringPlatform === 'youtube' && isYoutubeConnected) ||
                                                (configuringPlatform === 'kick' && isKickConnected)
                                            ) && (
                                                    <div className="space-y-2">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={tempUrl}
                                                            onChange={(e) => setTempUrl(e.target.value)}
                                                            placeholder={activeConfigPlatform?.id === 'email' || activeConfigPlatform?.id === 'spotify'
                                                                ? t('social.linkInputPlaceholder')
                                                                : t('social.userInputPlaceholder')}
                                                            onKeyDown={(e) => e.key === 'Enter' && confirmPlatform()}
                                                             className="w-full bg-white border-2 border-[#1a1a1a] px-4 py-3 text-black text-[10px] font-medium uppercase tracking-widest outline-none focus:bg-[#ffdf00] placeholder:text-black/30 shadow-[0_4px_0_0_#1a1a1a] transition-colors rounded-xl"
                                                        />
                                                        <p className="text-[8px] font-normal text-black uppercase tracking-widest px-1 opacity-50 italic">
                                                            {t('social.userHint', { username: activeConfigPlatform?.placeholder || 'USUARIO' })}
                                                        </p>
                                                    </div>
                                                )}

                                            {/* YouTube Rich Profile Card */}
                                             {configuringPlatform === 'youtube' && isYoutubeConnected && (
                                                <div className="bg-white p-6 border-2 border-[#1a1a1a] flex flex-col items-center text-center shadow-[0_6px_0_0_#1a1a1a] rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="relative mb-4">
                                                        <div className="w-20 h-20 overflow-hidden border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] bg-white rounded-xl">
                                                            <img src={youtubeIntegration.profile_data?.avatar_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
                                                                alt={youtubeIntegration.profile_data?.title}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 bg-[#ff0000] p-1.5 border-2 border-[#1a1a1a] text-white">
                                                            <Youtube size={12} strokeWidth={4} />
                                                        </div>
                                                    </div>

                                                    <h4 className="text-xl font-medium text-black uppercase tracking-tighter">
                                                        {youtubeIntegration.profile_data?.title}
                                                    </h4>
                                                    <div className="flex flex-col items-center gap-1.5 mt-2">
                                                        <span className="text-[10px] font-medium text-black/50 uppercase tracking-widest flex items-center justify-center gap-1 bg-[#1a1a1a]/5 px-2 py-0.5">
                                                            <Youtube size={10} className="text-[#ff0000]" />
                                                            {t('social.youtubeChannel')}
                                                        </span>
                                                        <span className="text-[12px] font-medium text-[#ff0000] uppercase tracking-widest">
                                                            {youtubeIntegration.profile_data?.subscriber_count?.toLocaleString() || 0} {t('integrations.subscribers')}
                                                        </span>
                                                    </div>

                                                    <div className="mt-6 p-4 bg-yellow-50 border-2 border-[#1a1a1a]/10 flex items-start gap-3 w-full animate-in fade-in slide-in-from-top-1 rounded-xl">
                                                        <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" strokeWidth={3} />
                                                        <p className="text-[10px] font-normal text-yellow-800 uppercase tracking-widest leading-relaxed text-left">
                                                            {t('social.youtubeBetaNotice')}
                                                        </p>
                                                    </div>

                                                    <div className="w-full h-0.5 bg-[#1a1a1a]/10 my-6" />

                                                    <button
                                                        onClick={() => setShowDisconnectConfirm(!showDisconnectConfirm)}
                                                        disabled={isConnectingYoutube}
                                                        className={`w-full py-4 px-6 border-2 border-[#1a1a1a] transition-all font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:translate-y-[2px] active:shadow-none ${showDisconnectConfirm
                                                            ? 'bg-[#1a1a1a] text-white'
                                                            : 'bg-white text-red-600 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:bg-[#fff0f0] rounded-xl'
                                                            }`}
                                                    >
                                                        {isConnectingYoutube ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={3} />}
                                                        {showDisconnectConfirm ? t('common.cancel') : t('social.disconnectYoutube')}
                                                    </button>

                                                    {showDisconnectConfirm && (
                                                        <div className="mt-4 w-full">
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        setIsConnectingYoutube(true);
                                                                        await apiClient.disconnectIntegration('youtube');
                                                                        const updatedIntegrations = profile.integrations?.filter((i: any) => i.provider !== 'youtube') || [];
                                                                        setProfile({ ...profile, integrations: updatedIntegrations });
                                                                        onChange(links.filter(l => !(l.platform === 'youtube' && (l.type === 'social' || l.layout === 'social'))));
                                                                        setShowDisconnectConfirm(false);
                                                                    } catch (err: any) {
                                                                        setConnectionError(err.message);
                                                                    } finally {
                                                                        setIsConnectingYoutube(false);
                                                                    }
                                                                }}
                                                                className="w-full py-3 bg-red-600 text-white font-medium text-[10px] uppercase tracking-widest border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a]"
                                                            >
                                                                {t('social.confirmDisconnect')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Instagram Rich Profile Card */}
                                            {configuringPlatform === 'instagram' && isInstagramConnected && (
                                                <div className="bg-white p-6 border-2 border-[#1a1a1a] flex flex-col items-center text-center shadow-[0_6px_0_0_#1a1a1a] rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="relative mb-4">
                                                        <div className="w-20 h-20 overflow-hidden border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] bg-white rounded-xl">
                                                            <img src={instagramIntegration.profile_data?.avatar_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
                                                                alt={instagramIntegration.profile_data?.username}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 bg-[#97cd7a] p-1.5 border-2 border-[#1a1a1a] text-black">
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                    </div>

                                                    <h4 className="text-xl font-medium text-black uppercase tracking-tighter">
                                                        @{instagramIntegration.profile_data?.username}
                                                    </h4>
                                                    <div className="flex flex-col items-center gap-1.5 mt-2">
                                                        <span className="text-[10px] font-medium text-black/50 uppercase tracking-widest flex items-center justify-center gap-1 bg-[#1a1a1a]/5 px-2 py-0.5">
                                                            <Instagram size={10} className="text-black" />
                                                            {t('social.instagramBusiness')}
                                                        </span>
                                                        <span className="text-[12px] font-medium text-[#32a800] uppercase tracking-widest">
                                                            {instagramIntegration.profile_data?.follower_count?.toLocaleString()} {t('integrations.followers')}
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-0.5 bg-[#1a1a1a]/10 my-6" />

                                                    <div className="w-full space-y-4">
                                                        <button
                                                            onClick={() => setShowDisconnectConfirm(!showDisconnectConfirm)}
                                                            disabled={isConnectingInstagram}
                                                            className={`w-full py-4 px-6 border-2 border-[#1a1a1a] transition-all font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:translate-y-[2px] active:shadow-none ${showDisconnectConfirm
                                                                ? 'bg-[#1a1a1a] text-white'
                                                                : 'bg-white text-red-600 shadow-[0_4px_0_0_#1a1a1a] hover:bg-[#fff0f0] rounded-xl'
                                                                }`}
                                                        >
                                                            {isConnectingInstagram ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={14} strokeWidth={3} />
                                                            )}
                                                            {showDisconnectConfirm ? t('common.cancel') : t('social.disconnectAccount')}
                                                        </button>

                                                        <AnimatePresence>
                                                            {showDisconnectConfirm && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden bg-[#fff0f0] border-2 border-[#1a1a1a]"
                                                                >
                                                                    <div className="p-4 space-y-4">
                                                                        <div className="text-left">
                                                                            <p className="text-[10px] font-medium text-red-900 uppercase tracking-widest leading-tight">
                                                                                {t('social.confirmDisconnectTitle')}
                                                                            </p>
                                                                            <p className="text-[9px] font-normal text-red-600 mt-2 uppercase tracking-tighter leading-relaxed">
                                                                                {t('social.confirmDisconnectDesc')}
                                                                            </p>
                                                                        </div>

                                                                        <button
                                                                            onClick={async () => {
                                                                                try {
                                                                                    setConnectionError(null);
                                                                                    setIsConnectingInstagram(true);
                                                                                    await apiClient.disconnectIntegration('instagram');

                                                                                    if (profile) {
                                                                                        const updatedIntegrations = profile.integrations?.filter((i: any) => i.provider !== 'instagram') || [];
                                                                                        setProfile({ ...profile, integrations: updatedIntegrations });
                                                                                    }
                                                                                    onChange(links.filter(l => !(l.platform === 'instagram' && (l.type === 'social' || l.layout === 'social'))));

                                                                                    setShowDisconnectConfirm(false);
                                                                                    setIsConnectingInstagram(false);
                                                                                } catch (err: any) {
                                                                                    console.error('Failed to disconnect Instagram:', err);
                                                                                    setConnectionError(err.message || t('social.errorDisconnectInstagram'));
                                                                                    setIsConnectingInstagram(false);
                                                                                }
                                                                            }}
                                                                            disabled={isConnectingInstagram}
                                                                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-[10px] uppercase tracking-widest rounded-lg shadow-sm shadow-red-200 transition-colors disabled:opacity-50"
                                                                        >
                                                                            {isConnectingInstagram ? t('social.disconnecting') : t('social.confirmDisconnectButton')}
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Kick Rich Profile Card */}
                                            {configuringPlatform === 'kick' && isKickConnected && kickIntegration && (
                                                <div className="bg-white p-6 border-2 border-[#1a1a1a] flex flex-col items-center text-center shadow-[0_6px_0_0_#1a1a1a] rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="relative mb-4">
                                                        <div className="w-20 h-20 overflow-hidden border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] bg-white rounded-xl">
                                                            <img src={kickIntegration.profile_data?.avatar_url}
                                                                alt={kickIntegration.profile_data?.username}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://avatar.kick.com/default';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 bg-[#53FC18] p-1.5 border-2 border-[#1a1a1a] text-black">
                                                            <KickIcon size={12} strokeWidth={4} />
                                                        </div>
                                                    </div>

                                                    <h4 className="text-xl font-medium text-black uppercase tracking-tighter">
                                                        {kickIntegration.profile_data?.display_name || kickIntegration.profile_data?.username}
                                                    </h4>
                                                    <p className="text-[10px] text-black/40 font-medium uppercase tracking-[0.2em] mt-1 mb-4">
                                                        {t('integrations.kickProfile')}
                                                    </p>

                                                    <div className="w-full h-0.5 bg-[#1a1a1a]/10 my-4" />

                                                    <button
                                                        onClick={() => setShowDisconnectConfirm(!showDisconnectConfirm)}
                                                        disabled={isConnectingKick}
                                                        className={`w-full py-4 px-6 border-2 border-[#1a1a1a] transition-all font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:translate-y-[2px] active:shadow-none ${showDisconnectConfirm
                                                            ? 'bg-[#1a1a1a] text-white'
                                                            : 'bg-white text-red-600 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:bg-[#fff0f0] rounded-xl'
                                                            }`}
                                                    >
                                                     {isConnectingKick ? (
                                                         <Loader2 size={14} className="animate-spin" />
                                                     ) : (
                                                         <Trash2 size={14} strokeWidth={3} />
                                                     )}
                                                     {showDisconnectConfirm ? t('common.cancel') : t('social.disconnectKick')}
                                                 </button>

                                                    <AnimatePresence>
                                                        {showDisconnectConfirm && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden bg-[#fff0f0] border-2 border-[#1a1a1a] w-full"
                                                            >
                                                                <div className="p-4 space-y-4 text-left">
                                                                    <div className="text-left">
                                                                        <p className="text-[10px] font-medium text-red-900 uppercase tracking-widest leading-tight">
                                                                            {t('social.confirmDisconnectTitle')}
                                                                        </p>
                                                                        <p className="text-[9px] font-normal text-red-600 mt-2 uppercase tracking-tighter leading-relaxed">
                                                                            {t('social.confirmDisconnectDesc')}
                                                                        </p>
                                                                    </div>

                                                                    <button
                                                                        onClick={async () => {
                                                                            try {
                                                                                setConnectionError(null);
                                                                                setIsConnectingKick(true);
                                                                                await apiClient.disconnectIntegration('kick');

                                                                                if (profile) {
                                                                                    const updatedIntegrations = profile.integrations?.filter((i: any) => i.provider !== 'kick') || [];
                                                                                    setProfile({ ...profile, integrations: updatedIntegrations });
                                                                                }
                                                                                onChange(links.filter(l => !(l.platform === 'kick' && (l.type === 'social' || l.layout === 'social'))));

                                                                                setShowDisconnectConfirm(false);
                                                                                setIsConnectingKick(false);
                                                                                handleCloseModal();
                                                                            } catch (err: any) {
                                                                                console.error('Failed to disconnect Kick:', err);
                                                                                setConnectionError(err.message);
                                                                                setIsConnectingKick(false);
                                                                            }
                                                                        }}
                                                                        disabled={isConnectingKick}
                                                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-[10px] uppercase tracking-widest border border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] transition-colors rounded-xl"
                                                                    >
                                                                        {isConnectingKick ? t('social.disconnecting') : t('social.confirmDisconnectButton')}
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            {/* Twitch Rich Profile Card */}
                                            {configuringPlatform === 'twitch' && isTwitchConnected && (
                                                <div className="bg-white p-6 border-2 border-[#1a1a1a] flex flex-col items-center text-center shadow-[0_6px_0_0_#1a1a1a] rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="relative mb-4">
                                                        <div className="w-20 h-20 overflow-hidden border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] bg-white rounded-xl">
                                                            <img src={twitchIntegration.profile_data?.avatar_url}
                                                                alt={twitchIntegration.profile_data?.username}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
                                                                }}
                                                            />
                                                            {twitchIntegration.profile_data?.is_live && (
                                                                <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 border border-[#1a1a1a] shadow-[0_1px_0_0_#1a1a1a]">
                                                                    {t('social.live')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 bg-[#6441a5] p-1.5 border-2 border-[#1a1a1a] text-white">
                                                            <Twitch size={12} strokeWidth={4} />
                                                        </div>
                                                    </div>

                                                    <h4 className="text-xl font-medium text-black uppercase tracking-tighter">
                                                        @{twitchIntegration.profile_data?.display_name || twitchIntegration.profile_data?.username}
                                                    </h4>
                                                    <div className="flex flex-col items-center gap-1.5 mt-2">
                                                        <span className="text-[10px] font-medium text-black/50 uppercase tracking-widest flex items-center justify-center gap-1 bg-[#1a1a1a]/5 px-2 py-0.5">
                                                            <Twitch size={10} className="text-[#6441a5]" />
                                                            {t('social.twitchChannel')}
                                                        </span>
                                                        <span className="text-[12px] font-medium text-[#6441a5] uppercase tracking-widest">
                                                            {twitchIntegration.profile_data?.follower_count?.toLocaleString() || 0} {t('integrations.followers')}
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-0.5 bg-[#1a1a1a]/10 my-6" />

                                                    <button
                                                        onClick={() => setShowDisconnectConfirm(!showDisconnectConfirm)}
                                                        disabled={isConnectingTwitch}
                                                        className={`w-full py-4 px-6 border-2 border-[#1a1a1a] transition-all font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:translate-y-[2px] active:shadow-none ${showDisconnectConfirm
                                                            ? 'bg-[#1a1a1a] text-white'
                                                            : 'bg-white text-red-600 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:bg-[#fff0f0] rounded-xl'
                                                            }`}
                                                    >
                                                     {isConnectingTwitch ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={3} />}
                                                     {showDisconnectConfirm ? t('common.cancel') : t('social.disconnectTwitch')}
                                                 </button>

                                                    {showDisconnectConfirm && (
                                                        <div className="mt-4 w-full">
                                                            <button
                                                                 onClick={async () => {
                                                                    try {
                                                                        setIsConnectingTwitch(true);
                                                                        await apiClient.disconnectIntegration('twitch');
                                                                        const updatedIntegrations = profile.integrations?.filter((i: any) => i.provider !== 'twitch') || [];
                                                                        setProfile({ ...profile, integrations: updatedIntegrations });
                                                                        onChange(links.filter(l => !(l.platform === 'twitch' && (l.type === 'social' || l.layout === 'social'))));
                                                                        setShowDisconnectConfirm(false);
                                                                    } catch (err: any) {
                                                                        setConnectionError(err.message);
                                                                    } finally {
                                                                        setIsConnectingTwitch(false);
                                                                    }
                                                                }}
                                                                className="w-full py-3 bg-red-600 text-white font-medium text-[10px] uppercase tracking-widest border-2 border-[#1a1a1a] shadow-[0_4px_0_0_rgba(26,26,26,1)] rounded-xl"
                                                            >
                                                                {t('social.confirmDisconnect')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* YouTube Connect Button */}
                                            {configuringPlatform === 'youtube' && !isYoutubeConnected && isAuthorized && (
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setConnectionError(null);
                                                                setIsConnectingYoutube(true);
                                                                const userId = profile?.id || '';
                                                                if (!userId) throw new Error(t('common.userNotIdentified'));
                                                                const { url } = await apiClient.getYoutubeAuthUrl(userId, window.location.origin);
                                                                window.location.href = url;
                                                            } catch (err: any) {
                                                                setConnectionError(err.message || t('social.errorStartConnection'));
                                                                setIsConnectingYoutube(false);
                                                            }
                                                        }}
                                                        disabled={isConnectingYoutube}
                                                         className={`w-full bg-white hover:bg-[#ffdf00] border-2 border-[#1a1a1a] transition-all py-4 px-6 flex items-center justify-between group/yt shadow-[0_4px_0_0_rgba(26,26,26,1)] hover:translate-y-[2px] hover:shadow-none rounded-2xl ${isConnectingYoutube ? 'opacity-70 cursor-wait' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isConnectingYoutube ? (
                                                                <Loader2 size={18} className="animate-spin text-black" />
                                                            ) : (
                                                                <Youtube size={18} className="text-[#ff0000]" />
                                                            )}
                                                            <div className="text-left leading-none space-y-1">
                                                                <span className="block text-xs font-medium uppercase tracking-widest text-black">
                                                                    {isConnectingYoutube ? t('common.starting') : t('social.connectYoutube')}
                                                                </span>
                                                                <span className="block text-[9px] font-normal uppercase tracking-wider text-black/70">{t('social.connectYoutubeDesc')}</span>
                                                                <span className="block text-[8px] font-normal text-yellow-600 uppercase tracking-widest mt-1 animate-pulse">
                                                                    {t('social.youtubeBetaNotice')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} strokeWidth={3} className="text-black group-hover/yt:translate-y-0.5 transition-transform" />
                                                    </button>
                                                    {connectionError && (
                                                        <p className="text-[10px] text-red-500 font-medium px-1 italic">{connectionError}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Instagram Connect Button (Only if NOT connected and authorized) */}
                                            {configuringPlatform === 'instagram' && !isInstagramConnected && isAuthorized && (
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setConnectionError(null);
                                                                setIsConnectingInstagram(true);
                                                                const userId = profile?.id || '';
                                                                if (!userId) throw new Error(t('common.userNotIdentified'));
                                                                const { url } = await apiClient.getInstagramAuthUrl(userId, window.location.origin);
                                                                window.location.href = url;
                                                            } catch (err: any) {
                                                                setConnectionError(err.message || t('social.errorStartConnection'));
                                                                setIsConnectingInstagram(false);
                                                            }
                                                        }}
                                                        disabled={isConnectingInstagram}
                                                        className={`w-full bg-white hover:bg-[#ffdf00] border-2 border-[#1a1a1a] transition-all py-4 px-6 flex items-center justify-between group/ig shadow-[0_4px_0_0_rgba(26,26,26,1)] hover:translate-y-[2px] hover:shadow-none ${isConnectingInstagram ? 'opacity-70 cursor-wait' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isConnectingInstagram ? (
                                                                <Loader2 size={20} className="animate-spin text-black" />
                                                            ) : (
                                                                <Instagram size={20} className="text-black" />
                                                            )}
                                                            <div className="text-left leading-none space-y-1">
                                                                <span className="block text-xs font-medium uppercase tracking-widest text-black">
                                                                    {isConnectingInstagram ? t('common.starting') : t('social.connectInstagram')}
                                                                </span>
                                                                <span className="block text-[9px] font-normal uppercase tracking-wider text-black/70">{t('social.connectInstagramDesc')}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} strokeWidth={3} className="text-black group-hover/ig:translate-y-0.5 transition-transform" />
                                                    </button>
                                                    {connectionError && (
                                                        <p className="text-[10px] text-red-500 font-medium px-1 italic">{connectionError}</p>
                                                    )}
                                                </div>
                                            )}

                                            {configuringPlatform === 'tiktok' && isAuthorized && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            setConnectionError(null);
                                                            setIsConnectingTikTok(true);
                                                            const userId = profile?.id || '';
                                                            if (!userId) throw new Error(t('common.userNotIdentified'));
                                                            const { url } = await apiClient.getTikTokAuthUrl(userId, window.location.origin);
                                                            window.location.href = url;
                                                        } catch (err: any) {
                                                            setConnectionError(err.message || t('social.errorStartConnection'));
                                                            setIsConnectingTikTok(false);
                                                        }
                                                    }}
                                                    disabled={isConnectingTikTok}
                                                    className={`w-full bg-white hover:bg-[#ffdf00] border-2 border-[#1a1a1a] transition-all py-4 px-6 flex items-center justify-between group/tt shadow-[0_4px_0_0_rgba(26,26,26,1)] hover:translate-y-[2px] hover:shadow-none ${isConnectingTikTok ? 'opacity-70 cursor-wait' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isConnectingTikTok ? (
                                                            <Loader2 size={18} className="animate-spin text-black" />
                                                        ) : (
                                                            <SiTiktok size={18} className="text-black" />
                                                        )}
                                                        <div className="text-left leading-none space-y-1">
                                                            <span className="block text-xs font-medium uppercase tracking-widest text-black">
                                                                {isConnectingTikTok ? t('common.starting') : t('social.connectTiktok')}
                                                            </span>
                                                            <span className="block text-[9px] font-normal uppercase tracking-wider text-black/70">{t('social.connectTiktokDesc')}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} strokeWidth={3} className="text-black group-hover/tt:translate-y-0.5 transition-transform" />
                                                </button>
                                            )}

                                            {/* Twitch Connect Button */}
                                            {configuringPlatform === 'twitch' && !isTwitchConnected && (
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setConnectionError(null);
                                                                setIsConnectingTwitch(true);
                                                                const userId = profile?.id || '';
                                                                if (!userId) throw new Error(t('common.userNotIdentified'));
                                                                const { url } = await apiClient.getTwitchAuthUrl(userId, window.location.origin);
                                                                window.location.href = url;
                                                            } catch (err: any) {
                                                                setConnectionError(err.message || t('social.errorStartConnection'));
                                                                setIsConnectingTwitch(false);
                                                            }
                                                        }}
                                                        disabled={isConnectingTwitch}
                                                        className={`w-full bg-white hover:bg-[#ffdf00] border-2 border-[#1a1a1a] transition-all py-4 px-6 flex items-center justify-between group/tw shadow-[0_4px_0_0_rgba(26,26,26,1)] hover:translate-y-[2px] hover:shadow-none ${isConnectingTwitch ? 'opacity-70 cursor-wait' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isConnectingTwitch ? (
                                                                <Loader2 size={18} className="animate-spin text-black" />
                                                            ) : (
                                                                <Twitch size={18} className="text-[#6441a5]" />
                                                            )}
                                                            <div className="text-left leading-none space-y-1">
                                                                <span className="block text-xs font-medium uppercase tracking-widest text-black">
                                                                    {isConnectingTwitch ? t('common.starting') : t('social.connectTwitch')}
                                                                </span>
                                                                <span className="block text-[9px] font-normal uppercase tracking-wider text-black/70">{t('social.connectTwitchDesc')}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} strokeWidth={3} className="text-black group-hover/tw:translate-y-0.5 transition-transform" />
                                                    </button>
                                                    {connectionError && (
                                                        <p className="text-[10px] text-red-500 font-medium px-1 italic">{connectionError}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Kick Connect View */}
                                            {configuringPlatform === 'kick' && !isKickConnected && (
                                                <div className="space-y-4">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setConnectionError(null);
                                                                setIsConnectingKick(true);
                                                                const userId = profile?.id || '';
                                                                if (!userId) throw new Error(t('common.userNotIdentified'));
                                                                const { url } = await apiClient.getKickAuthUrl(userId, window.location.origin);
                                                                window.location.href = url;
                                                            } catch (err: any) {
                                                                setConnectionError(err.message || t('social.errorStartConnection'));
                                                                setIsConnectingKick(false);
                                                            }
                                                        }}
                                                        disabled={isConnectingKick}
                                                        className={`w-full bg-[#53FC18] border-2 border-[#1a1a1a] transition-all py-4 px-6 flex items-center justify-between group/kick shadow-[0_4px_0_0_rgba(26,26,26,1)] hover:translate-y-[2px] hover:shadow-none ${isConnectingKick ? 'opacity-70 cursor-wait' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isConnectingKick ? (
                                                                <Loader2 size={18} className="animate-spin text-black" />
                                                            ) : (
                                                                <KickIcon size={18} className="text-black" />
                                                            )}
                                                            <div className="text-left leading-none space-y-1">
                                                                <span className="block text-xs font-bold uppercase tracking-widest text-black">
                                                                    {isConnectingKick ? t('common.starting') : t('social.connectKick')}
                                                                </span>
                                                                <span className="block text-[9px] font-medium uppercase tracking-wider text-black/70">{t('social.connectKickDesc')}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} strokeWidth={3} className="text-black group-hover/kick:translate-y-0.5 transition-transform" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Action Button - Hidden for IG/Twitch/YT/Kick if connected */}
                                            {!((configuringPlatform === 'instagram' && isInstagramConnected) ||
                                                (configuringPlatform === 'twitch' && isTwitchConnected) ||
                                                (configuringPlatform === 'youtube' && isYoutubeConnected) ||
                                                (configuringPlatform === 'kick' && isKickConnected)) && (
                                                    <button
                                                        onClick={confirmPlatform}
                                                        disabled={!tempUrl}
                                                        className={`
                                                        w-full mt-2 py-3 font-medium text-[10px] uppercase tracking-widest transition-all border border-[#1a1a1a]
                                                        ${tempUrl
                                                                ? 'bg-[#97cd7a] text-black shadow-[0_2px_0_0_rgba(26,26,26,1)] hover:translate-y-[1px] hover:shadow-none'
                                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-[0_2px_0_0_rgba(26,26,26,1)]'
                                                            }
                                                    `}
                                                    >
                                                        {links.some(l => l.layout === 'social' && (l.platform === configuringPlatform || (configuringPlatform !== 'site' && configuringPlatform !== 'custom' && l.url.includes(configuringPlatform)))) ? t('common.save') : t('common.add')}
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                )}
                                </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
