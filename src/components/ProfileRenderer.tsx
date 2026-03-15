import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
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
    ChevronUp,
    Music,
    Pause,
    SkipBack,
    SkipForward,
    Music2,
    Zap,
    CreditCard,
    Youtube,
    Presentation,
    BarChart3,
    Lock
} from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';
import TikTokEmbed from './TikTokEmbed';
import verifiedBadge from '../assets/verified-badge.png';

import BackgroundLayer from './BackgroundLayer';
import { apiClient } from '../services/apiClient';
import { SiSpotify, SiPaypal } from 'react-icons/si';
import { InstagramCard } from './InstagramCard';
import { TwitchCard } from './TwitchCard';
import { KickCard } from './KickCard';
import { YouTubeCard } from './YouTubeCard';
// @ts-ignore
import { Background as KawaiiSakuraForeground } from '../themes/kawaii-sakura';
import BrutalistVisualizer from './themes/BrutalistVisualizer';
import { AgendaCard } from './AgendaCard';
import { MapBlock } from './MapBlock';
import PasswordLinkModal from './PasswordLinkModal';
import MediaKitModal from './MediaKitModal';
import InteractiveButton from './animations/InteractiveButton';
import ElasticButton from './animations/ElasticButton';
import GlitchButton from './animations/GlitchButton';



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
    const { t } = useTranslation();
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const [lockedLink, setLockedLink] = React.useState<LinkItem | null>(null);
    const [openMediaKit, setOpenMediaKit] = React.useState<LinkItem | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // CSS keyframes memoized — inserted ONCE, never recreated on re-render
    const profileGlobalStyles = React.useMemo(() => (
        <style>{`
            @keyframes wobble {
                0%, 100% { transform: translateX(0%); }
                15% { transform: translateX(-5%) rotate(-5deg); }
                30% { transform: translateX(4%) rotate(3deg); }
                45% { transform: translateX(-3%) rotate(-3deg); }
                60% { transform: translateX(2%) rotate(2deg); }
                75% { transform: translateX(-1%) rotate(-1deg); }
            }
            .animate-wobble { animation: wobble 1s infinite !important; transition: none !important; }
            
            .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both infinite !important; transform: translate3d(0, 0, 0); transition: none !important; }
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            .animate-glow { animation: glow-pulse 2s infinite !important; }
            @keyframes glow-pulse {
                0% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
                50% { box-shadow: 0 0 20px rgba(255,255,255,0.6); }
                100% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
            }
            @keyframes tada {
                0% { transform: scale3d(1, 1, 1); }
                10%, 20% { transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg); }
                30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); }
                40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); }
                100% { transform: scale3d(1, 1, 1); }
            }
            .animate-tada { animation: tada 1s infinite !important; transition: none !important; }
            @keyframes jello {
                11.1% { transform: none; }
                22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); }
                33.3% { transform: skewX(6.25deg) skewY(6.25deg); }
                44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); }
                55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); }
                66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); }
                77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); }
                88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); }
                100% { transform: none; }
            }
            .animate-jello { animation: jello 1.5s infinite !important; transform-origin: center !important; transition: none !important; }
            @keyframes rubberBand {
                0% { transform: scale3d(1, 1, 1); }
                30% { transform: scale3d(1.25, 0.75, 1); }
                40% { transform: scale3d(0.75, 1.25, 1); }
                50% { transform: scale3d(1.15, 0.85, 1); }
                65% { transform: scale3d(0.95, 1.05, 1); }
                75% { transform: scale3d(1.05, 0.95, 1); }
                100% { transform: scale3d(1, 1, 1); }
            }
            .animate-rubber { animation: rubberBand 1s infinite !important; transition: none !important; }
            
            /* Override for standard Tailwind animations to ensure they work with Framer Motion/Themes */
            @keyframes pulse-custom {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .animate-pulse { animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite !important; }
            
            @keyframes bounce-custom {
                0%, 100% { transform: translateY(-8%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
            }
            .animate-bounce { animation: bounce-custom 1s infinite !important; transition: none !important; }

            @keyframes heartbeat {
                0% { transform: scale(1); }
                14% { transform: scale(1.1); }
                28% { transform: scale(1); }
                42% { transform: scale(1.1); }
                70% { transform: scale(1); }
            }
            .animate-heartbeat { animation: heartbeat 1.3s infinite !important; transition: none !important; }

            @keyframes flash {
                0%, 50%, 100% { opacity: 1; }
                25%, 75% { opacity: 0; }
            }
            .animate-flash { animation: flash 2s infinite !important; transition: none !important; }

            @keyframes swing {
                20% { transform: rotate3d(0, 0, 1, 15deg); }
                40% { transform: rotate3d(0, 0, 1, -10deg); }
                60% { transform: rotate3d(0, 0, 1, 5deg); }
                80% { transform: rotate3d(0, 0, 1, -5deg); }
                100% { transform: rotate3d(0, 0, 1, 0deg); }
            }
            .animate-swing { transform-origin: top center !important; animation: swing 2s infinite !important; transition: none !important; }

            @keyframes pulsar {
                0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
            }
            .animate-pulsar { animation: pulsar 1.5s infinite !important; transition: none !important; }

            @keyframes spin-3d {
                0% { transform: perspective(1000px) rotateX(0deg) scale(1); }
                10% { transform: perspective(1000px) rotateX(-20deg) scale(0.95); }
                45% { transform: perspective(1000px) rotateX(190deg) translateZ(100px) scale(1.15); }
                60% { transform: perspective(1000px) rotateX(360deg) translateZ(0) scale(1); }
                100% { transform: perspective(1000px) rotateX(360deg) scale(1); }
            }
            .animate-spin-slow { 
                animation: spin-3d 3s cubic-bezier(0.34, 1.56, 0.64, 1) infinite !important; 
                transition: none !important; 
                transform-style: preserve-3d !important;
                position: relative !important;
                z-index: 50 !important;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            .animate-float { animation: float 3s ease-in-out infinite !important; transition: none !important; }

            @keyframes neon-glow {
                0%, 100% { filter: drop-shadow(0 0 2px #ff00ff) drop-shadow(0 0 5px #00ffff); }
                50% { filter: drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 15px #ff00ff); }
            }
            .animate-neon { animation: neon-glow 2s ease-in-out infinite !important; }

            @keyframes spotlight {
                0% { left: -100%; }
                100% { left: 200%; }
            }
            .animate-spotlight {
                position: relative;
                overflow: hidden !important;
            }
            .animate-spotlight::after {
                content: "";
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent
                );
                transform: skewX(-20deg);
                animation: spotlight 2.5s infinite linear !important;
            }

            @keyframes rainbow {
                0% { border-color: #ff0000; box-shadow: 0 0 5px #ff0000; }
                17% { border-color: #ff8800; box-shadow: 0 0 5px #ff8800; }
                33% { border-color: #ffff00; box-shadow: 0 0 5px #ffff00; }
                50% { border-color: #00ff00; box-shadow: 0 0 5px #00ff00; }
                67% { border-color: #0088ff; box-shadow: 0 0 5px #0088ff; }
                83% { border-color: #8800ff; box-shadow: 0 0 5px #8800ff; }
                100% { border-color: #ff0000; box-shadow: 0 0 5px #ff0000; }
            }
            .animate-rainbow { animation: rainbow 4s linear infinite !important; }

            @keyframes glitch {
                0% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(-2px, -2px); }
                60% { transform: translate(2px, 2px); }
                80% { transform: translate(2px, -2px); }
                100% { transform: translate(0); }
            }
            .animate-glitch-fast { animation: glitch 0.2s linear infinite !important; }

            @keyframes ping-custom {
                0% { transform: scale(1); opacity: 1; }
                70%, 100% { transform: scale(1.1); opacity: 0; }
            }
            .animate-ping-custom {
                position: relative;
            }
            .animate-ping-custom::before {
                content: "";
                position: absolute;
                inset: -2px;
                border: 2px solid currentColor;
                border-radius: inherit;
                animation: ping-custom 1.5s cubic-bezier(0, 0, 0.2, 1) infinite !important;
                pointer-events: none;
            }

            @keyframes vibrate {
                0% { transform: translate(0); }
                25% { transform: translate(1px, 1px) rotate(0.5deg); }
                50% { transform: translate(-1px, -1px) rotate(-0.5deg); }
                75% { transform: translate(1px, -1px) rotate(0.5deg); }
                100% { transform: translate(-1px, 1px) rotate(-0.5deg); }
            }
            .animate-vibrate { animation: vibrate 0.1s linear infinite !important; }

            .animate-social-marquee {
                display: flex;
                white-space: nowrap;
                width: max-content;
                animation: marquee-scroll var(--duration, 20s) linear infinite;
            }
            @keyframes marquee-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .social-marquee-mask {
                mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            }
        `}</style>
    ), []); // Empty deps — these never change


    // Update current time every 10 seconds to refresh scheduled items visibility
    React.useEffect(() => {
        if (isPreview) return; // No need to tick in preview
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);
        return () => clearInterval(timer);
    }, [isPreview]);

    const isScheduled = (link: LinkItem) => {
        if (isPreview) return true; // Show all in preview/admin
        const now = currentTime;
        const start = link.scheduleStart ? new Date(link.scheduleStart) : null;
        const end = link.scheduleEnd ? new Date(link.scheduleEnd) : null;

        if (start && now < start) return false;
        if (end && now > end) return false;
        return true;
    };

    const activeLinks = React.useMemo(() => {
        // Collect all IDs of links that are children of a collection
        const childIds = new Set<string>();
        links.forEach(l => {
            if (l.children && l.children.length > 0) {
                l.children.forEach(child => childIds.add(child.id));
            }
        });

        // Filter links: must be active, not archived, scheduled, AND not a child of another link
        return links.filter(l =>
            l.isActive &&
            !l.isArchived &&
            isScheduled(l) &&
            !childIds.has(l.id)
        );
    }, [links, currentTime, isPreview]);
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

    const [openPlaylist, setOpenPlaylist] = useState<LinkItem | null>(null);

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
                console.log(`📊 [ProfileRenderer] Tracking page view for profile: ${profile.id} (isPreview=${isPreview})`);
                apiClient.trackPageView(profile.id);
            } catch (e) { console.error('❌ [ProfileRenderer] trackPageView error:', e); }
        }
    }, [profile.id, isPreview]);

    // Top level social links - Now strictly matching the editor's "Social Networks" list
    const socialLinks = React.useMemo(() => {
        const foundSocials: LinkItem[] = [];
        const seenProviders = new Set<string>();

        const processItems = (items: LinkItem[]) => {
            items.forEach(l => {
                if (!l.isActive || l.isArchived || !isScheduled(l)) return;

                // ONLY pick links explicitly marked with 'social' layout
                if (l.layout === 'social' && l.type !== 'collection') {
                    // Try to identify the provider to avoid duplicates of the same network
                    const provider = SOCIAL_NETWORKS.find(sn =>
                        sn.id !== 'custom' &&
                        (l.url.toLowerCase().includes(sn.id) || (l.title?.toLowerCase() || '').includes(sn.id))
                    )?.id || l.url;

                    if (!seenProviders.has(provider)) {
                        foundSocials.push(l);
                        seenProviders.add(provider);
                    }
                }

                if (l.children && l.children.length > 0) {
                    processItems(l.children);
                }
            });
        };

        processItems(links);

        const integrations = profile.integrations || [];
        const result = [...foundSocials];

        integrations.forEach(integration => {
            if (!seenProviders.has(integration.provider)) {
                const network = SOCIAL_NETWORKS.find(sn => sn.id === integration.provider);
                const username = integration.profile_data?.username;
                if (network && username) {
                    let url = '';
                    if (integration.provider === 'instagram') url = `https://instagram.com/${username}`;
                    else if (integration.provider === 'tiktok') url = `https://tiktok.com/@${username}`;
                    else if (integration.provider === 'twitch') url = `https://twitch.tv/${username}`;
                    else if (integration.provider === 'youtube') url = `https://youtube.com/@${username}`;
                    else if (integration.provider === 'kick') url = `https://kick.com/${username}`;

                    if (url) {
                        result.push({
                            id: `integration-${integration.provider}`,
                            title: network.name,
                            url: url,
                            isActive: true,
                            layout: 'social',
                            type: 'link'
                        } as any);
                        seenProviders.add(integration.provider);
                    }
                }
            }
        });
        return result;
    }, [links, profile.integrations, currentTime]);

    // Button links - no longer filtering out 'social' layout to support dual-state
    const buttonLinks = React.useMemo(() => {
        const manual = activeLinks;
        const integrations = profile.integrations || [];
        const result = [...manual];

        const order = ['instagram', 'youtube', 'twitch', 'kick'];

        const isPlatformMatch = (link: LinkItem, provider: string): boolean => {
            const lowerUrl = (link.url || '').toLowerCase();
            const lowerTitle = (link.title || '').toLowerCase();
            const platform = (link.platform || '').toLowerCase();

            // Matches providers and common short links (e.g. youtu.be for youtube)
            const matchMap: Record<string, string[]> = {
                'instagram': ['instagram.com', 'instagr.am'],
                'youtube': ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
                'twitch': ['twitch.tv'],
                'tiktok': ['tiktok.com'],
                'kick': ['kick.com']
            };

            if (platform === provider) return true;
            if (lowerTitle.includes(provider)) return true;

            const domainMatches = matchMap[provider] || [provider];
            return domainMatches.some(domain => lowerUrl.includes(domain));
        };

        const hasLinkDeep = (list: LinkItem[], provider: string): boolean => {
            return list.some(l => {
                if (isPlatformMatch(l, provider)) return true;
                if (l.children && l.children.length > 0) return hasLinkDeep(l.children, provider);
                return false;
            });
        };

        const providersToInject = order.filter(p =>
            integrations.some(i => i.provider === p) &&
            !hasLinkDeep(links, p)
        );

        [...providersToInject].reverse().forEach(provider => {
            const integration = integrations.find(i => i.provider === provider);
            const username = integration?.profile_data?.username;
            if (username) {
                let url = '';
                if (provider === 'instagram') url = `https://instagram.com/${username}`;
                else if (provider === 'youtube') url = `https://youtube.com/@${username}`;
                else if (provider === 'twitch') url = `https://twitch.tv/${username}`;
                else if (provider === 'kick') url = `https://kick.com/${username}`;

                if (url) {
                    result.unshift({
                        id: `btn-integration-${provider}`,
                        title: provider === 'instagram' ? 'Instagram' : (provider === 'youtube' ? 'Canal do YouTube' : (provider === 'twitch' ? 'Twitch Live' : 'Kick Live')),
                        url: url,
                        isActive: true,
                        layout: 'classic',
                        type: 'link',
                        platform: provider
                    } as any);
                }
            }
        });
        return result;
    }, [activeLinks, profile.integrations]);

    const getLuminance = (hex: string) => {
        const rgb = hex.replace('#', '').match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [255, 255, 255];
        return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    };

    const isDarkTheme =
        profile.headerLayout === 'banner' || profile.headerLayout === 'compact'
            ? (profile.bannerBlurColor ? getLuminance(profile.bannerBlurColor.split('|')[0]) < 0.5 : (profile.headerLayout === 'banner'))
            : (profile.themeId === 'custom' && profile.customSolidColor)
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
                currentTheme.id === 'modern-nature' ||
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

    const kickIntegration = profile.integrations?.find(i => i.provider === 'kick');
    const kickFollowers = kickIntegration?.profile_data?.follower_count;
    const kickUsername = kickIntegration?.profile_data?.username;
    const kickDisplayName = (kickIntegration?.profile_data as any)?.display_name || kickUsername;
    const kickAvatar = kickIntegration?.profile_data?.avatar_url;
    const kickIsLive = (kickIntegration?.profile_data as any)?.is_live;

    const twitchIntegration = profile.integrations?.find(i => i.provider === 'twitch');
    const twitchFollowers = twitchIntegration?.profile_data?.follower_count;
    const twitchUsername = twitchIntegration?.profile_data?.username;
    const twitchDisplayName = (twitchIntegration?.profile_data as any)?.display_name || twitchUsername;
    const twitchAvatar = twitchIntegration?.profile_data?.avatar_url;
    const twitchIsLive = (twitchIntegration?.profile_data as any)?.is_live;
    const twitchStreamTitle = (twitchIntegration?.profile_data as any)?.stream_title;

    const youtubeIntegration = profile.integrations?.find(i => i.provider === 'youtube');
    const youtubeSubscribers = youtubeIntegration?.profile_data?.subscriber_count;
    const youtubeTitle = youtubeIntegration?.profile_data?.title;
    const youtubeUsername = youtubeIntegration?.profile_data?.username;
    const youtubeAvatar = youtubeIntegration?.profile_data?.avatar_url;

    const getHighlightClass = (type?: string) => {
        switch (type) {
            case 'pulse': return 'animate-pulse';
            case 'bounce': return 'animate-bounce';
            case 'shake': return 'animate-shake';
            case 'glow': return 'animate-glow';
            case 'wobble': return 'animate-wobble';
            case 'tada': return 'animate-tada';
            case 'jello': return 'animate-jello';
            case 'rubberBand': return 'animate-rubber';
            case 'heartbeat': return 'animate-heartbeat';
            case 'flash': return 'animate-flash';
            case 'pendulum': return 'animate-swing';
            case 'aura': return 'animate-pulsar';
            case 'spin': return 'animate-spin-slow';
            case 'float': return 'animate-float';
            case 'neon': return 'animate-neon';
            case 'spotlight': return 'animate-spotlight';
            case 'rainbow': return 'animate-rainbow';
            case 'glitch': return 'animate-glitch-fast';
            case 'ping': return 'animate-ping-custom';
            case 'vibrate': return 'animate-vibrate';
            default: return '';
        }
    };

    const handleLinkClick = async (id: string) => {
        try {
            console.log(`📊 [ProfileRenderer] Tracking click for item: ${id}`);
            if (apiClient) await apiClient.trackClick(id);
        } catch (e) {
            console.error('❌ [ProfileRenderer] Failed to track click:', e);
        }
    };

    // 🔐 Intercept clicks on password-protected links
    const handlePasswordProtectedLink = (link: LinkItem, e: React.MouseEvent) => {
        if (link.isPasswordProtected) {
            e.preventDefault();
            setLockedLink(link);
            return true;
        }
        return false;
    };

    // 📈 Intercept clicks on mediakit links
    const handleMediaKitLink = (link: LinkItem, e: React.MouseEvent) => {
        if (link.type === 'mediakit') {
            e.preventDefault();
            setOpenMediaKit(link);
            return true;
        }
        return false;
    };

    const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || '';

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

    const PixIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            className={className}
            fill="currentColor"
        >
            <path d="M7.40875 15.7481L1.07437 9.41438C0.84 9.18 0.84 8.79938 1.07437 8.565L3.385 6.25437C3.4975 6.14187 3.65125 6.07875 3.81062 6.07875H6.07812V3.81188C6.07812 3.6525 6.14125 3.49812 6.25375 3.38625L8.56437 1.07563C8.68125 0.95875 8.835 0.9 8.995 0.9C9.155 0.9 9.30875 0.95875 9.42562 1.07563L15.76 7.41C15.9944 7.64438 15.9944 8.025 15.76 8.25938L13.4494 10.57C13.3369 10.6825 13.1831 10.7456 13.0237 10.7456H10.7562V13.0131C10.7562 13.1725 10.6931 13.3269 10.5806 13.4388L8.27 15.7494C8.15125 15.8662 7.99937 15.925 7.83937 15.925C7.67937 15.925 7.52562 15.8662 7.40875 15.7481ZM8.995 1.96813L6.97812 3.985V6.57875C6.97812 6.85438 6.75375 7.07875 6.47812 7.07875H3.88437L1.96875 8.99438L7.84 14.8656L9.85687 12.8488V10.255C9.85687 9.97938 10.0812 9.755 10.3569 9.755H12.9506L14.8662 7.83938L8.995 1.96813ZM6.59125 7.57938H7.47625L7.995 8.09875L8.51375 7.57938H9.39875V8.46563L8.88 8.98438L9.39875 9.50313V10.3881H8.51375L7.995 9.86875L7.47625 10.3881H6.59125V9.50313L7.11 8.98438L6.59125 8.46563V7.57938Z" />
            <path d="M11.2338 6.07812C11.3931 6.07812 11.5469 6.14125 11.6594 6.25375L13.97 8.56437C14.0869 8.68125 14.1456 8.835 14.1456 8.995C14.1456 9.155 14.0869 9.30875 13.97 9.42562L11.6594 11.7362C11.5469 11.8487 11.3931 11.9119 11.2338 11.9119H8.97312C8.6975 11.9119 8.47313 11.6875 8.47313 11.4119V9.14375C8.47313 8.98438 8.41 8.83 8.2975 8.71812L5.98687 6.4075C5.87 6.29062 5.81125 6.13687 5.81125 5.97687C5.81125 5.81687 5.87 5.66312 5.98687 5.54625L8.2975 3.23563C8.41 3.12313 8.56375 3.06 8.72312 3.06H10.9906C11.2662 3.06 11.4906 3.28438 11.4906 3.56V5.82812C11.4906 5.9875 11.5537 6.14188 11.6662 6.25375L13.9769 8.56437C14.0938 8.68125 14.1525 8.835 14.1525 8.995C14.1525 9.155 14.0938 9.30875 13.9769 9.42562L11.6662 11.7362C11.5537 11.8487 11.4 11.9119 11.2406 11.9119H8.97312" stroke="white" strokeWidth="0.2" />
        </svg>
    );


    // Unified Styling Logic: Preserving Theme "Soul" while allowing Edits
    const isCustomTheme = currentTheme.id === 'custom';

    // Button Roundness Logic - Works across ALL themes as a direct override
    // Force Nature theme to use its specific shape even if 'rounder' is selected/defaulted
    const effectiveRoundness = (currentTheme.id === 'modern-nature' && (profile.buttonRoundness === 'rounder' || !profile.buttonRoundness))
        ? null
        : profile.buttonRoundness;

    const roundedClass = effectiveRoundness === 'square' ? 'rounded-none' :
        effectiveRoundness === 'round' ? 'rounded-xl' :
            effectiveRoundness === 'rounder' ? 'rounded-[24px]' :
                effectiveRoundness === 'full' ? 'rounded-full' :
                    (currentTheme.buttonClass.match(/rounded-[^\s]+(?=\s|$)/g)?.join(' ') || null);

    const borderRadiusValue = profile.buttonRoundness === 'square' ? 0 :
        profile.buttonRoundness === 'round' ? 12 :
            profile.buttonRoundness === 'rounder' ? 24 :
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
        if (types.includes('shadow')) cleaned = cleaned.replace(/\bshadow-\[.*?\]\b|\bshadow-(sm|md|lg|xl|2xl|inner|none|default)\b/g, '');
        return cleaned.trim();
    };

    // Unified Styling Logic: Preserving Theme "Soul" while allowing Edits
    const overrideTypes: ('rounded' | 'bg' | 'text' | 'border' | 'shadow')[] = [];
    if (roundedClass) overrideTypes.push('rounded');
    if (isCustomTheme && profile.customButtonColor) overrideTypes.push('bg');
    if (isCustomTheme && profile.customButtonTextColor) overrideTypes.push('text');

    const isProfileMode = profile.headerLayout === 'compact';

    // 1. Button Class - Start with theme base and apply surgical overrides
    let buttonClass = cleanClass(currentTheme.buttonClass, overrideTypes);

    if (roundedClass) buttonClass += ` ${roundedClass}`;

    // 2. Button Color Logic - Custom colors ONLY apply to 'custom' theme
    const buttonHex = (isCustomTheme && profile.customButtonColor) ? profile.customButtonColor : currentTheme.buttonHex;
    const mainButtonStyle = (isCustomTheme && profile.customButtonColor) ? { backgroundColor: profile.customButtonColor } : {};

    // 2.5 Font Logic - Always prioritize profile settings if available
    const effectiveFontFamily = profile.fontFamily || currentTheme.fontFamily || "'Inter', sans-serif";
    const effectiveTextColor = (profile.customTextColor || currentTheme.textHex || (isDarkTheme ? '#ffffff' : '#0f172a'));
    const containerStyle = {
        fontFamily: effectiveFontFamily,
        color: effectiveTextColor
    };

    // Helper to get contrast color (Black or White) based on a hex color
    const getContrastColor = (hex: string) => {
        if (!hex) return 'white';
        // Remove # if present
        const color = hex.replace('#', '');
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'text-slate-900' : 'text-white';
    };

    // Parse customSecondaryColor: supports "#color1" or "#color1|#color2" (gradient)
    // FIX: Always use profile.customSecondaryColor if in Profile Mode (Compact).
    // The default is now STABLE (white for light, slate-900 for dark) based ONLY on profile/layout settings.
    const rawSecondary = isProfileMode ? (profile.customSecondaryColor || (profile.bannerBlurColor && getLuminance(profile.bannerBlurColor.split('|')[0]) < 0.5 ? '#0f172a' : '#ffffff')) : null;
    const secParts = rawSecondary ? rawSecondary.split('|') : [];
    const secColor1 = secParts[0];
    const secColor2 = secParts[1] || null;

    const headerContentBg = isProfileMode
        ? (secColor2
            ? `linear-gradient(135deg, ${secColor1}cc, ${secColor2}cc)`
            : `${secColor1}cc`)
        : 'transparent';

    // For getContrastColor, use the primary color only
    const headerTextColorClass = isProfileMode
        ? getContrastColor(secColor1)
        : '';

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
        .trim() + ' overflow-hidden cursor-target'; // Ensure content respects rounding and is targetable by cursor

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

        // 1. If currently in a DARK card/theme context and button is NOT light, use white
        if (!isButtonLight && (isDarkTheme)) return '#ffffff';

        // 2. If the button specifically is light, we MUST use dark text for visibility
        if (isButtonLight) return '#0f172a'; // slate-900 equivalent

        // 3. Fallback to white if background is dark/glass
        if (profile.customBackground || isDarkTheme) return '#ffffff';

        // 4. Default to undefined to let Tailwind/Inheritance handle it
        return undefined;
    };

    const mainTextColorStyle = effectiveTextColor ? { color: effectiveTextColor } : {};

    // Collection Title Style
    const effectiveCollectionTextColor = (profile.customCollectionTextColor || profile.customTextColor || currentTheme.textHex || (isDarkTheme ? '#ffffff' : '#0f172a'));
    const collectionTextColorStyle = effectiveCollectionTextColor ? { color: effectiveCollectionTextColor } : {};

    const textClass = currentTheme.textClass;

    const MusicRichCard: React.FC<{ link: LinkItem, handleLinkClick: (id: string) => void }> = ({ link, handleLinkClick }) => {
        const musicTitle = link.title || 'Música';
        const musicArtist = link.subtitle || 'Artista';
        const isDeezer = link.embedType === 'deezer' || link.url.includes('deezer');
        const contrastColor = getSmartTextColor();
        const hasTracks = link.children && link.children.length > 0;

        return (
            <div
                className={`w-full overflow-hidden isolate relative group flex transition-all duration-300 ${baseCardClass} h-[72px] p-0 items-center justify-between mb-1 ${getHighlightClass(link.highlight)}`}
                style={mainButtonStyle}
            >
                <div className="flex h-full items-center px-4 gap-3.5 flex-1 min-w-0">
                    {/* Album Art */}
                    <div className={`relative w-12 h-12 ${profile.buttonRoundness === 'square' ? 'rounded-none' : 'rounded-lg'} overflow-hidden shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500`}>
                        <img src={link.image || (isDeezer ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg' : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b')}
                            alt={musicTitle}
                            className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center h-full text-left" style={{ fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                        {/* Header Label */}
                        <div className="flex items-center gap-1.5 mb-1 opacity-50">
                            {isDeezer ? <DeezerIcon size={10} color={getSmartTextColor()} /> : <SiSpotify size={10} color="#1DB954" />}
                            <span className="text-[7px] uppercase tracking-[0.25em] leading-none font-bold" style={{ color: contrastColor }}>
                                {isDeezer ? 'Deezer' : 'Spotify'} {hasTracks ? 'Álbum' : ''}
                            </span>
                        </div>

                        {/* Song Title (Large & Uppercase like Twitch) */}
                        <h4 className="text-[14px] font-bold truncate tracking-tight uppercase leading-none mb-1.5" style={{ color: contrastColor }}>
                            {musicTitle}
                        </h4>

                        {/* Artist Info Row (Structured like Followers) */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 opacity-80">
                                <Music size={10} style={{ color: contrastColor }} className="opacity-50" />
                                <span className="text-[10px] font-bold uppercase leading-none" style={{ color: contrastColor }}>
                                    {musicArtist}
                                </span>
                                {(hasTracks || !isDeezer) && (
                                    <div className="flex items-end gap-0.5 h-2 ml-1 opacity-40">
                                        <span className="w-0.5 h-full bg-current animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ color: contrastColor }} />
                                        <span className="w-0.5 h-1/2 bg-current animate-[music-bar_1.1s_ease-in-out_infinite]" style={{ color: contrastColor }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 h-full flex items-center pr-4">
                    {hasTracks ? (
                        <ChevronUp size={20} style={{ color: contrastColor }} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <Play size={18} fill={contrastColor} style={{ color: contrastColor }} className="ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>

                {/* Overlay link */}
                <a
                    href={hasTracks ? "#" : link.url}
                    target={hasTracks ? "_self" : "_blank"}
                    rel="noreferrer"
                    className="absolute inset-0 z-30 cursor-pointer"
                    onClick={(e) => {
                        if (hasTracks) {
                            e.preventDefault();
                            setOpenPlaylist(link);
                        } else {
                            handleLinkClick(link.id);
                        }
                    }}
                />

                <style>{`
                    @keyframes music-bar {
                        0%, 100% { height: 25%; opacity: 0.5; }
                        50% { height: 100%; opacity: 1; }
                    }
                `}</style>
            </div>
        );
    };

    const MusicPlaylistDrawer = () => {
        const isDeezer = openPlaylist?.embedType === 'deezer' || openPlaylist?.url.includes('deezer');
        const isDark = isDarkTheme;

        return (
            <AnimatePresence>
                {openPlaylist && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpenPlaylist(null)}
                            className="absolute inset-0 bg-black/80 md:bg-black/60 md:backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.4}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100 || info.velocity.y > 500) {
                                    setOpenPlaylist(null);
                                }
                            }}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg bg-white rounded-t-[32px] overflow-hidden pointer-events-auto flex flex-col shadow-2xl"
                            style={{
                                backgroundColor: isDark ? '#121212' : '#FFFFFF',
                                color: isDark ? '#FFFFFF' : '#000000',
                                borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                height: 'auto',
                                maxHeight: '85%',
                                willChange: 'transform'
                            }}
                        >
                            {/* Drawer Handle */}
                            <div className="w-full flex justify-center pt-3 pb-1">
                                <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                            </div>

                            {/* Header Section */}
                            <div className={`px-6 pt-4 pb-6 flex items-center gap-5 border-b ${isDark ? 'border-white/5' : 'border-[#1a1a1a]/5'}`}>
                                <div className="relative group/cover shrink-0">
                                    <img src={openPlaylist?.image || (isDeezer ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg' : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b')}
                                        className="w-20 h-20 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                                        alt="" loading="lazy" decoding="async" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1 opacity-50">
                                        {isDeezer ? <DeezerIcon size={12} color={isDark ? '#FFFFFF' : '#000000'} /> : <SiSpotify size={12} color="#1DB954" />}
                                        <span className="text-[8px] uppercase tracking-[0.3em] font-black">
                                            {isDeezer ? 'Deezer' : 'Spotify'} {openPlaylist?.url.includes('album') ? 'Álbum' : 'Playlist'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black truncate leading-none uppercase tracking-tight mb-1">
                                        {openPlaylist?.title}
                                    </h3>
                                    <p className="text-sm opacity-60 font-medium truncate italic">
                                        {openPlaylist?.subtitle || 'Várias faixas'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpenPlaylist(null)}
                                    className={`p-2 rounded-full transform active:scale-95 transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                                >
                                    <ChevronDown size={24} />
                                </button>
                            </div>

                            {/* Tracks List */}
                            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-1 overscroll-contain scrollbar-hide">
                                {openPlaylist.children?.map((track, idx) => (
                                    <motion.a
                                        key={track.id}
                                        href={track.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => handleLinkClick(track.id)}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`flex items-center gap-4 p-3.5 rounded-2xl group transition-all relative overflow-hidden ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                                    >
                                        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.02] transition-opacity" />

                                        <div className="flex items-baseline gap-4 flex-1 min-w-0">
                                            <span className="text-[10px] font-mono opacity-20 w-4 shrink-0 font-black">
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-bold truncate tracking-tight uppercase ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                                                    {track.title}
                                                </h4>
                                                {track.subtitle && (
                                                    <p className="text-[10px] opacity-40 font-bold tracking-wider truncate uppercase mt-0.5">
                                                        {track.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-8 h-8 flex items-center justify-center transition-all">
                                            <Play size={16} fill={isDarkTheme ? "#FFFFFF" : "#000000"} className={`transition-all ${isDarkTheme ? 'text-white' : 'text-black'} opacity-40 group-hover:opacity-100 group-hover:scale-110 ml-0.5`} />
                                        </div>
                                    </motion.a>
                                ))}
                            </div>

                            {/* Bottom Pad for Home Indicator */}
                            <div className="h-4 w-full" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        );
    };


    return (
        <div
            className={`relative w-full ${isPreview ? 'h-full flex-1' : 'min-h-[100dvh]'} flex flex-col isolate`}
            style={{ fontFamily: profile.fontFamily }}
        >
            {/* Performance: CSS global inserted ONCE via a memoized tag — avoids re-creating style rules on every render */}
            {profileGlobalStyles}
            {/* Background Layer - Hidden in Perfil Mode */}
            {profile.headerLayout !== 'compact' && (
                <BackgroundLayer profile={profile} currentTheme={currentTheme} isStatic={isStatic} />
            )}
            {!isStatic && currentTheme.id.startsWith('brutalist-') && profile.headerLayout !== 'banner' && profile.headerLayout !== 'compact' && (
                <BrutalistVisualizer profile={profile} currentTheme={currentTheme} />
            )}

            {/* GLOBAL BLUR FADE OVERLAY — Performance: reduced blur radius + contain to isolate repaint */}
            {(profile.enableBlur && profile.headerLayout !== 'banner' && profile.headerLayout !== 'compact') && (
                <div
                    className="absolute inset-0 z-10 pointer-events-none md:backdrop-blur-[20px] bg-gradient-to-b from-transparent via-black/10 to-black/90 md:bg-none"
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 2%, rgba(26,26,26,0.05) 5%, rgba(26,26,26,0.3) 15%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0.95) 40%, black 45%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 2%, rgba(26,26,26,0.05) 5%, rgba(26,26,26,0.3) 15%, rgba(26,26,26,0.7) 30%, rgba(26,26,26,0.95) 40%, black 45%)',
                        contain: 'layout style'
                    }}
                />
            )}

            {/* Content Container */}
            <div
                className={`w-full ${isPreview ? 'flex-1 min-h-0 overflow-y-auto scrollbar-hide' : 'flex-1'} flex flex-col relative z-20 ${currentTheme.id === 'glass' ? 'text-white' : currentTheme.textClass}`}
                style={{
                    ...containerStyle,
                    fontSize: `${(profile.fontSize || undefined) || 16}px`,
                    fontWeight: ((profile.fontWeight || undefined) || undefined),
                    fontStyle: (profile.fontItalic) ? 'italic' : 'normal'
                }}
            >
                {/* Custom CSS Injection */}
                {profile.customCSS && (
                    <style dangerouslySetInnerHTML={{ __html: profile.customCSS }} />
                )}

                {profile.headerLayout === 'banner' && (
                    <div className="relative w-full h-[62vh] min-h-[380px] shrink-0 overflow-visible">
                        {/* Image wrapper with mask to reveal BackgroundLayer blur */}
                        <div
                            className="absolute inset-0"
                            style={{
                                maskImage: 'radial-gradient(ellipse 140% 100% at 50% 0%, black 0%, black 70%, transparent 100%)',
                                WebkitMaskImage: 'radial-gradient(ellipse 140% 100% at 50% 0%, black 0%, black 70%, transparent 100%)'
                            }}
                        >
                            {/* The Large Image */}
                            <img src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Nodus'}`}
                                alt={profile.name}
                                className="w-full h-full object-cover" loading="lazy" decoding="async" />

                        </div>

                        {/* Content Overlaid at Bottom (Shifted Down) */}
                        <div className="absolute bottom-0 left-0 w-full px-8 pt-4 pb-2 z-20 flex flex-col items-center text-center translate-y-10">
                            {/* 1. Name */}
                            <h3
                                className="text-[2.2em] font-medium text-white mb-0.5 tracking-tight flex items-center gap-2 drop-shadow-xl"
                                style={{ fontFamily: effectiveFontFamily }}
                            >
                                {profile.name}
                                {profile.isVerified && (
                                    <img src={verifiedBadge} alt="Verified" className="w-[0.85em] h-[0.85em] shrink-0" loading="lazy" decoding="async" />
                                )}
                            </h3>


                            {/* 2. Bio Text (Moved up and Bold) */}
                            {profile.bio && (
                                <p
                                    className="text-white font-normal text-[1.1rem] max-w-[340px] leading-relaxed drop-shadow-lg mb-3"
                                    style={{ fontSize: profile.bioFontSize ? `${profile.bioFontSize}px` : undefined }}
                                >
                                    {profile.bio}
                                </p>
                            )}

                            {/* 3. Social Icons (Simplified - No Background) */}
                            {socialLinks.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-4 mb-0.5">
                                    {socialLinks.map(link => {
                                        const network = SOCIAL_NETWORKS.find(n => n.name === link.title) ||
                                            SOCIAL_NETWORKS.find(n => link.url.toLowerCase().includes(n.id)) ||
                                            SOCIAL_NETWORKS[0];
                                        const Icon = network.icon || Globe;
                                        return (
                                            <a
                                                key={link.id}
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-white hover:opacity-75 active:opacity-50 transition-opacity drop-shadow-2xl"
                                            >
                                                <Icon size={24} />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Status Bar - Only for Preview Mode (Absolute if Banner or Perfil) */}
                {isPreview && (
                    <div className={`w-full px-6 pt-3 pb-2 flex justify-between items-center z-30 ${(['banner', 'compact'].includes(profile.headerLayout || '')) ? 'absolute top-0 left-0 pt-3' : ''} ${(isDarkTheme || profile.customBackground || currentTheme.id === 'glass' || profile.headerLayout === 'banner')
                        ? 'text-white'
                        : (profile.headerLayout === 'compact' ? 'text-white/80' : 'text-slate-900')
                        }`}>
                        <span className="text-xs font-medium tracking-wide">9:41</span>
                        <div className="flex items-center gap-1.5 opacity-90">
                            <Signal size={12} strokeWidth={2.5} />
                            <Wifi size={12} strokeWidth={2.5} />
                            <Battery size={14} strokeWidth={2.5} />
                        </div>
                    </div>
                )}

                {/* Share Button (Adjusted for Banner/Perfil) */}
                <div className={`absolute ${(['banner', 'compact'].includes(profile.headerLayout || '')) ? 'top-4' : 'top-[34px]'} right-6 z-30`}>
                    <InteractiveButton strength={10} tiltStrength={5}>
                        <button
                            onClick={onShare}
                            className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <Share size={18} />
                        </button>
                    </InteractiveButton>
                </div>
                {/* Menu / Options Button (Adjusted for Banner/Perfil) */}
                <div className={`absolute ${(['banner', 'compact'].includes(profile.headerLayout || '')) ? 'top-4' : 'top-[34px]'} left-6 z-30`}>
                    <InteractiveButton strength={10} tiltStrength={5}>
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all overflow-hidden cursor-pointer relative p-[6px]">
                            <video
                                src="/icons/Anime_mascot_fixed_white_background_delpmaspu_.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </InteractiveButton>
                </div>



                <div
                    className={`px-6 ${profile.headerLayout === 'banner' ? 'pt-12 pb-2' : (profile.headerLayout === 'compact' ? 'pt-0 pb-12' : (isPreview ? 'pt-12 pb-0' : 'pt-16 pb-0'))} flex flex-col relative`}
                    style={profile.headerLayout === 'banner' ? {
                        minHeight: '250px'
                    } : {}}
                >

                    {/* Compact/Social Header Banner - Full Width & Clean */}
                    {profile.headerLayout === 'compact' && (
                        <>
                            <div className="absolute top-0 -left-6 w-[calc(100%+3rem)] h-[180px] z-0 overflow-hidden">
                                {profile.customBackground ? (
                                    <img src={profile.customBackground}
                                        alt=""
                                        className="w-full h-full object-cover" loading="eager" decoding="async" />
                                ) : (
                                    <div className="w-full h-full bg-slate-900/10" />
                                )}
                            </div>
                            {/* Full-length Intelligent Backdrop for Social Layout */}
                            <div
                                className={`absolute top-[165px] -left-6 w-[calc(100%+3rem)] bottom-0 rounded-t-[48px] z-0 shadow-[0_-15px_40px_rgba(26,26,26,0.1)] overflow-hidden backdrop-blur-md`}
                                style={{ background: headerContentBg }}
                            >
                                <div className="noise-overlay opacity-20" />
                            </div>
                        </>
                    )}

                    {/* Profile Section - Shared for other layouts */}
                    {profile.headerLayout !== 'banner' && (
                        <motion.div
                            className={`w-full mb-1 flex flex-col items-center text-center relative z-10 ${profile.headerLayout === 'compact' ? 'mt-[175px] pt-0 pb-1 px-4' : ''}`}
                        >
                            {/* Avatar */}
                            {profile.avatarUrl && (
                                <div className={`relative group shrink-0 ${profile.headerLayout === 'compact' ? '-mt-12 mb-4 z-20' : 'mb-4'}`}>
                                    <div className={`rounded-full overflow-hidden shadow-xl ${profile.headerLayout === 'compact'
                                        ? 'w-24 h-24 border-0'
                                        : `border-4 ${currentTheme.avatarBorder} ${profile.avatarSize === 'sm' ? 'w-20 h-20' :
                                            profile.avatarSize === 'lg' ? 'w-32 h-32' :
                                                'w-24 h-24'
                                        }`
                                        }`}>
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-full h-full object-cover rounded-full"
                                            loading="eager"
                                            decoding="async"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Nodus'}`;
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Name/Logo & Bio */}
                            <div className={`flex flex-col items-center flex-1 min-w-0 ${headerTextColorClass}`}>
                                <div className="flex items-center gap-2 justify-center w-full">
                                    {profile.headerStyle === 'logo' && profile.logoUrl ? (
                                        <img
                                            src={profile.logoUrl}
                                            alt={profile.name}
                                            loading="eager"
                                            decoding="async"
                                            className="mb-2 object-contain h-12"
                                        />
                                    ) : (
                                        <h3
                                            className="mb-0 tracking-tight flex items-center gap-2 text-wrap break-words text-[1.3em]"
                                            style={{ ...collectionTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                        >
                                            {profile.name}
                                            {profile.isVerified && (
                                                <img
                                                    src={verifiedBadge}
                                                    alt="Verificado"
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-[0.85em] h-[0.85em] object-contain shrink-0"
                                                    title="Conta Verificada"
                                                />
                                            )}
                                        </h3>
                                    )}
                                </div>



                                {profile.bio && (
                                    <p className={`text-[1em] opacity-90 leading-relaxed whitespace-pre-line text-center ${profile.headerLayout === 'compact' ? '' : 'max-w-[300px]'}`}
                                        style={{
                                            ...collectionTextColorStyle,
                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                            fontSize: profile.bioFontSize ? `${profile.bioFontSize}px` : undefined
                                        }}
                                    >
                                        {profile.bio}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Social Icons Row - Shared for other layouts */}
                    {profile.headerLayout !== 'banner' && socialLinks.length > 0 && (
                        <div className={`w-full overflow-hidden mt-1 mb-1 relative ${socialLinks.length > 5 ? 'social-marquee-mask' : ''}`}>
                            <div
                                className={`flex items-center gap-2 px-4 ${socialLinks.length > 5 ? 'animate-social-marquee' : 'justify-center flex-wrap'}`}
                                style={{ '--duration': `${socialLinks.length * 3}s` } as any}
                            >
                                {/* First set / Main set */}
                                {socialLinks.map((link, idx) => {
                                    const network = SOCIAL_NETWORKS.find(n => n.name === link.title) ||
                                        SOCIAL_NETWORKS.find(n => link.url.toLowerCase().includes(n.id)) ||
                                        SOCIAL_NETWORKS[0];
                                    const Icon = network.icon || Globe;

                                    return (
                                        <motion.a
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => handleLinkClick(link.id)}
                                            className={`transition-all duration-300 ${roundedClass || 'rounded-full'} p-2 shrink-0`}
                                            style={{ ...mainTextColorStyle }}
                                        >
                                            <Icon size={24} />
                                        </motion.a>
                                    );
                                })}

                                {/* Duplicated set for infinite loop (only if marquee is active) */}
                                {socialLinks.length > 5 && socialLinks.map((link, idx) => {
                                    const network = SOCIAL_NETWORKS.find(n => n.name === link.title) ||
                                        SOCIAL_NETWORKS.find(n => link.url.toLowerCase().includes(n.id)) ||
                                        SOCIAL_NETWORKS[0];
                                    const Icon = network.icon || Globe;

                                    return (
                                        <a
                                            key={`${link.id}-m2`}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => handleLinkClick(link.id)}
                                            className={`transition-all duration-300 ${roundedClass || 'rounded-full'} p-2 shrink-0`}
                                            style={{ ...mainTextColorStyle }}
                                        >
                                            <Icon size={24} />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}



                    {/* TABS (Links / Shop) - Only if products exist */}
                    {products.length > 0 && (
                        <div className="w-full mb-6 px-1 flex justify-center">
                            <div className={`w-auto min-w-[180px] p-1 rounded-full flex relative ${isDarkTheme || profile.customBackground || currentTheme.id === 'glass' ? 'bg-white/10' : 'bg-slate-200/60'}`}>
                                {/* Sliding background could be complex, sticking to simple conditional classes for now */}
                                <InteractiveButton className="flex-1" strength={10} tiltStrength={5}>
                                    <button
                                        onClick={() => setActiveTab('links')}
                                        className={`w-full py-1.5 rounded-full text-sm transition-all duration-300 ${activeTab === 'links'
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
                                </InteractiveButton>
                                <InteractiveButton className="flex-1" strength={10} tiltStrength={5}>
                                    <button
                                        onClick={() => setActiveTab('shop')}
                                        className={`w-full py-1.5 rounded-full text-sm transition-all duration-300 ${activeTab === 'shop'
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
                                </InteractiveButton>
                            </div>
                        </div>
                    )}


                    {/* Main Dynamic Content Area */}
                    <div className="flex flex-col w-full relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {/* SHOP VIEW (Collections or Grid) */}
                            {products.length > 0 && activeTab === 'shop' && (
                                <motion.div
                                    key="shop-tab"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0 }}
                                    className="w-full space-y-4 flex-1"
                                >

                                    {/* Collection List View */}
                                    {!activeCollection ? (
                                        <div className="space-y-4">
                                            <div
                                                className={`flex items-center gap-2.5 mb-2 text-xs font-normal uppercase tracking-widest opacity-60 px-1`}
                                                style={{ ...collectionTextColorStyle, fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                            >
                                                <ShoppingBag size={14} className="stroke-[2.5]" />
                                                <span>Categorias</span>
                                            </div>

                                            {Object.entries(collections).map(([name, items]) => (
                                                <InteractiveButton key={name} className="w-full">
                                                    <button
                                                        onClick={() => handleCollectionClick(name)}
                                                        className={`w-full group relative transition-all duration-300 ${cleanClass(baseCardClass, ['bg', 'text']).replace('overflow-hidden', '')}`}
                                                        style={{
                                                            ...mainButtonStyle,
                                                            color: getSmartTextColor(),
                                                            ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art') ? { overflow: 'visible' } : { overflow: 'hidden' })
                                                        }}
                                                    >
                                                        <div className={`flex flex-col w-full h-full overflow-hidden ${roundedClass}`}>
                                                            {/* Preview Images Collage - Refined */}
                                                            <div className={`flex h-48 w-full gap-1 p-1 ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
                                                                {items.length === 1 ? (
                                                                    <div className="flex-1 h-full relative overflow-hidden rounded-xl">
                                                                        <img src={items[0].image} alt={items[0].name} className="w-full h-full block object-cover transition-transform group-hover:scale-110 duration-700" loading="lazy" decoding="async" />
                                                                        <div className="absolute inset-0 bg-black/5" />
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {items.slice(0, 3).map((item, i) => (
                                                                            <div key={item.id} className={`flex-1 h-full relative overflow-hidden ${i === 0 ? 'rounded-l-xl' : i === items.slice(0, 3).length - 1 ? 'rounded-r-xl' : ''}`}>
                                                                                <img src={item.image} alt={item.name} className="w-full h-full block object-cover transition-transform group-hover:scale-110 duration-700" loading="lazy" decoding="async" />
                                                                                <div className="absolute inset-0 bg-black/5" />
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className={`p-4 flex items-center justify-between ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
                                                                <div className="text-left">
                                                                    <h3 className="text-sm font-normal" style={{ color: getSmartTextColor(), fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{name}</h3>
                                                                    <p className="text-[10px] font-normal uppercase tracking-wider mt-0.5 opacity-60" style={{ color: getSmartTextColor(), fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                                                                        {items.length} {items.length === 1 ? 'Produto' : 'Produtos'}
                                                                    </p>
                                                                </div>
                                                                <div className={`w-8 h-8 rounded-full ${isDarkTheme ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center transition-colors`}>
                                                                    <ChevronRight size={16} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </InteractiveButton>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Filtered Product Grid - Refined Storefront */
                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-8 px-1">
                                                <div className="flex flex-col">
                                                    <InteractiveButton strength={5} tiltStrength={3}>
                                                        <button
                                                            onClick={() => setActiveCollection(null)}
                                                            className={`flex items-center gap-1.5 text-[10px] font-normal uppercase tracking-widest opacity-50 hover:opacity-100 transition-all mb-1.5`}
                                                            style={{ ...collectionTextColorStyle, fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                                                        >
                                                            <ChevronLeft size={12} strokeWidth={3} />
                                                            <span>Voltar</span>
                                                        </button>
                                                    </InteractiveButton>
                                                    <h2 className={`text-xl font-medium tracking-tight`} style={{ ...collectionTextColorStyle, fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
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
                                                            <div className={`relative w-full aspect-[4/5] transform transition-transform group-hover:scale-[1.02] duration-300 ${currentTheme.id.startsWith('brutalist-') ? 'overflow-visible' : ''}`}>
                                                                <div className={`absolute inset-0 overflow-hidden ${roundedClass} border-none shadow-none`}>
                                                                    <div
                                                                        className={`absolute inset-0 z-0 ${buttonClass.replace(/\b(w-full|p[xy]?-\d+|min-h-\d+|items-center|justify-between)\b/g, '').trim()}`}
                                                                        style={{ ...mainButtonStyle }}
                                                                    />
                                                                    <img src={product.image} alt={product.name} className="relative z-10 w-full h-full block object-cover" loading="lazy" decoding="async" />
                                                                    <div className="absolute inset-0 z-20 bg-black/5" />

                                                                    {/* Badge container with high z-index and clip safety */}
                                                                    <div className="absolute top-2 left-2 z-10">
                                                                        {product.discountCode && (
                                                                            <div className="bg-slate-950/90 text-white text-[9px] font-medium uppercase tracking-tighter px-2 py-1 rounded-lg">
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
                                                                <span className={`text-[13px] font-normal truncate`} style={{ ...collectionTextColorStyle, fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                                                                    {product.name}
                                                                </span>
                                                                {product.price && (
                                                                    <span className={`text-[11px] font-medium opacity-70 mt-2`} style={{ ...collectionTextColorStyle, fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                                                                        {product.price}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );

                                                    return (
                                                        <InteractiveButton key={product.id} className="w-full flex">
                                                            <a
                                                                href={product.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={() => handleLinkClick(product.id)}
                                                                className={`flex flex-col group relative transition-all duration-300 w-full`}
                                                            >
                                                                {productContent}
                                                            </a>
                                                        </InteractiveButton>
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
                                    className="flex flex-col gap-1.5 w-full relative flex-1"
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
                                                    <div key={`social-row-${group[0].id}`} className="flex items-center justify-center gap-2 w-full mb-3 flex-wrap relative">
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
                                                                    href={iconLink.isPasswordProtected ? undefined : iconLink.url}
                                                                    target={iconLink.isPasswordProtected ? undefined : "_blank"}
                                                                    rel="noreferrer"
                                                                    onClick={(e) => {
                                                                        if (handlePasswordProtectedLink(iconLink, e)) return;
                                                                        handleLinkClick(iconLink.id);
                                                                    }}
                                                                    // AQUI: Aplicamos buttonClass (limpa) para que o ícone social tenha o mesmo "feel" do botão (hover, shadow)
                                                                    // Removemos classes de layout/padding do botão para que não quebre o ícone
                                                                    className={`relative group flex items-center justify-center w-[72px] h-[72px] transition-all duration-300 ${buttonClass.replace(/\b(block|w-full|min-h-\[.*?\]|px-\d+(\.\d+)?|py-\d+(\.\d+)?|justify-between|text-center)\b/g, '').trim()} ${getHighlightClass(iconLink.highlight)} cursor-pointer`}
                                                                    style={{ ...mainButtonStyle, borderRadius: borderRadiusValue }} // Força o estilo do botão (cor e redondura)
                                                                >
                                                                    <div className={`absolute inset-0 -m-2 opacity-10 rounded-full ${currentTheme.id.includes('dark') ? 'bg-white' : 'bg-black'}`}></div>

                                                                    <div className="relative z-10 p-1">
                                                                        {iconLink.image ? (
                                                                            <img
                                                                                src={iconLink.image}
                                                                                alt=""
                                                                                className="w-8 h-8 rounded-lg object-cover"
                                                                                loading="lazy"
                                                                                decoding="async"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.onerror = null;
                                                                                    e.currentTarget.style.display = 'none';
                                                                                    e.currentTarget.className = "w-8 h-8 rounded-lg object-contain p-1.5 opacity-30 bg-white/10";
                                                                                }}
                                                                            />
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
                                                                            <img
                                                                                src={cardLink.image}
                                                                                alt=""
                                                                                className="w-full h-full object-contain transition-transform duration-700"
                                                                                loading="lazy"
                                                                                decoding="async"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.onerror = null;
                                                                                    e.currentTarget.style.display = 'none';
                                                                                    e.currentTarget.className = "w-full h-full object-contain p-10 opacity-10 transition-transform duration-700";
                                                                                }}
                                                                            />
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
                                                                <InteractiveButton key={cardLink.id} className="w-full">
                                                                    <motion.a
                                                                        initial={{ scale: 0.95, opacity: 0 }}
                                                                        whileInView={{ scale: 1, opacity: 1 }}
                                                                        viewport={{ once: true }}
                                                                        href={cardLink.isPasswordProtected ? undefined : cardLink.url}
                                                                        target={cardLink.isPasswordProtected ? undefined : "_blank"}
                                                                        rel="noreferrer"
                                                                        onClick={(e) => {
                                                                            if (handlePasswordProtectedLink(cardLink, e)) return;
                                                                            handleLinkClick(cardLink.id);
                                                                        }}
                                                                        className={`group relative overflow-hidden transition-all duration-300 w-full ${baseCardClass} ${getHighlightClass(cardLink.highlight)} cursor-pointer`}
                                                                        style={{ ...mainButtonStyle, backgroundColor: buttonHex }}
                                                                    >
                                                                        {cardContent}
                                                                    </motion.a>
                                                                </InteractiveButton>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                                currentCardGroup = [];
                                            }
                                        };

                                        buttonLinks.forEach(link => {
                                            // 1. Specialized Integrated Components (Instagram, YouTube, Twitch)
                                            if (instagramIntegration && link.type === 'collection' && (link.platform === 'instagram' || link.title === 'Posts do Instagram')) {
                                                flushIcons();
                                                flushCards();
                                                const collectionMedia = (link.children || []).map(c => ({
                                                    id: c.id,
                                                    media_url: c.image,
                                                    thumbnail_url: c.image,
                                                    permalink: c.url,
                                                    caption: c.title,
                                                    media_type: c.videoUrl ? 'VIDEO' : 'IMAGE'
                                                }));
                                                renderedItems.push(
                                                    <InteractiveButton key={`instagram-card-${link.id}`} className="w-full mb-1">
                                                        <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                            {link.title && (
                                                                <div className="text-center mb-2 px-4 flex flex-col items-center gap-1.5 pt-2">
                                                                    <div className="opacity-90 text-sm font-normal uppercase tracking-widest" style={{ ...collectionTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{link.title}</div>
                                                                </div>
                                                            )}
                                                            <InstagramCard username={instagramUsername || 'instagram_user'} followers={instagramFollowers || 0} avatarUrl={instagramAvatar || ''} media={collectionMedia.length > 0 ? collectionMedia : instagramMedia} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} variant={link.layout === 'classic' ? 'profile' : 'feed'} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                        </motion.div>
                                                    </InteractiveButton>
                                                );
                                            } else if (instagramIntegration && (link.platform === 'instagram' || (link.url.includes('instagram.com') && link.type !== 'collection'))) {
                                                flushIcons();
                                                flushCards();
                                                renderedItems.push(
                                                    <InteractiveButton key={`instagram-profile-card-${link.id}`} className="w-full mb-1">
                                                        <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                            <InstagramCard username={instagramUsername || 'instagram_user'} followers={instagramFollowers || 0} avatarUrl={instagramAvatar || ''} media={instagramMedia} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} variant={link.layout === 'classic' ? 'profile' : 'feed'} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                        </motion.div>
                                                    </InteractiveButton>
                                                );
                                            } else if (youtubeIntegration && (link.platform === 'youtube' || (link.url.includes('youtube.com') && !link.url.includes('watch?v=') && !link.url.includes('/shorts/')))) {
                                                flushIcons();
                                                flushCards();
                                                renderedItems.push(
                                                    <InteractiveButton key={`youtube-card-${link.id}`} className="w-full mb-1">
                                                        <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                            <YouTubeCard username={youtubeUsername || link.url} title={youtubeTitle || link.title} subscribers={youtubeSubscribers || 0} avatarUrl={youtubeAvatar || ''} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                        </motion.div>
                                                    </InteractiveButton>
                                                );
                                            } else if (twitchIntegration && (link.platform === 'twitch' || link.title.toLowerCase().includes('twitch'))) {
                                                flushIcons();
                                                flushCards();
                                                renderedItems.push(
                                                    <InteractiveButton key={`twitch-card-${link.id}`} className="w-full mb-1">
                                                        <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                            <TwitchCard username={twitchUsername || 'twitch_user'} displayName={twitchDisplayName || 'Twitch User'} followers={twitchFollowers || 0} avatarUrl={twitchAvatar || ''} isLive={twitchIsLive} streamTitle={twitchStreamTitle} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                        </motion.div>
                                                    </InteractiveButton>
                                                );
                                            } else if (kickIntegration && (link.platform === 'kick' || link.title.toLowerCase().includes('kick'))) {
                                                flushIcons();
                                                flushCards();
                                                renderedItems.push(
                                                    <InteractiveButton key={`kick-card-${link.id}`} className="w-full mb-1">
                                                        <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                            <KickCard username={kickUsername || 'kick_user'} displayName={kickDisplayName || 'Kick User'} followers={kickFollowers || 0} avatarUrl={kickAvatar || ''} isLive={kickIsLive} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                        </motion.div>
                                                    </InteractiveButton>
                                                );
                                            } else if (link.type === 'agenda') {
                                                flushIcons();
                                                flushCards();
                                                renderedItems.push(
                                                    <InteractiveButton key={`agenda-${link.id}`} className="w-full mb-1">
                                                        <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                            {link.title && (
                                                                <div className="text-center mb-2 px-4 flex flex-col items-center gap-1.5 pt-2">
                                                                    <div className="opacity-90 text-sm font-normal uppercase tracking-widest" style={{ ...collectionTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{link.title}</div>
                                                                </div>
                                                            )}
                                                            <AgendaCard
                                                                events={link.events || []}
                                                                themeButtonClass={baseCardClass}
                                                                themeButtonStyle={mainButtonStyle}
                                                                themeTextHex={getSmartTextColor()}
                                                                isDark={isDarkTheme}
                                                                fontFamily={profile.fontFamily}
                                                                fontWeight={profile.fontWeight || undefined}
                                                                fontItalic={profile.fontItalic}
                                                            />
                                                        </motion.div>
                                                    </InteractiveButton>
                                                );
                                            } else if (link.type === 'header') {
                                                flushIcons();
                                                flushCards();
                                                renderedItems.push(<motion.div key={`header-${link.id}`} transition={{ duration: 0 }} className="w-full text-center py-2 mb-1 mt-1 opacity-80" style={{ ...mainTextColorStyle, fontWeight: 'bold', fontSize: '1.1em', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{link.title}</motion.div>);
                                            } else if (link.type === 'map' || link.title?.toLowerCase() === 'localização') {
                                                flushIcons();
                                                flushCards();
                                                // MapBlock for specific Map items
                                                renderedItems.push(
                                                    <InteractiveButton key={link.id} className="w-full">
                                                        <div className={getHighlightClass(link.highlight)}>
                                                            <MapBlock link={link} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                        </div>
                                                    </InteractiveButton>
                                                );
                                            } else if (link.layout === 'icon') {
                                                flushCards();
                                                currentIconGroup.push(link);
                                            } else if (link.layout === 'card') {
                                                flushIcons();
                                                currentCardGroup.push(link);
                                            } else if ((link.layout === 'carousel' || link.layout === 'list' || link.layout === 'stacked' || link.type === 'collection') && !isMusicLink(link)) {
                                                flushIcons();
                                                flushCards();
                                                const activeChildren = link.children?.filter(c => c.isActive && isScheduled(c)) || [];
                                                const isMusic = isMusicLink(link);
                                                const collectionLayout = link.layout || 'list';
                                                if (collectionLayout === 'carousel' && (activeChildren.length > 0 || isMusic)) {
                                                    const scrollContainerId = `scroll-${link.id}`;
                                                    const scrollLeft = () => { const el = document.getElementById(scrollContainerId); if (el) el.scrollBy({ left: -250, behavior: 'smooth' }); };
                                                    const scrollRight = () => { const el = document.getElementById(scrollContainerId); if (el) el.scrollBy({ left: 250, behavior: 'smooth' }); };
                                                    renderedItems.push(
                                                        <motion.div key={link.id} transition={{ duration: 0 }} className={`w-full pt-1 pb-1 group/carousel ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'}`}>
                                                            {link.title && (
                                                                <div className="text-center mb-2 px-4 flex flex-col items-center gap-0.5">
                                                                    <div className="opacity-90 text-sm font-normal uppercase tracking-widest" style={{ ...collectionTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{link.title}</div>
                                                                </div>
                                                            )}
                                                            <div className="relative w-full">
                                                                <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-30 p-2 bg-white/90 text-slate-900 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-white"><ChevronLeft size={20} /></button>
                                                                <div id={scrollContainerId} className="flex overflow-x-auto gap-2 px-1 pb-4 -mx-1 scrollbar-hide snap-x relative scroll-smooth">
                                                                    {(activeChildren.length > 0 ? activeChildren : [link]).map(child => (
                                                                        <InteractiveButton key={child.id} className="flex-shrink-0 w-44">
                                                                            <motion.a
                                                                                transition={{ duration: 0 }}
                                                                                href={child.isPasswordProtected ? undefined : child.url}
                                                                                target={child.isPasswordProtected ? undefined : "_blank"}
                                                                                rel="noreferrer"
                                                                                onClick={(e) => {
                                                                                    if (handlePasswordProtectedLink(child, e)) return;
                                                                                    handleLinkClick(child.id);
                                                                                }}
                                                                                className={`relative group flex flex-col overflow-hidden transition-all duration-300 ${baseCardClass || buttonClass} ${getHighlightClass(child.highlight)}`}
                                                                                style={mainButtonStyle}
                                                                            >
                                                                                <div className="relative z-10 flex flex-col h-full w-full">
                                                                                    <div className="relative overflow-hidden h-36 w-full bg-white">
                                                                                        {child.image ? <img
                                                                                            src={child.image}
                                                                                            alt=""
                                                                                            className="w-full h-full block object-contain"
                                                                                            loading="lazy"
                                                                                            decoding="async"
                                                                                            onError={(e) => {
                                                                                                e.currentTarget.onerror = null;
                                                                                                e.currentTarget.className = "w-full h-full block object-contain p-8 opacity-20";
                                                                                            }}
                                                                                        /> : <div className="w-full h-full flex items-center justify-center bg-slate-200/20 text-slate-400"><ShoppingBag size={20} /></div>}
                                                                                    </div>
                                                                                    <div className="p-2 flex flex-col justify-center items-center text-center h-12 relative">
                                                                                        <span className="text-[0.7em] leading-tight truncate w-full" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{child.title}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.a>
                                                                        </InteractiveButton>
                                                                    ))}
                                                                </div>
                                                                <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-30 p-2 bg-white/90 text-slate-900 rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-white"><ChevronRight size={20} /></button>
                                                            </div >
                                                        </motion.div >
                                                    );
                                                } else {
                                                    renderedItems.push(
                                                        <motion.div key={link.id} transition={{ duration: 0 }} className={`w-full pt-1 pb-1 ${renderedItems.length === 0 ? 'mt-6' : 'mt-0'}`}>
                                                            {link.title && (
                                                                <div className="text-center mb-2 px-4 flex flex-col items-center gap-1.5 pt-2">
                                                                    <div className="opacity-90 text-sm font-normal uppercase tracking-widest" style={{ ...collectionTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{link.title}</div>
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col gap-2 relative">
                                                                {(() => {
                                                                    const nestedItems: React.ReactNode[] = [];

                                                                    activeChildren.forEach(child => {
                                                                        // Links inside collections lose their individual layout overrides
                                                                        // and follow the collection's display rules.

                                                                        // Standard items
                                                                        if (isMusicLink(child)) {
                                                                            nestedItems.push(
                                                                                <InteractiveButton key={child.id} className="w-full">
                                                                                    <div className={getHighlightClass(child.highlight)}>
                                                                                        <MusicRichCard link={child} handleLinkClick={handleLinkClick} />
                                                                                    </div>
                                                                                </InteractiveButton>
                                                                            );
                                                                        } else if (child.embedType === 'youtube') {
                                                                            nestedItems.push(
                                                                                <InteractiveButton key={child.id} className="w-full">
                                                                                    <div className={getHighlightClass(child.highlight)}>
                                                                                        <YouTubeEmbed url={child.url} title={child.title} className={roundedClass || 'rounded-2xl'} />
                                                                                    </div>
                                                                                </InteractiveButton>
                                                                            );
                                                                        } else if (child.embedType === 'tiktok') {
                                                                            nestedItems.push(
                                                                                <InteractiveButton key={child.id} className="w-full">
                                                                                    <div className={getHighlightClass(child.highlight)}>
                                                                                        <TikTokEmbed url={child.url} title={child.title} videoUrl={child.videoUrl} className={roundedClass || 'rounded-2xl'} />
                                                                                    </div>
                                                                                </InteractiveButton>
                                                                            );
                                                                        } else {
                                                                            // Check Integrations for children
                                                                            let renderedSpecial = false;
                                                                            if (child.platform === 'instagram' || (child.url.includes('instagram.com') && child.type !== 'collection')) {
                                                                                if (instagramIntegration) {
                                                                                    nestedItems.push(
                                                                                        <InteractiveButton key={child.id} className="w-full">
                                                                                            <div className={getHighlightClass(child.highlight)}>
                                                                                                <InstagramCard username={instagramUsername || 'instagram_user'} followers={instagramFollowers || 0} avatarUrl={instagramAvatar || ''} media={instagramMedia} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} variant={child.layout === 'classic' ? 'profile' : 'feed'} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                                            </div>
                                                                                        </InteractiveButton>
                                                                                    );
                                                                                    renderedSpecial = true;
                                                                                }
                                                                            }
                                                                            if (!renderedSpecial && (child.platform === 'youtube' || (child.url.includes('youtube.com') && !child.url.includes('watch?v=') && !child.url.includes('/shorts/')))) {
                                                                                if (youtubeIntegration) {
                                                                                    nestedItems.push(
                                                                                        <InteractiveButton key={child.id} className="w-full">
                                                                                            <div className={getHighlightClass(child.highlight)}>
                                                                                                <YouTubeCard username={youtubeUsername || child.url} title={youtubeTitle || child.title} subscribers={youtubeSubscribers || 0} avatarUrl={youtubeAvatar || ''} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                                            </div>
                                                                                        </InteractiveButton>
                                                                                    );
                                                                                    renderedSpecial = true;
                                                                                }
                                                                            }
                                                                            if (!renderedSpecial && (child.platform === 'twitch' || child.title.toLowerCase().includes('twitch'))) {
                                                                                if (twitchIntegration) {
                                                                                    nestedItems.push(
                                                                                        <InteractiveButton key={child.id} className="w-full">
                                                                                            <div className={getHighlightClass(child.highlight)}>
                                                                                                <TwitchCard username={twitchUsername || 'twitch_user'} displayName={twitchDisplayName || 'Twitch User'} followers={twitchFollowers || 0} avatarUrl={twitchAvatar || ''} isLive={twitchIsLive} streamTitle={twitchStreamTitle} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                                            </div>
                                                                                        </InteractiveButton>
                                                                                    );
                                                                                    renderedSpecial = true;
                                                                                }
                                                                            }
                                                                            if (!renderedSpecial && (child.platform === 'kick' || child.title.toLowerCase().includes('kick'))) {
                                                                                if (kickIntegration) {
                                                                                    nestedItems.push(
                                                                                        <InteractiveButton key={child.id} className="w-full">
                                                                                            <div className={getHighlightClass(child.highlight)}>
                                                                                                <KickCard username={kickUsername || 'kick_user'} displayName={kickDisplayName || 'Kick User'} followers={kickFollowers || 0} avatarUrl={kickAvatar || ''} isLive={kickIsLive} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                                            </div>
                                                                                        </InteractiveButton>
                                                                                    );
                                                                                    renderedSpecial = true;
                                                                                }
                                                                            }
                                                                            if (!renderedSpecial && (child.type === 'map' || child.title?.toLowerCase() === 'localização')) {
                                                                                nestedItems.push(
                                                                                    <InteractiveButton key={child.id} className="w-full">
                                                                                        <div className={getHighlightClass(child.highlight)}>
                                                                                            <MapBlock link={child} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                                        </div>
                                                                                    </InteractiveButton>
                                                                                );
                                                                                renderedSpecial = true;
                                                                            }
                                                                            if (!renderedSpecial) {
                                                                                const network = SOCIAL_NETWORKS.find(n => child.title.toLowerCase().includes(n.id)) || SOCIAL_NETWORKS.find(n => child.url.toLowerCase().includes(n.id));
                                                                                const Icon = network?.icon;
                                                                                const isHighlighted = child.highlight === 'blink' || child.highlight === 'glow' || child.highlight === 'flash' || child.highlight === 'rainbow' || child.highlight === 'glitch';
                                                                                const isVideo = (child.url.includes('youtube.com') || child.url.includes('youtu.be') || child.url.includes('tiktok.com'));

                                                                                const EffectWrapper = isHighlighted ? GlitchButton : isVideo ? ElasticButton : React.Fragment;
                                                                                const effectProps = (isHighlighted || isVideo) ? { className: "w-full" } : {};

                                                                                nestedItems.push(
                                                                                    <InteractiveButton key={child.id} className="w-full" glowColor={`${getSmartTextColor()}33`}>
                                                                                        <EffectWrapper {...effectProps}>
                                                                                            <motion.a
                                                                                                transition={{ duration: 0.2 }}
                                                                                                whileHover={{ scale: 1.005 }}
                                                                                                href={child.isPasswordProtected ? undefined : child.url}
                                                                                                target={child.isPasswordProtected ? undefined : "_blank"}
                                                                                                rel="noreferrer"
                                                                                                onClick={(e) => {
                                                                                                    if (handlePasswordProtectedLink(child, e)) return;
                                                                                                    handleLinkClick(child.id);
                                                                                                }}
                                                                                                className={`block w-full h-[72px] transform group relative py-2.5 px-4 flex items-center gap-3 ${buttonClass} ${getHighlightClass(child.highlight)}`}
                                                                                                style={{
                                                                                                    ...mainButtonStyle,
                                                                                                    fontFamily: profile.fontFamily,
                                                                                                    fontWeight: (profile.fontWeight || undefined),
                                                                                                    fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                                                                                    ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art') ? { overflow: 'visible' } : { overflow: 'hidden' }),
                                                                                                    borderRadius: borderRadiusValue
                                                                                                }}
                                                                                            >
                                                                                                {/* Icon/Image Container */}
                                                                                                <div className="relative shrink-0 z-10">
                                                                                                    {child.image ? (
                                                                                                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#1a1a1a]/5 group-hover:scale-105 transition-transform">
                                                                                                            <img
                                                                                                                src={child.image}
                                                                                                                alt=""
                                                                                                                className="w-full h-full object-cover"
                                                                                                                loading="lazy"
                                                                                                                decoding="async"
                                                                                                                onError={(e) => {
                                                                                                                    e.currentTarget.onerror = null;
                                                                                                                    e.currentTarget.style.display = 'none';
                                                                                                                    e.currentTarget.className = "w-full h-full object-contain p-1.5 opacity-30 bg-white/10";
                                                                                                                }}
                                                                                                            />
                                                                                                        </div>
                                                                                                    ) : Icon ? (
                                                                                                        <div className="w-9 h-9 flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform">
                                                                                                            <Icon size={20} />
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="w-9" />
                                                                                                    )}
                                                                                                </div>

                                                                                                <div className="flex-1 flex flex-col justify-center text-center min-w-0 z-10 relative">
                                                                                                    <span className={`text-[14px] font-bold leading-tight uppercase tracking-tight ${child.subtitle ? 'line-clamp-1 truncate' : 'break-words'}`} style={{ color: getSmartTextColor() }}>
                                                                                                        {child.title}
                                                                                                    </span>
                                                                                                    {child.subtitle && (
                                                                                                        <span className="text-[10px] opacity-60 leading-tight flex items-center justify-center gap-1 mt-1 truncate" style={{ color: getSmartTextColor() }}>
                                                                                                            {child.subtitle}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>

                                                                                                <div className="w-9 shrink-0 flex items-center justify-center z-10 relative opacity-20 group-hover:opacity-100 transition-opacity">
                                                                                                    <ChevronRight size={16} style={{ color: getSmartTextColor() }} strokeWidth={3} />
                                                                                                </div>
                                                                                            </motion.a>
                                                                                        </EffectWrapper>
                                                                                    </InteractiveButton>
                                                                                );
                                                                            }
                                                                        }
                                                                    });

                                                                    return nestedItems;
                                                                })()}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                }
                                            } else if (isMusicLink(link)) {
                                                renderedItems.push(
                                                    <InteractiveButton key={link.id} className="w-full">
                                                        <div className={getHighlightClass(link.highlight)}>
                                                            <MusicRichCard link={link} handleLinkClick={handleLinkClick} />
                                                        </div>
                                                    </InteractiveButton>
                                                );
                                            } else if (link.embedType === 'youtube') {
                                                renderedItems.push(
                                                    <InteractiveButton key={link.id} className="w-full">
                                                        <div className={getHighlightClass(link.highlight)}>
                                                            <YouTubeEmbed url={link.url} title={link.title} className={roundedClass || 'rounded-2xl'} />
                                                        </div>
                                                    </InteractiveButton>
                                                );
                                            } else if (link.embedType === 'tiktok') {
                                                renderedItems.push(
                                                    <InteractiveButton key={link.id} className="w-full">
                                                        <div className={getHighlightClass(link.highlight)}>
                                                            <TikTokEmbed url={link.url} title={link.title} videoUrl={link.videoUrl} className={roundedClass || 'rounded-2xl'} />
                                                        </div>
                                                    </InteractiveButton>
                                                );
                                            } else if (link.type === 'mediakit') {
                                                flushIcons();
                                                flushCards();
                                                renderedItems.push(
                                                    <InteractiveButton key={`mediakit-${link.id}`} className="w-full mb-3" glowColor={`${getSmartTextColor()}33`}>
                                                        <motion.div
                                                            transition={{ duration: 0.2 }}
                                                            whileHover={{ scale: 1.02 }}
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    if (handlePasswordProtectedLink(link, e)) return;
                                                                    handleLinkClick(link.id);
                                                                    handleMediaKitLink(link, e);
                                                                }}
                                                                className={`w-full h-[72px] transform group relative flex items-center p-0 ${buttonClass} ${getHighlightClass(link.highlight)} cursor-pointer`}
                                                                style={{
                                                                    ...mainButtonStyle,
                                                                    borderRadius: borderRadiusValue,
                                                                    fontFamily: profile.fontFamily,
                                                                    fontWeight: (profile.fontWeight || undefined),
                                                                    fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                                                    ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art') ? { overflow: 'visible' } : { overflow: 'hidden' })
                                                                }}
                                                            >
                                                                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0 border-r bg-black/[0.03]" style={{ borderColor: `${getSmartTextColor()}0A` }}>
                                                                    <BarChart3 size={22} className="group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} style={{ color: getSmartTextColor() }} />
                                                                </div>
                                                                <div className="flex-1 min-w-0 flex flex-col items-start justify-center px-6 py-2 text-left">
                                                                    <span
                                                                        className="uppercase tracking-[0.1em] truncate w-full flex items-center gap-2"
                                                                        style={{
                                                                            color: getSmartTextColor(),
                                                                            fontSize: `${profile.fontSize || 15}px`,
                                                                            fontWeight: profile.fontWeight || '700',
                                                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                                                            lineHeight: '1.2'
                                                                        }}
                                                                    >
                                                                        {link.title || t('mediakit.title')}
                                                                    </span>
                                                                    {link.subtitle && (
                                                                        <span
                                                                            className="opacity-50 uppercase tracking-[0.05em] truncate w-full mt-0.5"
                                                                            style={{
                                                                                color: getSmartTextColor(),
                                                                                fontSize: `${Math.max((profile.fontSize || 15) - 4, 10)}px`,
                                                                                fontWeight: profile.fontWeight || '400',
                                                                                fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                                                                lineHeight: '1.2'
                                                                            }}
                                                                        >
                                                                            {link.subtitle}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="w-12 h-full flex items-center justify-center border-l shrink-0" style={{ borderColor: `${getSmartTextColor()}0A` }}>
                                                                    <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0 transition-transform" strokeWidth={1.5} style={{ color: getSmartTextColor() }} />
                                                                </div>
                                                            </button>
                                                        </motion.div>
                                                    </InteractiveButton>
                                                );
                                            } else {
                                                flushIcons();
                                                const network = SOCIAL_NETWORKS.find(n => link.title.toLowerCase().includes(n.id)) || SOCIAL_NETWORKS.find(n => link.url.toLowerCase().includes(n.id));
                                                const Icon = network?.icon;
                                                const isHighlighted = link.highlight === 'blink' || link.highlight === 'glow' || link.highlight === 'flash' || link.highlight === 'rainbow' || link.highlight === 'glitch';
                                                const isVideo = (link.url.includes('youtube.com') || link.url.includes('youtu.be') || link.url.includes('tiktok.com'));

                                                const EffectWrapper = isHighlighted ? GlitchButton : isVideo ? ElasticButton : React.Fragment;
                                                const effectProps = (isHighlighted || isVideo) ? { className: "w-full" } : {};

                                                renderedItems.push(
                                                    <InteractiveButton key={link.id} className="w-full" glowColor={`${getSmartTextColor()}33`}>
                                                        <EffectWrapper {...effectProps}>
                                                            <motion.a
                                                                transition={{ duration: 0.2 }}
                                                                whileHover={{ scale: 1.005 }}
                                                                href={link.isPasswordProtected ? undefined : link.url}
                                                                target={link.isPasswordProtected ? undefined : "_blank"}
                                                                rel="noreferrer"
                                                                onClick={(e) => {
                                                                    if (handlePasswordProtectedLink(link, e)) return;
                                                                    handleLinkClick(link.id);
                                                                }}
                                                                className={`block w-full h-[72px] transform group relative py-3 px-4 flex items-center gap-3 ${buttonClass} ${getHighlightClass(link.highlight)} cursor-pointer`}
                                                                style={{
                                                                    ...mainButtonStyle,
                                                                    fontFamily: profile.fontFamily,
                                                                    fontWeight: (profile.fontWeight || undefined),
                                                                    fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                                                    ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art') ? { overflow: 'visible' } : { overflow: 'hidden' }),
                                                                    borderRadius: borderRadiusValue
                                                                }}
                                                            >
                                                                {/* Icon/Image Container */}
                                                                <div className="relative shrink-0 z-10">
                                                                    {link.image ? (
                                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#1a1a1a]/5 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                                            <img
                                                                                src={link.image}
                                                                                alt=""
                                                                                className="w-full h-full object-cover"
                                                                                loading="lazy"
                                                                                decoding="async"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.onerror = null;
                                                                                    e.currentTarget.style.display = 'none';
                                                                                    e.currentTarget.className = "w-full h-full object-contain p-2 opacity-30 bg-white/10";
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ) : Icon ? (
                                                                        <div className="w-10 h-10 flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform duration-300">
                                                                            <Icon size={22} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-10" /> // Spacer to keep title centered if no icon
                                                                    )}
                                                                </div>

                                                                {/* Text Content */}
                                                                <div className="flex-1 flex flex-col justify-center text-center min-w-0 z-10 relative">
                                                                    <span className={`text-[15px] font-bold leading-tight uppercase tracking-tight ${link.subtitle ? 'line-clamp-1 truncate' : 'line-clamp-2 break-words'}`} style={{ color: getSmartTextColor() }}>
                                                                        {link.title}
                                                                    </span>
                                                                    {link.subtitle && (
                                                                        <span className="text-[11px] opacity-60 leading-tight flex items-center justify-center gap-1 mt-1 truncate" style={{ color: getSmartTextColor() }}>
                                                                            {(link.url.includes('youtube.com') || link.url.includes('youtu.be')) && !link.url.includes('watch?v=') && !link.url.includes('/shorts/') && !link.url.includes('/live/') && <Youtube size={10} className="shrink-0" />}
                                                                            {link.url.includes('tiktok.com') && <Music size={10} fill="currentColor" className="shrink-0" />}
                                                                            {link.subtitle}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Action Indicator (Right Side) — 🔐 lock if password protected */}
                                                                <div className="w-10 shrink-0 flex items-center justify-center z-10 relative opacity-40 group-hover:opacity-100 transition-all">
                                                                    {link.isPasswordProtected ? (
                                                                        <div className="bg-black/5 p-1.5 rounded-md border border-black/5">
                                                                            <Lock size={15} style={{ color: getSmartTextColor() }} strokeWidth={2.5} />
                                                                        </div>
                                                                    ) : (
                                                                        <ChevronRight size={18} style={{ color: getSmartTextColor() }} strokeWidth={3} />
                                                                    )}
                                                                </div>

                                                                {/* Subtle shine effect on hover */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                                            </motion.a>
                                                        </EffectWrapper>
                                                    </InteractiveButton>
                                                );
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
                                                <InteractiveButton key={method.id} className="w-full">
                                                    <motion.button
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
                                                        className={`relative w-full h-[72px] transition-all duration-300 group ${buttonClass.replace('justify-between', 'justify-center')} flex items-center justify-center cursor-pointer`}
                                                        style={{
                                                            ...mainButtonStyle,
                                                            color: getSmartTextColor(),
                                                            borderRadius: borderRadiusValue,
                                                            ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art') ? { overflow: 'visible' } : { overflow: 'hidden' })
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                        <div className="relative z-10 flex items-center justify-center gap-3 w-full px-6">
                                                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                                                {method.type === 'pix' ? (
                                                                    <img src="/icons/pix-svgrepo-com.svg" className="w-6 h-6 opacity-90" style={{ filter: getSmartTextColor() === '#ffffff' ? 'invert(1) brightness(2)' : 'none' }} alt="Pix" />
                                                                ) : (
                                                                    <SiPaypal size={22} className="opacity-90" />
                                                                )}
                                                            </div>
                                                            <span className="font-bold text-[15px] uppercase tracking-tight flex-1 text-center">
                                                                {method.label || (method.type === 'pix' ? 'Fazer um Pix' : 'Pagar com PayPal')}
                                                            </span>
                                                            <div className="w-8 shrink-0" /> {/* Spacer to balance the layout */}
                                                        </div>
                                                    </motion.button>
                                                </InteractiveButton>
                                            ))}
                                        </div>
                                    )}

                                    {activeLinks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-50 space-y-2 flex-1">
                                            <span className="text-sm">Nenhum link ativo</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Theme-Integrated Support Button & Newsletter */}
                    <div className="mt-4 flex flex-col gap-4">
                        {profile.supportKey && (
                            <InteractiveButton key="support-button" className="w-full">
                                <motion.a
                                    transition={{ duration: 0.2 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href={profile.supportType === 'paypal' ? `https://${profile.supportKey}` : '#'}
                                    onClick={(e) => {
                                        if (profile.supportType === 'pix') {
                                            e.preventDefault();
                                            alert(`Chave Pix copiada: ${profile.supportKey}`);
                                            navigator.clipboard.writeText(profile.supportKey || '');
                                        }
                                    }}
                                    className={`block w-full h-[72px] text-center text-base transition-all duration-300 transform group relative py-2.5 px-6 flex items-center justify-between ${buttonClass} cursor-pointer`}
                                    style={{
                                        ...mainButtonStyle,
                                        color: getSmartTextColor(),
                                        borderRadius: borderRadiusValue,
                                        fontFamily: profile.fontFamily,
                                        fontWeight: (profile.fontWeight || undefined),
                                        fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                        ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art') ? { overflow: 'visible' } : { overflow: 'hidden' })
                                    }}
                                >
                                    <div className="relative z-10 w-full flex items-center justify-between">
                                        {profile.supportType === 'pix' ? (
                                            <img src="https://img.icons8.com/?size=100&id=CuUOYOfd3Dy9&format=png&color=000000" alt="Pix" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-0.5" loading="lazy" decoding="async" />
                                        ) : (
                                            <img src="https://img.icons8.com/?size=100&id=34525&format=png&color=000000" alt="PayPal" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-1" loading="lazy" decoding="async" />
                                        )}
                                        <span className="truncate flex-1 px-3" style={{ color: getSmartTextColor(), fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>Apoiar</span>
                                        <span className="w-8 opacity-50 flex justify-end" style={{ color: getSmartTextColor() }}><Coffee size={20} /></span>
                                    </div>
                                </motion.a>
                            </InteractiveButton>
                        )}

                        {(profile.planType === 'free' || !profile.planType || !profile.hideBranding) && (
                            <div className="mt-4 mb-2 flex flex-col items-center w-full px-4 text-center gap-1.5 relative z-30">
                                <div className="flex flex-col items-center gap-0.5">
                                    <span style={{
                                        color: effectiveCollectionTextColor || '#111827',
                                        opacity: 0.6,
                                        fontSize: '8px',
                                        letterSpacing: '0.5em',
                                        textTransform: 'uppercase',
                                        fontWeight: 400,
                                        display: 'block'
                                    }}>
                                        POWERED BY
                                    </span>
                                    <a
                                        href="https://www.nodus.my"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="no-underline"
                                        style={{ display: 'block', textDecoration: 'none' }}
                                    >
                                        <span style={{
                                            color: effectiveCollectionTextColor || '#111827',
                                            fontSize: '14px',
                                            fontWeight: 900,
                                            letterSpacing: '0.3em',
                                            textTransform: 'uppercase',
                                            display: 'block',
                                            opacity: 1
                                        }}>
                                            NODUS
                                        </span>
                                    </a>
                                </div>

                                <div className="flex items-center gap-4 mt-1">
                                    <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: effectiveCollectionTextColor || '#111827', opacity: 0.4, fontSize: '8px', textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.15em', fontWeight: 400 }}>Termos</a>
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: effectiveCollectionTextColor || '#111827', opacity: 0.4, fontSize: '8px', textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.15em', fontWeight: 400 }}>Privacidade</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Foreground Layer (For themes like Sakura) */}
            {currentTheme.id === 'kawaii-sakura' && profile.headerLayout !== 'banner' && <KawaiiSakuraForeground />}
            <MusicPlaylistDrawer />

            {/* 🔐 Password Link Modal */}
            {lockedLink && (
                <PasswordLinkModal
                    linkId={lockedLink.id}
                    linkTitle={lockedLink.title}
                    onClose={() => setLockedLink(null)}
                    apiBaseUrl={apiBaseUrl}
                />
            )}

            <MediaKitModal
                isOpen={!!openMediaKit}
                onClose={() => setOpenMediaKit(null)}
                profile={profile}
                links={links}
                mediaKitLink={openMediaKit}
                isPreview={isPreview}
            />
        </div>
    );
};

export default ProfileRenderer;
