import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES, SOCIAL_NETWORKS } from '../constants';
import {
    Signal,
    Wifi,
    Battery,
    Share,
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
    Music2,
    Zap,
    CreditCard
} from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';
import TikTokEmbed from './TikTokEmbed';
import verifiedBadge from '../assets/verified-badge.png';

import BackgroundLayer from './BackgroundLayer';
import { apiClient } from '../services/apiClient';
import { SiSpotify } from 'react-icons/si';
import { InstagramCard } from './InstagramCard';
// @ts-ignore
import { Background as KawaiiSakuraForeground } from '../themes/kawaii-sakura';


interface ProfileRendererProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    isPreview?: boolean; // If true, shows mock status bar (9:41, wifi etc)
    isStatic?: boolean; // If true, disables animated backgrounds for performance (e.g. in ThemeSelector)
    onShare?: () => void;
    forcedTab?: 'links' | 'shop';
}

const ProfileRenderer: React.FC<ProfileRendererProps> = ({ profile, links, products = [], isPreview = false, isStatic = false, onShare, forcedTab }) => {
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const activeLinks = links.filter(l => l.isActive && !l.isArchived);
    const [activeTab, setActiveTab] = useState<'links' | 'shop'>(() => {
        return (localStorage.getItem('nodus_profile_active_tab') as 'links' | 'shop') || 'links';
    });

    // Sync with external force (e.g. Editor switching sections)
    React.useEffect(() => {
        if (forcedTab) {
            setActiveTab(forcedTab);
        }
    }, [forcedTab]);

    const [activeCollection, setActiveCollection] = useState<string | null>(() => {
        return localStorage.getItem('nodus_profile_active_collection');
    });

    // Persist activeTab to localStorage
    React.useEffect(() => {
        if (!isPreview) { // Only persist if not in preview mode (optional, but good practice)
            localStorage.setItem('nodus_profile_active_tab', activeTab);
        }
    }, [activeTab, isPreview]);

    React.useEffect(() => {
        if (activeCollection) {
            localStorage.setItem('nodus_profile_active_collection', activeCollection);
        } else {
            localStorage.removeItem('nodus_profile_active_collection');
        }
    }, [activeCollection]);

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

    // Validation: If activeCollection disappears (e.g. deleted), reset to main view
    React.useEffect(() => {
        if (activeCollection && !collections[activeCollection]) {
            console.log(`Resetting stale collection: ${activeCollection}`);
            setActiveCollection(null);
        }
    }, [activeCollection, collections]);

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
    const buttonLinks = activeLinks.filter(l => (l.layout !== 'social' || l.type === 'collection'));

    const getLuminance = (hex: string) => {
        const rgb = hex.replace('#', '').match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [255, 255, 255];
        return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    };

    const isDarkTheme =
        (profile.themeId === 'custom' && profile.customSolidColor)
            ? getLuminance(profile.customSolidColor) < 0.5
            : currentTheme.id.includes('dark') ||
            currentTheme.id.includes('black') ||
            currentTheme.id.includes('animated-') ||
            (currentTheme.category === 'advocacy' && currentTheme.id !== 'advocacy-equity') ||
            currentTheme.category === 'technology' ||
            currentTheme.category === 'engineering' || // Most engineering are dark
            currentTheme.id === 'modern-cyberpunk' ||
            currentTheme.id === 'modern-industrial' ||
            currentTheme.id === 'modern-retro' ||
            currentTheme.id === 'modern-royal-gold' ||
            currentTheme.id === 'crimson-strategy' ||
            currentTheme.id === 'social-tiktok' ||
            currentTheme.id === 'social-twitch' ||
            currentTheme.id === 'social-youtube';

    const tiktokIntegration = profile.integrations?.find(i => i.provider === 'tiktok');
    const tiktokFollowers = tiktokIntegration?.profile_data?.follower_count;
    const tiktokUsername = tiktokIntegration?.profile_data?.username;

    const instagramIntegration = profile.integrations?.find(i => i.provider === 'instagram');
    const instagramFollowers = instagramIntegration?.profile_data?.follower_count;
    const instagramUsername = instagramIntegration?.profile_data?.username;
    const instagramAvatar = instagramIntegration?.profile_data?.avatar_url;
    const instagramMedia = (instagramIntegration?.profile_data as any)?.media || [];

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

    const DeezerIcon = ({ size, color }: { size: number, color?: string }) => (
        <svg width={size} height={size} viewBox="0 0 1433 1431" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill={color || "currentColor"} fillRule="evenodd" d="M1201.8 218.3c13.2-76.7 32.7-125 54.2-125.1h.1c40.2.2 72.7 167.5 72.7 374.1 0 206.7-32.6 374.1-72.8 374.1-16.5 0-31.7-28.4-44-76.1-19.3 174.5-59.5 294.4-106 294.4-36 0-68.3-72-90-185.6-14.8 216-52.1 369.3-95.6 369.3-27.3 0-52.3-60.7-70.7-159.6-22.2 204.1-73.5 347.2-133.2 347.2-59.8 0-111.1-143-133.2-347.2-18.3 98.9-43.3 159.6-70.7 159.6-43.6 0-80.8-153.3-95.6-369.3-21.7 113.6-53.9 185.6-90 185.6-46.5 0-86.7-119.9-106.1-294.4-12.1 47.8-27.4 76.1-43.9 76.1-40.3 0-72.9-167.4-72.9-374.1 0-206.6 32.6-374.1 72.9-374.1 21.6 0 40.9 48.4 54.3 125.1C252.7 86 287.6 0 327 0c46.8 0 87.3 121.6 106.5 298.2 18.8-128.5 47.2-210.4 79.1-210.4 44.7 0 82.7 161.1 96.8 385.9 26.4-115.2 64.8-187.5 107.2-187.5s80.7 72.3 107.1 187.5c14.1-224.8 52.1-385.9 96.8-385.9 31.8 0 60.2 81.9 79.1 210.4C1018.7 121.6 1059.3 0 1106.1 0c39.2 0 74.2 86 95.7 218.3M41.3 597.8C18.5 597.8 0 523 0 430.5s18.5-167.2 41.3-167.2c22.9 0 41.4 74.7 41.4 167.2S64.2 597.8 41.3 597.8m1350.3 0c-22.9 0-41.3-74.8-41.3-167.3s18.4-167.2 41.3-167.2c22.8 0 41.3 74.7 41.3 167.2s-18.5 167.3-41.3 167.3" />
        </svg>
    );

    const MusicRichCard: React.FC<{ link: LinkItem, handleLinkClick: (id: string) => void }> = ({ link, handleLinkClick }) => {
        const musicTitle = link.title || 'Música';
        const musicArtist = link.subtitle || 'Artista';
        const isDeezer = link.embedType === 'deezer' || link.url.includes('deezer');
        const platformColor = isDeezer ? '#a238ff' : '#a49a2a'; // Deezer purple vs Spotify yellowish-olive


        return (
            <div className={`${roundedClass || 'rounded-2xl'} relative overflow-hidden group min-h-[80px] w-full isolate transform transition-all duration-300 hover:scale-[1.01]`}>
                {/* 1. Blurred Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={link.image || (isDeezer ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg' : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b')}
                        alt=""
                        className="w-full h-full object-cover blur-xl scale-150 opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                </div>

                {/* 2. Content Container */}
                <div className="relative z-10 flex items-center p-3 h-full gap-3.5">
                    {/* Album Art with shadow & border */}
                    <div className={`relative w-[52px] h-[52px] ${profile.buttonRoundness === 'square' ? 'rounded-none' : 'rounded-md'} overflow-hidden shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-500`}>
                        <img
                            src={link.image || (isDeezer ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg' : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b')}
                            alt={musicTitle}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                        <h3 className="text-white text-[14px] font-semibold truncate leading-tight tracking-tight shadow-black drop-shadow-sm" style={{ fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                            {musicTitle}
                        </h3>
                        <p className="text-white/80 text-[11px] truncate leading-tight font-medium" style={{ fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                            {musicArtist}
                        </p>

                        {/* Audio Wave / "Preview" Indicator & Platform Icon */}
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-end gap-0.5 h-2">
                                    <span className="w-0.5 h-full bg-green-400 animate-[music-bar_0.8s_ease-in-out_infinite]" />
                                    <span className="w-0.5 h-1/2 bg-green-400 animate-[music-bar_1.1s_ease-in-out_infinite]" />
                                    <span className="w-0.5 h-3/4 bg-green-400 animate-[music-bar_1.3s_ease-in-out_infinite]" />
                                </div>
                                <span className="text-[9px] uppercase tracking-wider text-green-400 font-bold opacity-90">Preview</span>
                            </div>
                            <div className="opacity-80">
                                {isDeezer ? <DeezerIcon size={12} color="white" /> : <SiSpotify size={12} color="#1DB954" />}
                            </div>
                        </div>
                    </div>

                    {/* Play Button - Large & Clear */}
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLinkClick(link.id);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group-hover:bg-green-500 group-hover:text-white"
                    >
                        <Play size={18} fill="currentColor" className="ml-1" />
                    </a>
                </div>

                {/* Subtle border overlay */}
                <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-[inherit]" />

                <style>{`
                    @keyframes music-bar {
                        0%, 100% { height: 25%; opacity: 0.5; }
                        50% { height: 100%; opacity: 1; }
                    }
                `}</style>
            </div>
        );
    };

    // Unified Styling Logic: Preserving Theme "Soul" while allowing Edits
    const isCustomTheme = currentTheme.id === 'custom';

    // Button Roundness Logic - Works across ALL themes as a direct override
    // Force Nature theme to use its specific shape even if 'rounder' is selected/defaulted
    const effectiveRoundness = (currentTheme.id === 'modern-nature' && (profile.buttonRoundness === 'rounder' || !profile.buttonRoundness))
        ? null
        : profile.buttonRoundness;

    const roundedClass = effectiveRoundness === 'square' ? 'rounded-none' :
        effectiveRoundness === 'round' ? 'rounded-lg' :
            effectiveRoundness === 'rounder' ? 'rounded-2xl' :
                effectiveRoundness === 'full' ? 'rounded-full' :
                    (currentTheme.buttonClass.match(/rounded-[^\s]+(?=\s|$)/g)?.join(' ') || null);

    const borderRadiusValue = profile.buttonRoundness === 'square' ? 0 :
        profile.buttonRoundness === 'round' ? 8 :
            profile.buttonRoundness === 'rounder' ? 16 :
                profile.buttonRoundness === 'full' ? 40 :
                    undefined; // Let theme CSS handle it

    // Surgical cleaning helper to allow global edits on any theme
    const cleanClass = (cls: string, types: ('rounded' | 'bg' | 'text' | 'border' | 'shadow')[]) => {
        let cleaned = cls;
        // Updated regex to catch ALL rounded classes including specific corners (rounded-tl-*, etc.)
        if (types.includes('rounded')) cleaned = cleaned.replace(/\brounded-[^\s]+(?=\s|$)/g, '');
        if (types.includes('bg')) cleaned = cleaned.replace(/\bbg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(none|50|100|200|300|400|500|600|700|800|900|950)\b|\bbg-(white|black|transparent|current)\b|\bbg-\[.*?\]\b/g, '');
        if (types.includes('text')) cleaned = cleaned.replace(/\btext-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(none|50|100|200|300|400|500|600|700|800|900|950)\b|\btext-(white|black|transparent|current)\b|\btext-\[.*?\]\b/g, '');
        if (types.includes('border')) cleaned = cleaned.replace(/\bborder-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(none|50|100|200|300|400|500|600|700|800|900|950)\b|\bborder-(white|black|transparent|current)\b|\bborder-\[.*?\]\b/g, '');
        return cleaned.trim();
    };

    // Unified Styling Logic: Preserving Theme "Soul" while allowing Edits
    const overrideTypes: ('rounded' | 'bg' | 'text' | 'border' | 'shadow')[] = [];
    if (roundedClass) overrideTypes.push('rounded');
    if (isCustomTheme && profile.customButtonColor) overrideTypes.push('bg');
    if (isCustomTheme && profile.customButtonTextColor) overrideTypes.push('text');

    // 1. Button Class - Start with theme base and apply surgical overrides
    let buttonClass = cleanClass(currentTheme.buttonClass, overrideTypes);
    if (roundedClass) buttonClass += ` ${roundedClass}`;

    // 2. Button Color Logic - Custom colors ONLY apply to 'custom' theme
    const buttonHex = (isCustomTheme && profile.customButtonColor) ? profile.customButtonColor : currentTheme.buttonHex;
    const mainButtonStyle = (isCustomTheme && profile.customButtonColor) ? { backgroundColor: profile.customButtonColor } : {};

    // 2.5 Font Logic - Always prioritize profile settings if available
    const effectiveFontFamily = profile.fontFamily || currentTheme.fontFamily || "'Inter', sans-serif";
    const containerStyle = { fontFamily: effectiveFontFamily };

    // 3. Card/Container Logic - STRICT UNIFICATION
    // User Requirement: "Tudo vai ser tratado como botao" & "Mesma cor"
    // We ignore currentTheme.cardClass specifically for colors/bg/shadows to ensure they match the button exactly.
    // We strictly derive the card's visual style from the button's class.

    let baseCardClass = buttonClass; // Start with the button

    // Remove classes not suitable for a container/card layout (like flex-row specific alignment)
    baseCardClass = baseCardClass
        .replace(/\b(flex|items-center|justify-between|justify-center|flex-row|flex-col)\b/g, '') // Remove layout
        .replace(/\bp[xy]?-(none|\d+|\[.*?\])\b/g, '') // Remove padding (cards handle their own)
        .replace(/\bh-\[.*?\]\b/g, '') // Remove height constraints usually found on buttons
        .replace(/\bmin-h-\[.*?\]\b/g, '')
        .trim();

    // Reapply roundedness if global override exists
    if (roundedClass) {
        baseCardClass = cleanClass(baseCardClass, ['rounded']) + ` ${roundedClass}`;
    }

    // Note: We do NOT use currentTheme.cardClass anymore because it often introduces deviant colors (white/black) 
    // that break the "Everything is a Button" rule.

    // Lower threshold for more aggressive light button detection (white is 1, so 0.6 is quite early)
    const isButtonLight = buttonHex ? getLuminance(buttonHex) > 0.6 : false;

    // Universal Helper for Button/Card Text Contrast
    const getSmartTextColor = () => {
        // 0. Priority: User custom button text color
        if (profile.customButtonTextColor) return profile.customButtonTextColor;

        // 2. If currently in a DARK card/theme context and button is NOT light, use white
        if (!isButtonLight && (isDarkTheme)) return '#ffffff';

        // 3. If the button specifically is light, we MUST use dark text for visibility
        if (isButtonLight) return '#0f172a'; // slate-900 equivalent

        // 4. Fallback to white if background is dark/glass
        if (profile.customBackground || isDarkTheme) return '#ffffff';

        // 5. Default to undefined to let Tailwind/Inheritance handle it
        return undefined;
    };

    const effectiveTextColor = profile.customTextColor || currentTheme.textHex || (isDarkTheme ? '#ffffff' : '#0f172a');
    const mainTextColorStyle = effectiveTextColor ? { color: effectiveTextColor } : {};

    const textClass = currentTheme.textClass;


    return (
        <div
            className="relative w-full h-full flex flex-col overflow-hidden isolate"
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
                className={`w-full h-full overflow-y-auto scrollbar-hide flex flex-col relative z-20 ${currentTheme.id === 'glass' ? 'text-white' : currentTheme.textClass}`}
                style={{
                    ...containerStyle,
                    fontSize: `${(profile.fontSize || undefined) || 16}px`,
                    fontWeight: ((profile.fontWeight || undefined) || undefined),
                    fontStyle: (profile.fontItalic) ? 'italic' : 'normal'
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
                            className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <Share size={18} />
                        </button>
                    </div>
                    {/* Menu / Options Button */}
                    <div className="absolute top-[34px] left-6 z-20">
                        <div className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 rounded-full shadow-lg hover:scale-105 transition-all">
                            <img src="/icons/logo_icone.png" alt="Nodus" className="w-6 h-6 object-contain opacity-90 rounded-full" />
                        </div>
                    </div>



                    {/* Custom CSS Injection */}
                    {profile.customCSS && (
                        <style dangerouslySetInnerHTML={{ __html: profile.customCSS }} />
                    )}

                    {/* Content Scrollable Area */}
                    <div className={`px-6 pb-32 ${isPreview ? 'pt-12' : 'pt-16'} flex-1 flex flex-col min-h-full`}>

                        {/* Profile Section */}
                        <motion.div className={`w-full mb-1 ${profile.headerLayout === 'compact'
                            ? 'flex flex-row items-center gap-4 text-left'
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
                                            className="w-full h-full object-cover rounded-full"
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
                                            className={`mb-0 tracking-tight flex items-center gap-2 text-wrap break-words ${profile.headerLayout === 'hero' ? 'text-[1.6em]' : 'text-[1.3em]'}`}
                                            style={{ ...mainTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
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

                                {tiktokFollowers !== undefined && (
                                    <div
                                        className="flex items-center gap-1.5 mb-2 px-3 py-1 bg-black/10 backdrop-blur-md rounded-full text-[0.75rem] font-bold"
                                        style={{ color: getSmartTextColor() }}
                                    >
                                        <Music size={12} fill="currentColor" />
                                        <span>{tiktokFollowers.toLocaleString()} Seguidores</span>
                                    </div>
                                )}

                                {profile.bio && (
                                    <p className={`text-[1em] opacity-90 leading-relaxed whitespace-pre-line ${profile.headerLayout === 'compact' ? 'text-left' : 'text-center max-w-[300px]'}`}
                                        style={{ ...mainTextColorStyle, fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                    >
                                        {profile.bio}
                                    </p>
                                )}

                            </div>
                        </motion.div>

                        {/* Social Icons Row */}
                        {socialLinks.length > 0 && (
                            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap relative">
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
                                            className={`transition-all duration-300 ${roundedClass || 'rounded-full'} p-2`}
                                            style={{
                                                ...mainTextColorStyle
                                            }}
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
                                        className={`flex-1 py-1.5 rounded-full text-sm transition-all duration-300 ${activeTab === 'links'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'opacity-70 hover:opacity-100'
                                            }`}
                                        style={{
                                            ...(activeTab === 'links' ? {} : mainTextColorStyle),
                                            fontWeight: (profile.fontWeight || undefined),
                                            fontStyle: profile.fontItalic ? 'italic' : 'normal'
                                        }}
                                    >
                                        Links
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('shop')}
                                        className={`flex-1 py-1.5 rounded-full text-sm transition-all duration-300 ${activeTab === 'shop'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'opacity-70 hover:opacity-100'
                                            }`}
                                        style={{
                                            ...(activeTab === 'shop' ? {} : mainTextColorStyle),
                                            fontWeight: (profile.fontWeight || undefined),
                                            fontStyle: profile.fontItalic ? 'italic' : 'normal'
                                        }}
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
                                        <div className="space-y-6">
                                            <div
                                                className={`flex items-center gap-2.5 mb-2 text-xs font-bold uppercase tracking-widest opacity-60 px-1`}
                                                style={{ ...mainTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                            >
                                                <ShoppingBag size={14} className="stroke-[2.5]" />
                                                <span>Categorias</span>
                                            </div>

                                            {Object.entries(collections).map(([name, items]) => (
                                                <button
                                                    key={name}
                                                    onClick={() => handleCollectionClick(name)}
                                                    className={`w-full group relative transition-all duration-300 ${cleanClass(baseCardClass, ['bg', 'text']).replace('overflow-hidden', '')}`}
                                                    style={{
                                                        ...mainButtonStyle,
                                                        backgroundColor: buttonHex,
                                                        color: getSmartTextColor()
                                                    }}
                                                >
                                                    <div className={`flex flex-col w-full h-full overflow-hidden ${roundedClass}`}>
                                                        {/* Preview Images Collage - Refined */}
                                                        <div className="flex h-48 w-full gap-1 p-1 bg-black/5">
                                                            {items.length === 1 ? (
                                                                <div className="flex-1 h-full relative overflow-hidden rounded-xl">
                                                                    <img src={items[0].image} alt={items[0].name} className="w-full h-full block object-cover transition-transform group-hover:scale-110 duration-700" />
                                                                    <div className="absolute inset-0 bg-black/5" />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {items.slice(0, 3).map((item, i) => (
                                                                        <div key={item.id} className={`flex-1 h-full relative overflow-hidden ${i === 0 ? 'rounded-l-xl' : i === items.slice(0, 3).length - 1 ? 'rounded-r-xl' : ''}`}>
                                                                            <img src={item.image} alt={item.name} className="w-full h-full block object-cover transition-transform group-hover:scale-110 duration-700" />
                                                                            <div className="absolute inset-0 bg-black/5" />
                                                                        </div>
                                                                    ))}
                                                                    {/* Placeholder if less than 3 items */}
                                                                    {items.length < 3 && Array.from({ length: 3 - items.length }).map((_, i) => (
                                                                        <div key={`empty-${i}`} className="flex-1 h-full bg-slate-100/50 flex items-center justify-center text-slate-300">
                                                                            <ShoppingBag size={24} strokeWidth={1.5} />
                                                                        </div>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="p-4 flex items-center justify-between bg-black/5">
                                                            <div className="text-left">
                                                                <h3 className="text-sm font-bold" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{name}</h3>
                                                                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-60" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                                                                    {items.length} {items.length === 1 ? 'Produto' : 'Produtos'}
                                                                </p>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-colors">
                                                                <ChevronRight size={16} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Filtered Product Grid - Refined Storefront */
                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-8 px-1">
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={() => setActiveCollection(null)}
                                                        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-all mb-1.5`}
                                                        style={{ ...mainTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                    >
                                                        <ChevronLeft size={12} strokeWidth={3} />
                                                        <span>Voltar</span>
                                                    </button>
                                                    <h2 className={`text-xl font-black tracking-tight`} style={{ ...mainTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                                                        {activeCollection}
                                                    </h2>
                                                </div>
                                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                                    <ShoppingBag size={20} className="opacity-40" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pb-12">
                                                {activeCollection && collections[activeCollection]?.map(product => {
                                                    const productContent = (
                                                        <div className="flex flex-col w-full h-full relative">
                                                            <div className={`relative w-full aspect-[4/5] transform transition-transform group-hover:scale-[1.02] duration-300`}>
                                                                <div className={`absolute inset-0 overflow-hidden ${roundedClass} border-none shadow-none`} style={{ backgroundColor: buttonHex, ...mainButtonStyle }}>
                                                                    <img src={product.image} alt={product.name} className="w-full h-full block object-cover" />
                                                                    <div className="absolute inset-0 bg-black/5" />

                                                                    {/* Badge container with high z-index and clip safety */}
                                                                    <div className="absolute top-2 left-2 z-10">
                                                                        {product.discountCode && (
                                                                            <div className="bg-slate-950/90 text-white text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg">
                                                                                -{product.discountCode}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Hover Action Overlay - Also needs to be clipped by the same shape */}
                                                                <div className={`absolute inset-0 ${roundedClass} bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none`}>
                                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-950 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                                                                        <Plus size={20} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Product Info */}
                                                            <div className="flex flex-col gap-0.5 mt-2 px-1 text-left">
                                                                <span className={`text-[13px] font-bold truncate`} style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                                                                    {product.name}
                                                                </span>
                                                                {product.price && (
                                                                    <span className={`text-[11px] font-medium opacity-70 mt-2`} style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                                                                        {product.price}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );

                                                    return (
                                                        <a
                                                            key={product.id}
                                                            href={product.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={() => handleLinkClick(product.id)}
                                                            className={`flex flex-col group relative transition-all duration-300`}
                                                        >
                                                            {productContent}
                                                        </a>
                                                    );
                                                })}
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

                                        // We no longer inject here at the top.
                                        // It will be rendered at its position in the loop below.

                                        const themeButtonHex = currentTheme.buttonHex || ((isDarkTheme || currentTheme.id === 'glass') ? '#ffffff' : '#0f172a');
                                        const cardAccentColor = themeButtonHex;
                                        const cardTextColor = (isDarkTheme || currentTheme.id === 'glass' ? '#ffffff' : '#0f172a');

                                        let currentIconGroup: LinkItem[] = [];
                                        let currentCardGroup: LinkItem[] = [];

                                        const flushIcons = () => {
                                            if (currentIconGroup.length > 0) {
                                                const group = [...currentIconGroup];
                                                renderedItems.push(
                                                    <div key={`social-row-${group[0].id}`} className="flex items-center justify-center gap-2 w-full mb-6 flex-wrap relative">
                                                        {group.map(iconLink => {
                                                            const network = SOCIAL_NETWORKS.find(n => iconLink.title.toLowerCase().includes(n.id)) ||
                                                                SOCIAL_NETWORKS.find(n => iconLink.url.toLowerCase().includes(n.id)) ||
                                                                SOCIAL_NETWORKS[0];

                                                            const Icon = network.icon || Globe;

                                                            return (
                                                                <motion.a
                                                                    key={iconLink.id}
                                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ duration: 0 }}
                                                                    href={iconLink.url}
                                                                    onClick={() => handleLinkClick(iconLink.id)}
                                                                    // AQUI: Aplicamos buttonClass (limpa) para que o ícone social tenha o mesmo "feel" do botão (hover, shadow)
                                                                    // Removemos classes de layout/padding do botão para que não quebre o ícone
                                                                    className={`relative group flex items-center justify-center w-12 h-12 transition-all duration-300 ${buttonClass.replace(/\b(block|w-full|min-h-\[.*?\]|px-\d+(\.\d+)?|py-\d+(\.\d+)?|justify-between|text-center)\b/g, '').trim()}`}
                                                                    style={{ ...mainButtonStyle, borderRadius: borderRadiusValue }} // Força o estilo do botão (cor e redondura)
                                                                >
                                                                    <div className={`absolute inset-0 -m-2 opacity-10 rounded-full ${currentTheme.id.includes('dark') ? 'bg-white' : 'bg-black'}`}></div>

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
                                                    <div key={`card-grid-${group[0].id}`} className="flex flex-col gap-4 mb-8">
                                                        {group.map((cardLink) => {
                                                            const cardBg = cardAccentColor;
                                                            const cardContent = (
                                                                <div className="relative z-10 flex flex-col h-full w-full">
                                                                    <div
                                                                        className="relative overflow-hidden h-44 md:h-52"
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
                                                                    <div className={`p-3.5 flex flex-col justify-center items-center text-center h-16 relative`}>
                                                                        {/* Platform Icon Footer for Music in standard Cards */}
                                                                        {isMusicLink(cardLink) && (
                                                                            <div className="absolute top-1.5 right-1.5 opacity-60">
                                                                                {cardLink.url.includes('deezer') ? (
                                                                                    <DeezerIcon size={10} color={getSmartTextColor()} />
                                                                                ) : (
                                                                                    <SiSpotify size={10} color={isButtonLight ? "#1a2c14" : "#1DB954"} />
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        <span className="text-[0.95em] leading-tight truncate px-1" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{cardLink.title}</span>
                                                                        {cardLink.subtitle && <span className="text-[0.75em] leading-tight truncate px-1 opacity-60 mt-1.5" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{cardLink.subtitle}</span>}
                                                                    </div>
                                                                </div>
                                                            );

                                                            return (
                                                                <motion.a
                                                                    key={cardLink.id}
                                                                    initial={{ scale: 0.95, opacity: 0 }}
                                                                    whileInView={{ scale: 1, opacity: 1 }}
                                                                    viewport={{ once: true }}
                                                                    href={cardLink.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={() => handleLinkClick(cardLink.id)}
                                                                    className={`group relative overflow-hidden transition-all duration-300 w-full ${baseCardClass}`}
                                                                    style={{ ...mainButtonStyle, backgroundColor: buttonHex }}
                                                                >
                                                                    {cardContent}
                                                                </motion.a>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                                currentCardGroup = [];
                                            }
                                        };

                                        buttonLinks.forEach(link => {
                                            if (link.type === 'collection' && (link.platform === 'instagram' || link.title === 'Posts do Instagram')) {
                                                // 1. Instagram Collection special rendering (Priority)
                                                flushIcons();
                                                flushCards();

                                                if (instagramIntegration) {
                                                    // Map children links to the format expected by InstagramCard
                                                    const collectionMedia = (link.children || []).map(c => ({
                                                        id: c.id,
                                                        media_url: c.image,
                                                        thumbnail_url: c.image,
                                                        permalink: c.url,
                                                        caption: c.title,
                                                        media_type: c.videoUrl ? 'VIDEO' : 'IMAGE'
                                                    }));

                                                    renderedItems.push(
                                                        <motion.div
                                                            key={`instagram-card-${link.id}`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            viewport={{ once: true }}
                                                            className={`w-full mb-4 ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'}`}
                                                        >
                                                            <div
                                                                className={`text-center mb-2 opacity-90 text-sm font-bold uppercase tracking-widest`}
                                                                style={{ ...mainTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                            >
                                                                {link.title}
                                                            </div>
                                                            <InstagramCard
                                                                username={instagramUsername || 'instagram_user'}
                                                                followers={instagramFollowers || 0}
                                                                avatarUrl={instagramAvatar || ''}
                                                                media={collectionMedia.length > 0 ? collectionMedia : instagramMedia}
                                                                themeButtonClass={baseCardClass}
                                                                themeButtonStyle={mainButtonStyle}
                                                                themeTextHex={getSmartTextColor()}
                                                                buttonRoundness={roundedClass || undefined}
                                                                isDark={isDarkTheme}
                                                                variant={link.layout === 'classic' ? 'profile' : 'feed'}
                                                                fontFamily={profile.fontFamily}
                                                                fontWeight={profile.fontWeight || undefined}
                                                                fontItalic={profile.fontItalic}
                                                            />
                                                        </motion.div>
                                                    );
                                                }
                                            } else if (link.type === 'header') {
                                                flushIcons();
                                                flushCards();

                                                renderedItems.push(
                                                    <motion.div
                                                        key={`header-${link.id}`}
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        whileInView={{ opacity: 1, scale: 1 }}
                                                        viewport={{ once: true }}
                                                        className={`w-full text-center py-6 mb-2 mt-4 opacity-80`}
                                                        style={{
                                                            ...mainTextColorStyle,
                                                            fontWeight: 'bold',
                                                            fontSize: '1.1em',
                                                            letterSpacing: '0.05em',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {link.title}
                                                    </motion.div>
                                                );
                                            } else if (link.layout === 'icon') {
                                                flushCards();
                                                currentIconGroup.push(link);
                                            } else if (link.layout === 'card') {
                                                flushIcons();
                                                currentCardGroup.push(link);
                                            } else {
                                                flushIcons();
                                                flushCards();

                                                const activeChildren = link.children?.filter(c => c.isActive) || [];

                                                if (activeChildren.length > 0) {
                                                    const collectionLayout = (link.layout === 'carousel') ? 'carousel' : (link.layout === 'grid' ? 'grid' : 'stacked');

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
                                                            <motion.div key={link.id} transition={{ duration: 0 }} className={`w-full pt-1 pb-1 group/carousel ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'}`}>
                                                                <div
                                                                    className={`text-center mb-2 font-bold opacity-90 text-sm uppercase tracking-widest`}
                                                                    style={{ ...mainTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                                >
                                                                    {link.title}
                                                                </div>
                                                                <div className="relative w-full">
                                                                    <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-30 p-2 bg-white/90 text-slate-900 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-white"><ChevronLeft size={20} /></button>
                                                                    <div id={scrollContainerId} className="flex overflow-x-auto gap-3 px-1 pb-4 -mx-1 scrollbar-hide snap-x relative scroll-smooth">
                                                                        {activeChildren.map(child => {
                                                                            const childContent = (
                                                                                <div className="relative z-10 flex flex-col h-full w-full">
                                                                                    <div className="relative overflow-hidden h-36 w-full bg-white">
                                                                                        {child.image ? (
                                                                                            <img src={child.image} alt="" className="w-full h-full block object-contain" />
                                                                                        ) : (
                                                                                            <div className="w-full h-full flex items-center justify-center bg-slate-200/20 text-slate-400">
                                                                                                <ShoppingBag size={20} />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className={`p-2 flex flex-col justify-center items-center text-center h-12 relative`}>
                                                                                        {/* Platform Icon Footer for Music in Carousel */}
                                                                                        {isMusicLink(child) && (
                                                                                            <div className="absolute top-1 right-1.5 opacity-60">
                                                                                                {child.url.includes('deezer') ? (
                                                                                                    <DeezerIcon size={10} color={getSmartTextColor()} />
                                                                                                ) : (
                                                                                                    <SiSpotify size={10} color={isButtonLight ? "#1a2c14" : "#1DB954"} />
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                        <span className="text-[0.7em] leading-tight truncate w-full" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{child.title}</span>
                                                                                        {child.subtitle && <span className="text-[0.62em] leading-tight truncate opacity-60 w-full mt-1.5" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{child.subtitle}</span>}
                                                                                    </div>
                                                                                </div>
                                                                            );

                                                                            return (
                                                                                <motion.a
                                                                                    key={child.id}
                                                                                    transition={{ duration: 0 }}
                                                                                    href={child.url}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    onClick={() => handleLinkClick(child.id)}
                                                                                    className={`relative group flex-shrink-0 w-44 snap-start flex flex-col overflow-hidden transition-all duration-300 ${baseCardClass || buttonClass}`}
                                                                                    style={mainButtonStyle}
                                                                                >
                                                                                    {childContent}
                                                                                </motion.a>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-30 p-2 bg-white/90 text-slate-900 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-white"><ChevronRight size={20} /></button>
                                                                </div >
                                                            </motion.div >
                                                        );
                                                    } else {
                                                        renderedItems.push(
                                                            <motion.div key={link.id} transition={{ duration: 0 }} className={`w-full pt-1 pb-1 ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'}`}>
                                                                <div
                                                                    className={`text-center mb-2 opacity-90 text-sm font-bold uppercase tracking-widest`}
                                                                    style={{ ...mainTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                                >
                                                                    {link.title}
                                                                </div>
                                                                <div className={collectionLayout === 'grid' ? "grid grid-cols-2 gap-3 relative" : "flex flex-col gap-4 relative"}>
                                                                    {activeChildren.map(child => {
                                                                        if (isMusicLink(child)) return <motion.div key={child.id} transition={{ duration: 0 }} className="w-full"><MusicRichCard link={child} handleLinkClick={handleLinkClick} /></motion.div>;
                                                                        if (child.embedType === 'youtube') return <motion.div key={child.id} transition={{ duration: 0 }} className="mb-4"><YouTubeEmbed url={child.url} title={child.title} className={roundedClass || 'rounded-2xl'} /></motion.div>;
                                                                        if (child.embedType === 'tiktok') return <motion.div key={child.id} transition={{ duration: 0 }} className="mb-4 w-full"><TikTokEmbed url={child.url} title={child.title} videoUrl={child.videoUrl} className={roundedClass || 'rounded-2xl'} /></motion.div>;

                                                                        return (
                                                                            <motion.a
                                                                                key={child.id}
                                                                                transition={{ duration: 0 }}
                                                                                href={child.url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                onClick={() => handleLinkClick(child.id)}
                                                                                className={`block w-full text-center text-base transform group relative py-4 px-6 flex items-center justify-between ${buttonClass} ${getHighlightClass(child.highlight)} overflow-hidden`}
                                                                                style={{ ...mainButtonStyle, fontFamily: profile.fontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                                            >
                                                                                <div className="relative z-10 w-full flex items-center justify-between">
                                                                                    {child.image ? <img src={child.image} alt="" className="w-12 h-12 rounded-full block object-cover border-2 border-white/20 shrink-0" /> : <span className="w-8"></span>}
                                                                                    <div className="flex-1 px-1 flex flex-col justify-center text-center">
                                                                                        <span className="text-[0.9em] leading-tight break-words" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{child.title}</span>
                                                                                        {child.subtitle && <span className="text-[0.75em] opacity-80 leading-tight flex items-center justify-center gap-1 mt-2 break-words" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{child.subtitle}</span>}
                                                                                    </div>
                                                                                    <span className="w-8 shrink-0"></span>
                                                                                </div>
                                                                            </motion.a>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    }
                                                } else if (isMusicLink(link)) {
                                                    renderedItems.push(<motion.div key={link.id} transition={{ duration: 0 }} className="w-full mb-5"><MusicRichCard link={link} handleLinkClick={handleLinkClick} /></motion.div>);
                                                } else if (link.embedType === 'youtube') {
                                                    renderedItems.push(<motion.div key={link.id} transition={{ duration: 0 }} className="mb-4"><YouTubeEmbed url={link.url} title={link.title} className={roundedClass || 'rounded-2xl'} /></motion.div>);
                                                } else if (link.embedType === 'tiktok') {
                                                    renderedItems.push(<motion.div key={link.id} transition={{ duration: 0 }} className="mb-4 w-full"><TikTokEmbed url={link.url} title={link.title} videoUrl={link.videoUrl} className={roundedClass || 'rounded-2xl'} /></motion.div>);
                                                } else {
                                                    renderedItems.push(
                                                        <motion.a
                                                            key={link.id}
                                                            transition={{ duration: 0 }}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={() => handleLinkClick(link.id)}
                                                            className={`block w-full min-h-[64px] text-center text-base transform group relative py-2.5 px-6 flex items-center justify-between ${buttonClass} ${getHighlightClass(link.highlight)} overflow-hidden`}
                                                            style={{ ...mainButtonStyle, fontFamily: profile.fontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                        >
                                                            <div className="relative z-10 w-full flex items-center justify-between px-2">
                                                                {link.image ? <img src={link.image} alt="" className="w-10 h-10 rounded-full block object-cover border-2 border-white/20 shrink-0" /> : <span className="w-8"></span>}
                                                                <div className="flex-1 px-1 flex flex-col justify-center text-center">
                                                                    <span className="text-[0.9em] leading-tight line-clamp-2 break-words" style={{ fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{link.title}</span>
                                                                    {link.subtitle && <span className="text-[0.75em] opacity-80 leading-tight flex items-center justify-center gap-1 mt-2 break-words" style={{ fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{link.subtitle}</span>}
                                                                </div>
                                                                <span className="w-8 shrink-0"></span>
                                                            </div>
                                                        </motion.a>
                                                    );
                                                }
                                            }
                                        });

                                        flushIcons();
                                        flushCards();
                                        return renderedItems;
                                    })()}



                                    {/* Payment Methods (Monetization) - Always Last */}
                                    {profile.paymentMethods && profile.paymentMethods.length > 0 && (
                                        <div className="flex flex-col gap-3 w-full mb-2">
                                            {profile.paymentMethods.filter(pm => pm.isActive !== false).map(method => (
                                                <motion.button
                                                    key={method.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        if (method.type === 'paypal') {
                                                            window.open(method.key.startsWith('http') ? method.key : `https://${method.key}`, '_blank');
                                                        } else {
                                                            navigator.clipboard.writeText(method.key);
                                                            alert('Chave Pix copiada!');
                                                        }
                                                    }}
                                                    className={`relative w-full overflow-hidden transition-all duration-300 group ${buttonClass} min-h-[56px] flex items-center justify-center`}
                                                    style={{
                                                        ...mainButtonStyle,
                                                        backgroundColor: buttonHex,
                                                        color: getSmartTextColor(),
                                                        borderRadius: borderRadiusValue
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                                        {method.type === 'pix' ? <Zap size={20} fill="currentColor" /> : <CreditCard size={20} />}
                                                        <span className="font-semibold text-sm">
                                                            {method.label || (method.type === 'pix' ? 'Fazer um Pix' : 'Pagar com PayPal')}
                                                        </span>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}

                                    {activeLinks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-50 space-y-2">
                                            <span className="text-sm">Nenhum link ativo</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
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
                                    className={`block w-full min-h-[64px] text-center text-base transition-all duration-300 transform group relative py-2.5 px-6 flex items-center justify-between ${buttonClass} overflow-hidden`}
                                    style={{ fontFamily: profile.fontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                >
                                    <div className="relative z-10 w-full flex items-center justify-between">
                                        {profile.supportType === 'pix' ? (
                                            <img src="https://img.icons8.com/?size=100&id=CuUOYOfd3Dy9&format=png&color=000000" alt="Pix" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-0.5" />
                                        ) : (
                                            <img src="https://img.icons8.com/?size=100&id=34525&format=png&color=000000" alt="PayPal" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-1" />
                                        )}
                                        <span className="truncate flex-1 px-3" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>Apoiar</span>
                                        <span className="w-8 opacity-50 flex justify-end" style={{ color: getSmartTextColor() }}><Coffee size={20} /></span>
                                    </div>
                                </motion.a>
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
                                        className={`group flex items-center justify-center gap-2 px-5 py-2 rounded-full transition-all duration-300 shadow-sm ${btnClass}`}
                                    >
                                        <span
                                            className="text-[11px] font-medium tracking-tight font-sans whitespace-nowrap"
                                        >
                                            Junte-se a {profile.name} no Nodus
                                        </span>
                                    </a>
                                );
                            })()}

                            {/* Legal Links (Minimalist) */}
                            <div
                                className={`flex items-center gap-2 text-[10px] transition-opacity duration-300 ${isDarkTheme ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-600'}`}
                                style={{ fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                            >
                                <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-60 hover:opacity-100">Termos</a>
                                <span className="opacity-40">•</span>
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-60 hover:opacity-100">Privacidade</a>
                            </div>
                        </motion.div>
                    </div>
                </div >
            </div >
            {/* Foreground Layer (For themes like Sakura) */}
            {currentTheme.id === 'kawaii-sakura' && <KawaiiSakuraForeground />}
        </div >
    );
};

export default ProfileRenderer;
