import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES, SOCIAL_NETWORKS } from '../constants';
import {
    Signal,
    Wifi,
    Battery,
    Share2,
    Globe,
    ShoppingBag,
    MoreHorizontal,
    MoreVertical,
    Coffee,
    BadgeCheck,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Play,
    Plus,
    Music,
    Pause,
    SkipBack,
    SkipForward,
    Music2
} from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';
import verifiedBadge from '../assets/verified-badge.png';

import BackgroundLayer from './BackgroundLayer';
import { apiClient } from '../services/apiClient';
import { SiSpotify } from 'react-icons/si';
// @ts-ignore
import NewsletterWidget from './NewsletterWidget';
import Prism from './Prism';
import GlassSurface from './GlassSurface';
import { KawaiiSakuraForeground } from './KawaiiBackgrounds';

interface ProfileRendererProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    isPreview?: boolean; // If true, shows mock status bar (9:41, wifi etc)
    isStatic?: boolean; // If true, disables animated backgrounds for performance (e.g. in ThemeSelector)
    onShare?: () => void;
}

const ProfileRenderer: React.FC<ProfileRendererProps> = ({ profile, links, products = [], isPreview = false, isStatic = false, onShare }) => {
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const activeLinks = links.filter(l => l.isActive && !l.isArchived);
    const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');
    const [activeCollection, setActiveCollection] = useState<string | null>(null);

    // Group products
    // @ts-ignore
    const collections = React.useMemo(() => {
        const groups: Record<string, Product[]> = {};
        products.forEach(p => {
            const col = p.collection || 'Geral';
            if (!groups[col]) groups[col] = [];
            groups[col].push(p);
        });
        return groups;
    }, [products]);

    const handleCollectionClick = (colName: string) => {
        setActiveCollection(colName);
    };

    // Track view on mount (only if not in preview/editor mode)
    // @ts-ignore
    React.useEffect(() => {
        if (!isPreview && profile.id && apiClient) {
            try {
                apiClient.trackPageView(profile.id);
            } catch (e) { console.error(e); }
        }
    }, [profile.id, isPreview]);

    // Top level social links
    const socialLinks = activeLinks.filter(l => l.layout === 'social' && l.type !== 'collection');

    // Button links
    const buttonLinks = activeLinks.filter(l => l.layout !== 'social' || l.type === 'collection');

    const getLuminance = (hex: string) => {
        const rgb = hex.replace('#', '').match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [255, 255, 255];
        return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    };

    const isDarkTheme =
        profile.customSolidColor
            ? getLuminance(profile.customSolidColor) < 0.5
            : currentTheme.id.includes('dark') ||
            currentTheme.id.includes('black') ||
            currentTheme.id.includes('midnight') ||
            currentTheme.id.includes('vampire') ||
            currentTheme.id.includes('animated-') ||
            ['luxury-gold', 'leafy', 'evergreen', 'golden-hour', 'berry-blast', 'steel-blue', 'iridescence', 'prismatic-burst', 'beams', 'silk', 'gradient-sunset-horizon', 'gradient-deep-ocean', 'gradient-midnight-neon', 'gradient-royal-velvet'].includes(currentTheme.id) ||
            currentTheme.id === 'kawaii-space' ||
            currentTheme.id === 'creative-pixel' ||
            (currentTheme.id.startsWith('music-') && currentTheme.id !== 'music-classical-flow') ||
            currentTheme.id === 'solaris';

    const getHighlightClass = (type?: string) => {
        switch (type) {
            case 'pulse': return 'animate-pulse';
            case 'bounce': return 'animate-bounce';
            case 'shake': return 'animate-shake';
            case 'glow': return 'animate-glow';
            case 'wobble': return 'animate-wobble';
            default: return '';
        }
    };

    const handleLinkClick = async (id: string) => {
        try {
            // Track click via API
            if (apiClient) await apiClient.trackClick(id);
        } catch (e) {
            console.error('Failed to track click:', e);
        }
    };

    // Utility to detect Music links (Spotify/Deezer)
    const isMusicLink = (link: LinkItem) => {
        if (link.embedType === 'spotify' || link.embedType === 'deezer') return true;
        const lowerUrl = link.url.toLowerCase();
        return (lowerUrl.includes('spotify.com') || lowerUrl.includes('deezer.com') || lowerUrl.includes('deezer.page.link')) && (
            lowerUrl.includes('/track/') ||
            lowerUrl.includes('/album/') ||
            lowerUrl.includes('/playlist/')
        );
    };

    const MusicRichCard: React.FC<{ link: LinkItem, handleLinkClick: (id: string) => void }> = ({ link, handleLinkClick }) => {
        const musicTitle = link.title || 'Música';
        const musicArtist = link.subtitle || 'Artista';
        const isDeezer = link.embedType === 'deezer' || link.url.includes('deezer');
        const platformColor = isDeezer ? '#a238ff' : '#a49a2a'; // Deezer purple vs Spotify yellowish-olive

        const DeezerIcon = ({ size }: { size: number }) => (
            <svg width={size} height={size} viewBox="0 0 1433 1431" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" fillRule="evenodd" d="M1201.8 218.3c13.2-76.7 32.7-125 54.2-125.1h.1c40.2.2 72.7 167.5 72.7 374.1 0 206.7-32.6 374.1-72.8 374.1-16.5 0-31.7-28.4-44-76.1-19.3 174.5-59.5 294.4-106 294.4-36 0-68.3-72-90-185.6-14.8 216-52.1 369.3-95.6 369.3-27.3 0-52.3-60.7-70.7-159.6-22.2 204.1-73.5 347.2-133.2 347.2-59.8 0-111.1-143-133.2-347.2-18.3 98.9-43.3 159.6-70.7 159.6-43.6 0-80.8-153.3-95.6-369.3-21.7 113.6-53.9 185.6-90 185.6-46.5 0-86.7-119.9-106.1-294.4-12.1 47.8-27.4 76.1-43.9 76.1-40.3 0-72.9-167.4-72.9-374.1 0-206.6 32.6-374.1 72.9-374.1 21.6 0 40.9 48.4 54.3 125.1C252.7 86 287.6 0 327 0c46.8 0 87.3 121.6 106.5 298.2 18.8-128.5 47.2-210.4 79.1-210.4 44.7 0 82.7 161.1 96.8 385.9 26.4-115.2 64.8-187.5 107.2-187.5s80.7 72.3 107.1 187.5c14.1-224.8 52.1-385.9 96.8-385.9 31.8 0 60.2 81.9 79.1 210.4C1018.7 121.6 1059.3 0 1106.1 0c39.2 0 74.2 86 95.7 218.3M41.3 597.8C18.5 597.8 0 523 0 430.5s18.5-167.2 41.3-167.2c22.9 0 41.4 74.7 41.4 167.2S64.2 597.8 41.3 597.8m1350.3 0c-22.9 0-41.3-74.8-41.3-167.3s18.4-167.2 41.3-167.2c22.8 0 41.3 74.7 41.3 167.2s-18.5 167.3-41.3 167.3" />
            </svg>
        );

        return (
            <div className={`${roundedClass || 'rounded-2xl'} p-2.5 flex items-center relative overflow-hidden group shadow-md border border-white/5 min-h-[64px] w-full ${isDeezer ? 'bg-[#1a1c3b]' : 'bg-[#5c540d]'}`}>
                {/* Album Art */}
                <div className={`relative z-10 w-[42px] h-[42px] ${profile.buttonRoundness === 'square' ? 'rounded-none' : 'rounded-md'} overflow-hidden shadow-sm mr-2.5 shrink-0`}>
                    <img
                        src={link.image || (isDeezer ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg' : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b')}
                        alt={musicTitle}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Text Info */}
                <div className="relative z-10 flex-1 min-w-0 pr-6">
                    <h3 className="text-white text-[13px] truncate leading-tight opacity-95">{musicTitle}</h3>
                    <p style={{ color: platformColor }} className="text-[10px] truncate leading-tight mt-0.5 opacity-80">{musicArtist}</p>

                    {/* Badge - even smaller */}
                    <div className="inline-block bg-[#1a1804]/40 px-1 py-0.5 rounded text-[8px] text-white uppercase tracking-tighter mt-1">
                        Prév<span className={isDeezer ? 'text-pink-400' : 'text-cyan-400'}>i</span>a
                    </div>
                </div>

                {/* Top Right Icon - smaller */}
                <div className="absolute top-2.5 right-2.5 z-10 text-white/60">
                    {isDeezer ? <DeezerIcon size={14} /> : <SiSpotify size={14} />}
                </div>

                {/* Bottom Action Controls - Tiny Play Button Only */}
                <div className="absolute bottom-2 right-2 z-10">
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLinkClick(link.id);
                        }}
                        className="w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center text-black shadow-sm"
                    >
                        <Play size={12} fill="currentColor" className="ml-0.5" />
                    </a>
                </div>

                {/* Background Grain/Noise Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" />
            </div>
        );
    };

    // Button Roundness Logic
    const roundedClass = profile.buttonRoundness === 'square' ? 'rounded-none' :
        profile.buttonRoundness === 'round' ? 'rounded-lg' :
            profile.buttonRoundness === 'rounder' ? 'rounded-2xl' :
                profile.buttonRoundness === 'full' ? 'rounded-full' :
                    null;

    const borderRadiusValue = profile.buttonRoundness === 'square' ? 0 :
        profile.buttonRoundness === 'round' ? 8 :
            profile.buttonRoundness === 'rounder' ? 16 :
                profile.buttonRoundness === 'full' ? 40 : // Full for GlassSurface usually looks best around 40 or higher
                    16;

    // Helper to strip existing rounding and font classes from theme button class
    const getCleanedThemeButtonClass = (cls: string) => {
        let cleaned = cls;
        // Strip rounding
        cleaned = cleaned.replace(/\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b|\brounded\b/g, '');
        // Strip font family and weight classes to allow inheritance/override
        cleaned = cleaned.replace(/\bfont-(sans|serif|mono|bold|black|medium|light|thin|extrabold|semibold)\b/g, '');
        return cleaned.trim();
    };

    const buttonClass = roundedClass
        ? `${getCleanedThemeButtonClass(currentTheme.buttonClass)} ${roundedClass}`
        : getCleanedThemeButtonClass(currentTheme.buttonClass);

    const buttonHex = currentTheme.buttonHex;
    // Lower threshold for more aggressive light button detection (white is 1, so 0.6 is quite early)
    const isButtonLight = buttonHex ? getLuminance(buttonHex) > 0.6 : false;

    // Universal Helper for Button Text Contrast
    const getSmartTextColor = () => {
        // 1. If the button specifically is light, we MUST use dark text for visibility
        if (isButtonLight) return '#0f172a'; // slate-900 equivalent
        // 2. If it's a glass theme or has a custom photo background, use white for premium contrast
        if (currentTheme.id === 'glass' || profile.customBackground) return '#ffffff';
        // 3. If the theme's default text class is white (e.g. dark themes), follow that
        if (currentTheme.textClass.includes('text-white')) return '#ffffff';
        // 4. Default to undefined to let Tailwind/Inheritance handle it
        return undefined;
    };

    const textClass = currentTheme.textClass;


    return (
        <div
            className="relative w-full h-full flex flex-col overflow-hidden"
            style={{ fontFamily: profile.fontFamily }}
        >
            <style>{`
                @keyframes wobble {
                    0%, 100% { transform: translateX(0%); }
                    15% { transform: translateX(-5%) rotate(-5deg); }
                    30% { transform: translateX(4%) rotate(3deg); }
                    45% { transform: translateX(-3%) rotate(-3deg); }
                    60% { transform: translateX(2%) rotate(2deg); }
                    75% { transform: translateX(-1%) rotate(-1deg); }
                }
                .animate-wobble { animation: wobble 1s infinite; }
                .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both infinite; transform: translate3d(0, 0, 0); }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .animate-glow { animation: glow-pulse 2s infinite; }
                @keyframes glow-pulse {
                    0% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
                    50% { box-shadow: 0 0 20px rgba(255,255,255,0.6); }
                    100% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
                }
                @keyframes wobble-shape {
                    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                    50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1.02); }
                    75% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
                }
            `}</style>
            {/* Background Layer */}
            <BackgroundLayer profile={profile} currentTheme={currentTheme} isStatic={isStatic} />

            {/* GLOBAL BLUR FADE OVERLAY */}
            {profile.enableBlur && (
                <>
                    {/* Final Refined Backdrop Blur Overlay */}
                    <div
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{
                            backgroundColor: 'transparent',
                            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 2%, rgba(0,0,0,0.05) 5%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.95) 40%, black 45%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 2%, rgba(0,0,0,0.05) 5%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.95) 40%, black 45%)',
                            backdropFilter: 'blur(80px)',
                            WebkitBackdropFilter: 'blur(80px)'
                        }}
                    />
                </>
            )}

            {/* Content Container */}
            <div
                className={`w-full h-full overflow-y-auto scrollbar-hide flex flex-col relative z-20 overscroll-none ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass}`}
                style={{
                    fontFamily: profile.fontFamily,
                    fontSize: `${profile.fontSize || 16}px`,
                    fontWeight: profile.fontWeight || undefined,
                    fontStyle: profile.fontItalic ? 'italic' : 'normal',
                    overscrollBehavior: 'none'
                }}
            >
                <div>
                    {/* Status Bar - Only for Preview Mode */}
                    {isPreview && (
                        <div className={`w-full px-6 pt-3 pb-2 flex justify-between items-center z-20 ${isDarkTheme || profile.customBackground || currentTheme.id === 'glass' ? 'text-white' : 'text-slate-900'}`}>
                            <span className="text-xs font-semibold tracking-wide">9:41</span>
                            <div className="flex items-center gap-1.5 opacity-90">
                                <Signal size={12} strokeWidth={2.5} />
                                <Wifi size={12} strokeWidth={2.5} />
                                <Battery size={14} strokeWidth={2.5} />
                            </div>
                        </div>
                    )}

                    {/* Share Button */}
                    {/* 
            For public profile, we might want a real share button. 
            For now putting the mock one but maybe enabling it? 
            Let's keep it mock/visual for now as per original.
        */}
                    <div className="absolute top-[34px] right-6 z-20">
                        <button
                            onClick={onShare}
                            className={`p-2 rounded-xl transition-colors ${isDarkTheme || profile.customBackground || currentTheme.id === 'glass' ? 'text-white hover:bg-white/10 drop-shadow-md' : 'text-slate-800 hover:bg-black/5'}`}
                        >
                            <Share2 size={24} className="drop-shadow-sm" />
                        </button>
                    </div>
                    {/* Menu / Options Button */}
                    <div className="absolute top-[34px] left-6 z-20">
                        <div className="p-2">
                            <img src="/icons/logo_icone.png" alt="Nodus" className="w-8 h-8 object-contain opacity-90 rounded-xl" />
                        </div>
                    </div>



                    {/* Custom CSS Injection */}
                    {profile.customCSS && (
                        <style dangerouslySetInnerHTML={{ __html: profile.customCSS }} />
                    )}

                    {/* Content Scrollable Area */}
                    <div className={`px-6 pb-12 ${isPreview ? 'pt-12' : 'pt-16'} flex-1 flex flex-col min-h-full`}>

                        {/* Profile Section */}
                        <motion.div className={`w-full mb-6 ${profile.headerLayout === 'compact'
                            ? 'flex flex-row items-center gap-4 text-left px-2'
                            : 'flex flex-col items-center text-center'
                            }`}>
                            {/* Avatar */}
                            {profile.avatarUrl && (
                                <div className={`relative group shrink-0 ${profile.headerLayout === 'compact' ? 'mb-0' : 'mb-4'
                                    }`}>
                                    <div className={`rounded-full overflow-hidden border-4 shadow-lg ${currentTheme.avatarBorder
                                        } ${profile.avatarSize === 'sm' ? 'w-20 h-20' :
                                            profile.avatarSize === 'lg' ? 'w-32 h-32' :
                                                'w-24 h-24' // default (md)
                                        } ${profile.headerLayout === 'hero' ? 'w-40 h-40 border-[6px]' : ''
                                        }`}>
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Nodus'}`;
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Name/Logo & Bio */}
                            <div className={`flex flex-col ${profile.headerLayout === 'compact' ? 'items-start' : 'items-center'} ${profile.headerLayout === 'compact' ? 'flex-1 min-w-0' : ''}`}>
                                <div className="flex items-center gap-2 justify-center w-full">
                                    {profile.headerStyle === 'logo' && profile.logoUrl ? (
                                        <img
                                            src={profile.logoUrl}
                                            alt={profile.name}
                                            className={`mb-2 object-contain ${profile.headerLayout === 'hero' ? 'h-20' : 'h-12'
                                                }`}
                                        />
                                    ) : (
                                        <h3
                                            className={`mb-1 tracking-tight flex items-center gap-2 text-wrap break-words ${profile.headerLayout === 'hero' ? 'text-[2em]' : 'text-[1.5em]'}`}
                                            style={{ fontWeight: profile.fontWeight, fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                        >
                                            {profile.name}
                                            {profile.isVerified && (
                                                <img
                                                    src={verifiedBadge}
                                                    alt="Verificado"
                                                    className="w-6 h-6 object-contain shrink-0"
                                                    title="Conta Verificada"
                                                />
                                            )}
                                        </h3>
                                    )}
                                </div>

                                {profile.bio && (
                                    <p className={`text-[1em] opacity-90 leading-relaxed whitespace-pre-line ${profile.headerLayout === 'compact' ? 'text-left' : 'text-center max-w-[300px]'}`}
                                        style={{ fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                    >
                                        {profile.bio}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Social Icons Row */}
                        {socialLinks.length > 0 && (
                            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap relative">
                                {socialLinks.map(link => {
                                    const network = SOCIAL_NETWORKS.find(n => n.name === link.title) ||
                                        SOCIAL_NETWORKS.find(n => link.url.toLowerCase().includes(n.id)) ||
                                        SOCIAL_NETWORKS[0];

                                    const Icon = network.icon || Globe;

                                    return (
                                        <motion.a
                                            key={link.id}
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => handleLinkClick(link.id)}
                                            className={`${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass}`}
                                        >
                                            <Icon size={24} />
                                        </motion.a>
                                    );
                                })}
                            </div>
                        )}

                        {/* TABS (Links / Shop) - Only if products exist */}
                        {products.length > 0 && (
                            <div className="w-full mb-6 px-1 flex justify-center">
                                <div className={`w-auto min-w-[180px] p-1 rounded-full flex relative ${isDarkTheme || profile.customBackground || currentTheme.id === 'glass' ? 'bg-white/10' : 'bg-slate-200/60'}`}>
                                    {/* Sliding background could be complex, sticking to simple conditional classes for now */}
                                    <button
                                        onClick={() => setActiveTab('links')}
                                        className={`flex-1 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'links'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : `${isDarkTheme || profile.customBackground || currentTheme.id === 'glass' ? 'text-white/70' : 'text-slate-600'} hover:opacity-100`
                                            }`}
                                    >
                                        Links
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('shop')}
                                        className={`flex-1 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'shop'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : `${isDarkTheme || profile.customBackground || currentTheme.id === 'glass' ? 'text-white/70' : 'text-slate-600'} hover:opacity-100`
                                            }`}
                                    >
                                        Loja
                                    </button>
                                </div>
                            </div>
                        )}


                        {/* Main Dynamic Content Area */}
                        <AnimatePresence mode="popLayout" initial={false}>
                            {/* SHOP VIEW (Collections or Grid) */}
                            {products.length > 0 && activeTab === 'shop' && (
                                <motion.div
                                    key="shop-tab"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0 }}
                                    className="w-full space-y-4"
                                >

                                    {/* Collection List View */}
                                    {!activeCollection ? (
                                        <div className="space-y-4">
                                            <div className={`flex items-center gap-2 mb-2 text-base font-bold opacity-80 ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass} px-1`}>
                                                <ShoppingBag size={18} />
                                                <span>Coleções</span>
                                            </div>

                                            {Object.entries(collections).map(([name, items]) => (
                                                <button
                                                    key={name}
                                                    onClick={() => handleCollectionClick(name)}
                                                    className={`w-full group relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${buttonClass}`}
                                                >
                                                    {currentTheme.id === 'glass' ? (
                                                        <GlassSurface
                                                            width="100%"
                                                            height="auto"
                                                            borderRadius={borderRadiusValue}
                                                            displace={0.5}
                                                            distortionScale={-180}
                                                            redOffset={0}
                                                            greenOffset={10}
                                                            blueOffset={20}
                                                            brightness={50}
                                                            opacity={0.93}
                                                            mixBlendMode="screen"
                                                        >
                                                            <div className="p-1">
                                                                {/* Preview Images Collage */}
                                                                <div className="flex h-48 w-full gap-0.5 rounded-t-xl overflow-hidden bg-slate-100">
                                                                    {items.slice(0, 3).map((item, i) => (
                                                                        <div key={item.id} className="flex-1 h-full relative">
                                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                        </div>
                                                                    ))}
                                                                    {/* Fill empty slots if less than 3? No, flex-1 handles it */}
                                                                </div>
                                                                <div className="p-3 text-left">
                                                                    <h3 className="text-lg font-bold text-white">{name}</h3>
                                                                    <div className="flex items-center gap-1 text-xs text-white/70 font-medium">
                                                                        <span>{items.length} produtos</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </GlassSurface>
                                                    ) : (
                                                        <div className="p-1">
                                                            {/* Preview Images Collage */}
                                                            <div className="flex h-48 w-full gap-0.5 rounded-t-xl overflow-hidden bg-slate-100">
                                                                {items.slice(0, 3).map((item, i) => (
                                                                    <div key={item.id} className="flex-1 h-full relative border-r border-white/20 last:border-0">
                                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="p-3 text-center">
                                                                <h3 className="text-sm font-medium">{name}</h3>
                                                                <div className="flex justify-center items-center gap-1 text-[10px] opacity-80 font-medium uppercase tracking-wide">
                                                                    <span>{items.length} produtos</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Filtered Product Grid */
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveCollection(null)}
                                                className={`flex items-center gap-2 mb-4 text-sm font-bold opacity-80 hover:opacity-100 transition ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass} px-1`}
                                            >
                                                <ChevronDown size={16} className="rotate-90" />
                                                <span>Voltar para Coleções</span>
                                            </button>

                                            <div className={`flex items-center gap-2 mb-4 text-xl font-bold ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass} px-1`}>
                                                <span>{activeCollection}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pb-8">
                                                {collections[activeCollection].map(product => (
                                                    <a key={product.id} href={product.url} target="_blank" rel="noreferrer" onClick={() => handleLinkClick(product.id)} className={`flex flex-col gap-2 group relative ${roundedClass || 'rounded-2xl'} w-full transition-all duration-300 ${currentTheme.id === 'glass' ? '' : 'p-2'}`}>
                                                        {currentTheme.id === 'glass' ? (
                                                            <GlassSurface
                                                                width="100%"
                                                                height="auto"
                                                                borderRadius={borderRadiusValue}
                                                                displace={0.5}
                                                                distortionScale={-180}
                                                                redOffset={0}
                                                                greenOffset={10}
                                                                blueOffset={20}
                                                                brightness={50}
                                                                opacity={0.93}
                                                                mixBlendMode="screen"
                                                            >
                                                                <div className="flex flex-col gap-2 w-full p-2">
                                                                    <div className={`aspect-square ${roundedClass || 'rounded-xl'} overflow-hidden border-2 transition-transform transform group-hover:scale-[1.02] ${currentTheme.avatarBorder} bg-white relative w-full`}>
                                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                                        {product.discountCode && (
                                                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg shadow-sm">
                                                                                {product.discountCode}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col gap-0.5 w-full">
                                                                        <span className="text-sm truncate text-center text-white opacity-90">{product.name}</span>
                                                                        {product.price && (
                                                                            <span className="text-xs truncate text-center text-white">{product.price}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </GlassSurface>

                                                        ) : (
                                                            <div className="relative z-10 flex flex-col gap-2">
                                                                <div className={`aspect-square ${roundedClass || 'rounded-xl'} overflow-hidden border-2 transition-transform transform group-hover:scale-[1.02] ${currentTheme.avatarBorder} bg-white relative`}>
                                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                                    {product.discountCode && (
                                                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm">
                                                                            {product.discountCode}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-sm font-medium truncate text-center opacity-90">{product.name}</span>
                                                                    {product.price && (
                                                                        <span className="text-xs font-bold truncate text-center">{product.price}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Button Links List - Show if activeTab matches OR no products */}
                            {(products.length === 0 || activeTab === 'links') && (
                                <motion.div
                                    key="links-tab"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0 }}
                                    className="flex flex-col gap-4 w-full flex-1 relative"
                                >
                                    {(() => {
                                        const renderedItems: React.ReactNode[] = [];

                                        const themeButtonHex = currentTheme.buttonHex || ((isDarkTheme || currentTheme.id === 'glass') ? '#ffffff' : '#0f172a');
                                        const cardAccentColor = themeButtonHex;
                                        const cardTextColor = (isDarkTheme || currentTheme.id === 'glass' ? '#ffffff' : '#0f172a');

                                        let currentIconGroup: LinkItem[] = [];
                                        let currentCardGroup: LinkItem[] = [];

                                        const flushIcons = () => {
                                            if (currentIconGroup.length > 0) {
                                                const group = [...currentIconGroup];
                                                renderedItems.push(
                                                    <div key={`social-row-${group[0].id}`} className="flex items-center justify-center gap-5 w-full mb-6 flex-wrap relative">
                                                        {group.map(iconLink => {
                                                            const network = SOCIAL_NETWORKS.find(n => iconLink.title.toLowerCase().includes(n.id)) ||
                                                                SOCIAL_NETWORKS.find(n => iconLink.url.toLowerCase().includes(n.id)) ||
                                                                SOCIAL_NETWORKS[0];

                                                            const Icon = network.icon || Globe;
                                                            const isGlass = currentTheme.id === 'glass';

                                                            return (
                                                                <motion.a
                                                                    key={iconLink.id}
                                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ duration: 0 }}
                                                                    href={iconLink.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={() => handleLinkClick(iconLink.id)}
                                                                    className={`relative group flex items-center justify-center ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass}`}
                                                                >
                                                                    {isGlass ? (
                                                                        <div className="absolute inset-0 -m-2">
                                                                            <GlassSurface width="100%" height="100%" displace={0.2} distortionScale={-50} brightness={40} opacity={0.8} mixBlendMode="screen" className="w-full h-full" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`absolute inset-0 -m-2 opacity-10 rounded-full ${currentTheme.id.includes('dark') ? 'bg-white' : 'bg-black'}`}></div>
                                                                    )}

                                                                    <div className="relative z-10 p-1">
                                                                        {iconLink.image ? (
                                                                            <img src={iconLink.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                                                        ) : (
                                                                            <Icon size={28} />
                                                                        )}
                                                                    </div>
                                                                </motion.a>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                                currentIconGroup = [];
                                            }
                                        };

                                        const flushCards = () => {
                                            if (currentCardGroup.length > 0) {
                                                const group = [...currentCardGroup];
                                                renderedItems.push(
                                                    <div key={`card-grid-${group[0].id}`} className="grid grid-cols-2 gap-2.5 mb-8">
                                                        {group.map((cardLink) => {
                                                            const cardBg = cardAccentColor;
                                                            const isGlass = currentTheme.id === 'glass';

                                                            return (
                                                                <motion.a
                                                                    key={cardLink.id}
                                                                    transition={{ duration: 0 }}
                                                                    href={cardLink.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={() => handleLinkClick(cardLink.id)}
                                                                    className={`flex flex-col overflow-hidden relative group transition-all w-full aspect-[3/3.8] ${!isGlass ? buttonClass : ''}`}
                                                                >
                                                                    {isGlass ? (
                                                                        <div className="absolute inset-0 z-0">
                                                                            <GlassSurface width="100%" height="100%" displace={0.5} distortionScale={-180} brightness={50} opacity={0.93} mixBlendMode="screen" className="w-full h-full" borderRadius={borderRadiusValue} />
                                                                        </div>
                                                                    ) : null}

                                                                    <div className="relative z-10 flex flex-col h-full w-full">
                                                                        <div
                                                                            className="flex-1 w-full relative overflow-hidden"
                                                                            style={{ backgroundColor: cardBg + '1A' }}
                                                                        >
                                                                            {cardLink.image ? (
                                                                                <img src={cardLink.image} alt="" className="w-full h-full object-cover transition-transform duration-700" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                                                                    <Globe size={40} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="p-2.5 flex flex-col justify-center items-center text-center h-16 relative">
                                                                            <span className="text-[0.7em] leading-tight truncate px-1 font-bold" style={{ color: getSmartTextColor() }}>{cardLink.title}</span>
                                                                            {cardLink.subtitle && <span className="text-[0.62em] leading-tight truncate px-1 opacity-60 mt-0.5" style={{ color: getSmartTextColor() }}>{cardLink.subtitle}</span>}
                                                                        </div>
                                                                    </div>
                                                                </motion.a>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                                currentCardGroup = [];
                                            }
                                        };

                                        buttonLinks.forEach(link => {
                                            if (link.layout === 'icon') {
                                                flushCards();
                                                currentIconGroup.push(link);
                                            } else if (link.layout === 'card') {
                                                flushIcons();
                                                currentCardGroup.push(link);
                                            } else {
                                                flushIcons();
                                                flushCards();

                                                if (isMusicLink(link)) {
                                                    renderedItems.push(<motion.div key={link.id} transition={{ duration: 0 }} className="w-full mb-5"><MusicRichCard link={link} handleLinkClick={handleLinkClick} /></motion.div>);
                                                } else if (link.embedType === 'youtube') {
                                                    renderedItems.push(<motion.div key={link.id} transition={{ duration: 0 }} className="mb-4"><YouTubeEmbed url={link.url} title={link.title} className={roundedClass || 'rounded-2xl'} /></motion.div>);
                                                } else {
                                                    const activeChildren = link.children?.filter(c => c.isActive) || [];

                                                    if (activeChildren.length > 0) {
                                                        const collectionLayout = (link.layout === 'carousel') ? 'carousel' : 'stacked';

                                                        if (collectionLayout === 'carousel') {
                                                            const scrollContainerId = `scroll-${link.id}`;
                                                            const scroll = (direction: 'left' | 'right') => {
                                                                const container = document.getElementById(scrollContainerId);
                                                                if (container) {
                                                                    const scrollAmount = 250;
                                                                    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
                                                                }
                                                            };

                                                            renderedItems.push(
                                                                <motion.div key={link.id} transition={{ duration: 0 }} className="w-full pt-2 pb-1 group/carousel">
                                                                    <div className={`text-center mb-3 opacity-90 text-lg font-bold ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass}`}>{link.title}</div>
                                                                    <div className="relative w-full">
                                                                        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-30 p-2 bg-white/90 text-slate-900 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-white"><ChevronLeft size={20} /></button>
                                                                        <div id={scrollContainerId} className="flex overflow-x-auto gap-3 px-1 pb-4 -mx-1 scrollbar-hide snap-x relative scroll-smooth">
                                                                            {activeChildren.map(child => {
                                                                                const isGlass = currentTheme.id === 'glass';
                                                                                return (
                                                                                    <motion.a
                                                                                        key={child.id}
                                                                                        transition={{ duration: 0 }}
                                                                                        href={child.url}
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                        onClick={() => handleLinkClick(child.id)}
                                                                                        className={`relative group flex-shrink-0 w-40 snap-start flex flex-col overflow-hidden transition-all duration-300 ${!isGlass ? buttonClass : ''}`}
                                                                                    >
                                                                                        {isGlass ? (
                                                                                            <div className="absolute inset-0 z-0">
                                                                                                <GlassSurface width="100%" height="100%" displace={0.5} distortionScale={-180} brightness={50} opacity={0.93} mixBlendMode="screen" className="w-full h-full" borderRadius={borderRadiusValue} />
                                                                                            </div>
                                                                                        ) : null}

                                                                                        <div className="relative z-10 flex flex-col h-full w-full">
                                                                                            <div className="h-32 w-full bg-slate-100/10 relative">
                                                                                                {child.image ? <img src={child.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-200/20 text-slate-400"><ShoppingBag size={20} /></div>}
                                                                                            </div>
                                                                                            <div className="p-2 flex flex-col justify-center items-center text-center h-12 relative">
                                                                                                <span className="text-[0.7em] leading-tight truncate font-bold w-full" style={{ color: getSmartTextColor() }}>{child.title}</span>
                                                                                                {child.subtitle && <span className="text-[0.62em] leading-tight truncate opacity-60 w-full" style={{ color: getSmartTextColor() }}>{child.subtitle}</span>}
                                                                                            </div>
                                                                                        </div>
                                                                                    </motion.a>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-30 p-2 bg-white/90 text-slate-900 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-white"><ChevronRight size={20} /></button>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        } else {
                                                            renderedItems.push(
                                                                <motion.div key={link.id} transition={{ duration: 0 }} className="w-full pt-2 pb-1">
                                                                    <div className={`text-center mb-3 font-bold opacity-90 text-lg ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass}`}>{link.title}</div>
                                                                    <div className="flex flex-col gap-4 relative">
                                                                        {activeChildren.map(child => {
                                                                            if (isMusicLink(child)) return <motion.div key={child.id} transition={{ duration: 0 }} className="w-full"><MusicRichCard link={child} handleLinkClick={handleLinkClick} /></motion.div>;
                                                                            if (child.embedType === 'youtube') return <motion.div key={child.id} transition={{ duration: 0 }} className="mb-4"><YouTubeEmbed url={child.url} title={child.title} className={roundedClass || 'rounded-2xl'} /></motion.div>;

                                                                            const isGlass = currentTheme.id === 'glass';

                                                                            return (
                                                                                <motion.a
                                                                                    key={child.id}
                                                                                    transition={{ duration: 0 }}
                                                                                    href={child.url}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    onClick={() => handleLinkClick(child.id)}
                                                                                    className={`block w-full text-center text-base transform group relative ${isGlass ? '' : `py-4 px-6 flex items-center justify-between ${buttonClass} ${getHighlightClass(child.highlight)} overflow-hidden`}`}
                                                                                    style={{ fontFamily: profile.fontFamily, fontWeight: profile.fontWeight, fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                                                >
                                                                                    {isGlass ? (
                                                                                        <GlassSurface width="100%" height="auto" displace={0.5} distortionScale={-180} redOffset={0} greenOffset={10} blueOffset={20} brightness={50} opacity={0.93} mixBlendMode="screen" className={`${getHighlightClass(child.highlight)}`} borderRadius={borderRadiusValue}>
                                                                                            <div className="flex-1 px-1 py-1 flex flex-col justify-center text-white text-center">
                                                                                                <div className="flex items-center justify-between w-full px-2 py-1">
                                                                                                    {child.image ? <img src={child.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shrink-0" /> : <span className="w-8"></span>}
                                                                                                    <div className="flex-1 px-2 flex flex-col justify-center">
                                                                                                        <span className="text-[0.9em] leading-tight font-bold break-words">{child.title}</span>
                                                                                                        {child.subtitle && <span className="text-[0.75em] opacity-90 leading-tight mt-0.5 break-words">{child.subtitle}</span>}
                                                                                                    </div>
                                                                                                    <span className="w-8 shrink-0"></span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </GlassSurface>
                                                                                    ) : (
                                                                                        <>
                                                                                            <div className="relative z-10 w-full flex items-center justify-between">
                                                                                                {child.image ? <img src={child.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0" /> : <span className="w-8"></span>}
                                                                                                <div className="flex-1 px-1 flex flex-col justify-center text-center">
                                                                                                    <span className="text-[0.9em] leading-tight font-bold break-words" style={{ color: getSmartTextColor() }}>{child.title}</span>
                                                                                                    {child.subtitle && <span className="text-[0.75em] opacity-80 leading-tight flex items-center justify-center gap-1 mt-0.5 break-words" style={{ color: getSmartTextColor() }}>{child.subtitle}</span>}
                                                                                                </div>
                                                                                                <span className="w-8 shrink-0"></span>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </motion.a>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        }
                                                    } else {
                                                        renderedItems.push(
                                                            <motion.a
                                                                key={link.id}
                                                                transition={{ duration: 0 }}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={() => handleLinkClick(link.id)}
                                                                className={`block w-full min-h-[64px] text-center text-base transform group relative ${currentTheme.id === 'glass' ? '' : `py-2.5 px-6 flex items-center justify-between ${buttonClass} ${getHighlightClass(link.highlight)} overflow-hidden`}`}
                                                                style={{ fontFamily: profile.fontFamily, fontWeight: profile.fontWeight, fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                            >
                                                                {currentTheme.id === 'glass' ? (
                                                                    <GlassSurface width="100%" height="auto" displace={0.5} distortionScale={-180} redOffset={0} greenOffset={10} blueOffset={20} brightness={50} opacity={0.93} mixBlendMode="screen" className={`${getHighlightClass(link.highlight)}`} borderRadius={borderRadiusValue}>
                                                                        <div className="w-full flex items-center justify-between py-2 px-2">
                                                                            {link.image ? <img src={link.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shrink-0" /> : <span className="w-8"></span>}
                                                                            <div className="flex-1 px-1 flex flex-col justify-center text-white text-center">
                                                                                <span className="text-[0.9em] leading-tight font-bold break-words">{link.title}</span>
                                                                                {link.subtitle && <span className="text-[0.75em] opacity-90 leading-tight mt-0.5 break-words">{link.subtitle}</span>}
                                                                            </div>
                                                                            <span className="w-8 shrink-0"></span>
                                                                        </div>
                                                                    </GlassSurface>
                                                                ) : (
                                                                    <>

                                                                        <div className="relative z-10 w-full flex items-center justify-between px-2">
                                                                            {link.image ? <img src={link.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shrink-0" /> : <span className="w-8"></span>}
                                                                            <div className="flex-1 px-1 flex flex-col justify-center text-center">
                                                                                <span className="text-[0.9em] leading-tight font-bold break-words" style={{ color: getSmartTextColor() }}>{link.title}</span>
                                                                                {link.subtitle && <span className="text-[0.75em] opacity-80 leading-tight flex items-center justify-center gap-1 mt-0.5 break-words" style={{ color: getSmartTextColor() }}>{link.subtitle}</span>}
                                                                            </div>
                                                                            <span className="w-8 shrink-0"></span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </motion.a>
                                                        );
                                                    }
                                                }
                                            }
                                        });

                                        flushIcons();
                                        flushCards();
                                        return renderedItems;
                                    })()}

                                    {activeLinks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-50 space-y-2">
                                            <span className="text-sm">Nenhum link ativo</span>
                                        </div>
                                    )}
                                </motion.div>
                            )
                            }
                        </AnimatePresence>



                        {/* Theme-Integrated Support Button & Newsletter */}
                        <div className="mt-4 flex flex-col gap-4">
                            {profile.supportKey && (
                                <motion.a
                                    transition={{ duration: 0 }}
                                    href={profile.supportType === 'paypal' ? `https://${profile.supportKey}` : '#'}
                                    onClick={(e) => {
                                        if (profile.supportType === 'pix') {
                                            e.preventDefault();
                                            alert(`Chave Pix copiada: ${profile.supportKey}`);
                                            navigator.clipboard.writeText(profile.supportKey || '');
                                        }
                                    }}
                                    className={`block w-full min-h-[64px] text-center text-base transition-all duration-300 transform group relative ${currentTheme.id === 'glass' ? '' : `py-2.5 px-6 flex items-center justify-between ${buttonClass} overflow-hidden`}`}
                                    style={{ fontFamily: profile.fontFamily, fontWeight: profile.fontWeight, fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                >
                                    {currentTheme.id === 'glass' ? (
                                        <GlassSurface
                                            width="100%"
                                            height="auto"
                                            displace={0.5}
                                            distortionScale={-180}
                                            redOffset={0}
                                            greenOffset={10}
                                            blueOffset={20}
                                            brightness={50}
                                            opacity={0.93}
                                            mixBlendMode="screen"
                                            className=""
                                            borderRadius={borderRadiusValue}
                                        >
                                            <div className="w-full flex items-center justify-between py-3 px-5">
                                                {profile.supportType === 'pix' ? (
                                                    <img src="https://img.icons8.com/?size=100&id=CuUOYOfd3Dy9&format=png&color=000000" alt="Pix" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-0.5" />
                                                ) : (
                                                    <img src="https://img.icons8.com/?size=100&id=34525&format=png&color=000000" alt="PayPal" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-1" />
                                                )}
                                                <span className="truncate flex-1 px-3 text-white text-lg">Apoiar</span>
                                                <span className="w-8 opacity-50 text-white flex justify-end"><Coffee size={20} /></span>
                                            </div>
                                        </GlassSurface>
                                    ) : (
                                        <>

                                            <div className="relative z-10 w-full flex items-center justify-between">
                                                {profile.supportType === 'pix' ? (
                                                    <img src="https://img.icons8.com/?size=100&id=CuUOYOfd3Dy9&format=png&color=000000" alt="Pix" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-0.5" />
                                                ) : (
                                                    <img src="https://img.icons8.com/?size=100&id=34525&format=png&color=000000" alt="PayPal" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-1" />
                                                )}
                                                <span className="truncate flex-1 px-3" style={{ color: getSmartTextColor() }}>Apoiar</span>
                                                <span className="w-8 opacity-50 flex justify-end" style={{ color: getSmartTextColor() }}><Coffee size={20} /></span>
                                            </div>
                                        </>
                                    )}
                                </motion.a>
                            )}

                            {profile.showNewsletter && (
                                <motion.div className="w-full px-2">
                                    <NewsletterWidget profile={profile} />
                                </motion.div>
                            )}
                        </div>

                        <motion.div layout className="mt-auto pt-10 mb-8 flex flex-col items-center gap-1 w-full px-4">
                            {(() => {
                                const isWhiteBg = (profile.customSolidColor?.toLowerCase() === '#ffffff' || profile.customSolidColor?.toLowerCase() === '#fff') ||
                                    (!profile.customSolidColor && !profile.customBackground && (currentTheme.solidColor?.toLowerCase() === '#ffffff' || currentTheme.id === 'default'));
                                const btnClass = isWhiteBg ? 'bg-slate-950 text-white' : 'bg-white text-slate-900';

                                return (
                                    <a
                                        href="https://www.noduscc.com.br"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group flex items-center justify-center gap-2.5 px-6 py-2.5 ${roundedClass || 'rounded-full'} transition-all duration-300 shadow-sm ${btnClass}`}
                                    >
                                        <span
                                            className="text-[13px] tracking-tight"
                                            style={{ fontFamily: profile.fontFamily }}
                                        >
                                            Junte-se a {profile.name} no Nodus
                                        </span>
                                    </a>
                                );
                            })()}

                            {/* Legal Links (Minimalist) */}
                            <div className={`flex items-center gap-2 text-[10px] transition-opacity duration-300 ${isDarkTheme ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-600'}`}>
                                <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Termos</a>
                                <span>•</span>
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacidade</a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div >
            {/* Foreground Layer (For themes like Sakura) */}
            {currentTheme.id === 'kawaii-sakura' && <KawaiiSakuraForeground />}
        </div >
    );
};

export default ProfileRenderer;
