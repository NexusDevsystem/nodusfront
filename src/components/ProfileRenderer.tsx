import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, LinkItem, Product, Store } from '../types';
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
    Lock,
    Folder,
    FolderOpen,
    ShoppingCart,
    Tag as TagIcon,
    X,
    DollarSign
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
import { MusicRichCard, MusicPlaylistDrawer } from './profile/MusicCards';
import ProductDrawer from './profile/ProductDrawer';
import { imgOptimized } from '../utils/imageUtils';

/**
 * LinkCountdown helper component for scheduled links
 */
const LinkCountdown: React.FC<{
    targetDate: string;
    onZero: () => void;
    title: string;
    style?: React.CSSProperties;
    fontFamily?: string;
}> = ({ targetDate, onZero, title, style, fontFamily }) => {
    const [timeLeft, setTimeLeft] = React.useState<{ d: number, h: number, m: number, s: number } | null>(null);

    React.useEffect(() => {
        const calculate = () => {
            const now = new Date().getTime();
            const dest = new Date(targetDate).getTime();
            const diff = dest - now;

            if (diff <= 0) {
                onZero();
                return { d: 0, h: 0, m: 0, s: 0 };
            }

            return {
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            };
        };

        const timer = setInterval(() => {
            const val = calculate();
            if (val) setTimeLeft(val);
            else {
                clearInterval(timer);
                setTimeLeft(null);
            }
        }, 1000);

        const initial = calculate();
        if (initial) setTimeLeft(initial);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex flex-col items-center justify-center p-2 w-full" style={{ ...style, fontFamily }}>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2 font-black text-center w-full truncate px-4">{title}</span>
            <div className="flex gap-3 justify-center">
                {[
                    { val: timeLeft.d, label: 'D' },
                    { val: timeLeft.h, label: 'H' },
                    { val: timeLeft.m, label: 'M' },
                    { val: timeLeft.s, label: 'S' }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center min-w-[32px]">
                        <span className="text-2xl font-black tabular-nums leading-none">{String(item.val).padStart(2, '0')}</span>
                        <span className="text-[8px] font-bold opacity-30 mt-1">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};



// MusicRichCard externalized


// Music components externalized


interface ProfileRendererProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    stores?: Store[];
    isPreview?: boolean; // If true, shows mock status bar (9:41, wifi etc)
    isStatic?: boolean; // If true, disables animated backgrounds for performance (e.g. in ThemeSelector)
    onShare?: () => void;
    forcedTab?: 'links' | 'shop';
}

const ProfileRenderer: React.FC<ProfileRendererProps> = ({ profile, links, products = [], stores = [], isPreview = false, isStatic = false, onShare, forcedTab }) => {
    const { t, i18n } = useTranslation();
    const isPT = i18n.language?.startsWith('pt');
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const [lockedLink, setLockedLink] = React.useState<LinkItem | null>(null);
    const [openMediaKit, setOpenMediaKit] = React.useState<LinkItem | null>(null);
    const [expandedIncentive, setExpandedIncentive] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const portalTargetRef = React.useRef<HTMLDivElement>(null);

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
    // Update current time every second to refresh scheduled items visibility (especially for countdowns)
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // 1s for the countdown to tick
        return () => clearInterval(timer);
    }, []);

    const isScheduled = (link: LinkItem) => {
        if (isPreview) return true;
        const now = currentTime.getTime();

        // End time is absolute
        if (link.scheduleEnd) {
            const end = new Date(link.scheduleEnd).getTime();
            if (now > end) return false;
        }

        if (link.scheduleStart) {
            const start = new Date(link.scheduleStart).getTime();
            if (now < start) {
                // If before start, only show if countdown is requested
                return !!link.showCountdown;
            }
        }

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
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
        const activeStores = stores.filter(s => s.isActive !== false);
        const activeProducts = products.filter(p => !p.isArchived && p.isActive !== false);

        // Ensure all explicitly created collections in ACTIVE STORES exist even if empty
        activeStores.forEach(s => {
            (s.collections || []).forEach(c => {
                // If the collection is DISABLED in the store, we don't even create the group if it's empty
                if ((s.disabledCollections || []).includes(c)) return;
                if (!groups[c]) groups[c] = [];
            });

            // Also add a group specifically for the STORE NAME to allow store-level views
            if (!groups[s.name]) {
                groups[s.name] = activeProducts.filter(p => p.storeId === s.id);
            }
        });

        activeProducts.forEach(p => {
            // Find the store this product belongs to
            const store = stores.find(s => s.id === p.storeId);
            // If the store is inactive, skip product
            if (store && store.isActive === false) return;

            const col = p.collection || 'Geral';
            // If the collection is disabled in the specific store, skip
            if (store && (store.disabledCollections || []).includes(col)) return;

            if (!groups[col]) groups[col] = [];
            groups[col].push(p);
        });
        return groups;
    }, [products, stores]);

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
                // Determine or generate visitor fingerprint for unique visitor tracking
                let fp = localStorage.getItem('nodus_blog_fingerprint'); // Reuse blog fingerprint if exists
                if (!fp) {
                    fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    localStorage.setItem('nodus_blog_fingerprint', fp);
                }

                console.log(`📊 [ProfileRenderer] Tracking page view for profile: ${profile.id} (isPreview=${isPreview}, fingerprint=${fp})`);
                apiClient.trackPageView(profile.id, fp);
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

                // Detect if it's a social network to show it at the top too
                const network = SOCIAL_NETWORKS.find(sn =>
                    sn.id !== 'custom' &&
                    (l.url.toLowerCase().includes(sn.id) || (l.title?.toLowerCase() || '').includes(sn.id))
                );

                if (network || l.layout === 'social') {
                    const provider = network?.id || l.url;
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
            const network = SOCIAL_NETWORKS.find(sn => sn.id === integration.provider);
            if (!network || seenProviders.has(network.id)) return;

            const data = integration.profile_data || {};
            const identifier = data.username || data.channel_id || data.channelId || data.display_name;

            if (identifier) {
                let url = '';
                const cleanId = String(identifier).replace('@', '');

                if (integration.provider === 'instagram') url = `https://instagram.com/${cleanId}`;
                else if (integration.provider === 'tiktok') url = `https://tiktok.com/@${cleanId}`;
                else if (integration.provider === 'twitch') url = `https://twitch.tv/${cleanId}`;
                else if (integration.provider === 'youtube') url = `https://youtube.com/${cleanId.startsWith('UC') ? 'channel/' : '@'}${cleanId}`;
                else if (integration.provider === 'kick') url = `https://kick.com/${cleanId}`;

                if (url) {
                    result.push({
                        id: `integration-${integration.provider}`,
                        title: network.name,
                        url: url,
                        isActive: true,
                        layout: 'social',
                        type: 'link',
                        platform: network.id
                    } as any);
                    seenProviders.add(network.id);
                }
            }
        });
        return result;
    }, [links, profile.integrations, currentTime]);

    // Button links - no longer filtering out 'social' layout to support dual-state
    const buttonLinks = React.useMemo(() => {
        // DEBUG: Track showCountdown for each active link
        activeLinks.forEach(l => {
            if (l.scheduleStart) {
                console.log(`🔗 Link: ${l.title} | showCountdown: ${l.showCountdown} | scheduleStart: ${l.scheduleStart}`);
            }
        });

        const manual = activeLinks;
        const integrations = profile.integrations || [];
        const result = [...manual];

        const order = ['instagram', 'youtube', 'tiktok', 'twitch', 'kick'];

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
    const youtubeIsLive = (youtubeIntegration?.profile_data as any)?.is_live;
    const youtubeChannelId = (youtubeIntegration?.profile_data as any)?.channelId;

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
        effectiveRoundness === 'round' ? 'rounded-md' :
            effectiveRoundness === 'rounder' ? 'rounded-sm' :
                effectiveRoundness === 'full' ? 'rounded-full' :
                    (currentTheme.buttonClass.match(/rounded-[^\s]+(?=\s|$)/g)?.join(' ') || null);

    const borderRadiusValue = effectiveRoundness === 'square' ? 0 :
        effectiveRoundness === 'round' ? 12 :
            effectiveRoundness === 'rounder' ? 24 :
                effectiveRoundness === 'full' ? 40 :
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
            ? `linear-gradient(135deg, ${secColor1}, ${secColor2})`
            : secColor1)
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
        // .replace(/\bbg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current)(-(none|50|100|200|300|400|500|600|700|800|900|950))?\b|\bbg-\[.*?\]\b/g, '') // REMOVED: Stripping backgrounds breaks theme designs for cards.
        .replace(/\bh-\[.*?\]\b/g, '')
        .replace(/\bmin-h-\[.*?\]\b/g, '')
        .trim() + ' cursor-target'; // Removed overflow-hidden to allow brutalist shadows to show

    // Reapply roundedness if global override exists
    if (roundedClass) {
        baseCardClass = cleanClass(baseCardClass, ['rounded']) + ` ${roundedClass}`;
    }

    // Note: We do NOT use currentTheme.cardClass anymore because it often introduces deviant colors (white/black)
    // that break the "Everything is a Button" rule.

    // Lower threshold for more aggressive light button detection (white is 1, so 0.6 is quite early)
    const isButtonLight = buttonHex ? getLuminance(buttonHex) > 0.6 : false;

    // Universal Helper for Button/Card Text Contrast
    const getSmartTextColor = React.useCallback(() => {
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
    }, [profile.customButtonTextColor, isButtonLight, isDarkTheme, profile.customBackground]);

    const smartTextColor = React.useMemo(() => getSmartTextColor(), [getSmartTextColor]);


    const mainTextColorStyle = effectiveTextColor ? { color: effectiveTextColor } : {};

    // Collection Title Style
    const effectiveCollectionTextColor = (profile.customCollectionTextColor || profile.customTextColor || currentTheme.textHex || (isDarkTheme ? '#ffffff' : '#0f172a'));
    const collectionTextColorStyle = effectiveCollectionTextColor ? { color: effectiveCollectionTextColor } : {};

    const textClass = currentTheme.textClass;




    return (
        <div
            ref={portalTargetRef}
            className={`relative w-full ${isPreview ? 'h-full flex-1' : 'min-h-[100dvh]'} flex flex-col isolate`}
            style={{ fontFamily: profile.fontFamily }}
        >
            {/* Performance: CSS global inserted ONCE via a memoized tag — avoids re-creating style rules on every render */}
            {profileGlobalStyles}
            <style>{`
                img {
                    transition: opacity 0.5s ease-in-out;
                    opacity: 0;
                }
                img[src] {
                    opacity: 1;
                }
                /* Ensure images without src or during load have a background */
                .img-placeholder {
                    background: rgba(0,0,0,0.05);
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}</style>
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

                {profile.headerLayout === 'banner' && (
                    <div className="relative w-full h-[62vh] min-h-[380px] shrink-0 overflow-visible">
                        {/* Image wrapper with mask to reveal BackgroundLayer blur */}
                        <div
                            className="absolute inset-0"
                            style={{
                                maskImage: 'radial-gradient(170% 100% at 50% 0%, black 0%, black 75%, transparent 100%)',
                                WebkitMaskImage: 'radial-gradient(170% 100% at 50% 0%, black 0%, black 75%, transparent 100%)'
                            }}
                        >
                            {/* The single full-space Banner Image - Raw source for reliability */}
                            <img src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Nodus'}`}
                                alt={profile.name}
                                className="w-full h-full object-cover object-center opacity-100"
                                loading="eager"
                                decoding="async"
                                {...({ fetchpriority: "high" } as any)}
                            />

                            {/* Noise/Grain Overlay for "Premium" look */}
                            <div
                                className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                                }}
                            />
                        </div>

                        {/* Content Overlaid at Bottom (Fixed Visibility) */}
                        <div className="absolute bottom-0 left-0 w-full px-8 pt-6 pb-0 z-[100] flex flex-col items-center text-center">

                            {/* 1. Name */}
                            <h3
                                className="text-[2.2em] mb-0 tracking-tight flex items-center gap-2 drop-shadow-xl"
                                style={{
                                    fontFamily: effectiveFontFamily,
                                    color: '#FFFFFF',
                                    fontWeight: profile.fontWeight || '500'
                                }}
                            >
                                {profile.name}
                                {profile.isVerified && (
                                    <img src={verifiedBadge} alt="Verified" className="w-[0.85em] h-[0.85em] shrink-0" loading="lazy" decoding="async" />
                                )}
                            </h3>


                            {/* 3. Bio Text (Moved up and Bold) */}
                            {profile.bio && (
                                <p
                                    className="text-white max-w-[340px] leading-relaxed drop-shadow-lg mb-1 opacity-90"
                                    style={{
                                        fontSize: profile.bioFontSize ? `${profile.bioFontSize}px` : undefined,
                                        color: '#FFFFFF',
                                        fontWeight: profile.fontWeight || '400'
                                    }}
                                >
                                    {profile.bio}
                                </p>
                            )}

                            {/* Social Icons (NOW BELOW BIO) */}
                            {socialLinks.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-6 mt-2 relative z-[100]">
                                    {socialLinks.map(link => {
                                        const lowerUrl = (link.url || '').toLowerCase();
                                        const lowerTitle = (link.title || '').toLowerCase();
                                        const network = SOCIAL_NETWORKS.find(n =>
                                            lowerTitle.includes(n.id) ||
                                            lowerUrl.includes(n.id) ||
                                            (n.id === 'twitter' && lowerUrl.includes('x.com'))
                                        ) || SOCIAL_NETWORKS[0];
                                        const Icon = network.icon || Globe;
                                        return (
                                            <a
                                                key={`banner-social-${link.id}`}
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={() => handleLinkClick(link.id)}
                                                className="text-white hover:scale-110 active:scale-95 transition-all drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                                                style={{ color: '#FFFFFF' }}
                                            >
                                                <Icon size={22} />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}



                <div className="absolute top-4 right-6 z-30">
                    <InteractiveButton strength={10} tiltStrength={5}>
                        <button
                            onClick={onShare}
                            className="w-10 h-10 flex items-center justify-center bg-white/50 text-slate-900 rounded-full shadow-md border border-white/20 active:scale-95 transition-all"
                        >
                            <Share size={18} />
                        </button>
                    </InteractiveButton>
                </div>
                {/* Menu / Options Button (Adjusted for Banner/Perfil) - Now an expanding "Crie seu Nodus" CTA with Auto-Expansion */}
                {(() => {
                    const [isAutoExpanded, setIsAutoExpanded] = React.useState(false);
                    React.useEffect(() => {
                        // Expand after a short delay to grab attention and STAY expanded
                        const expandTimer = setTimeout(() => setIsAutoExpanded(true), 1500);
                        return () => clearTimeout(expandTimer);
                    }, []);

                    return (
                        <div className="absolute top-4 left-6 z-[60] pointer-events-auto">
                            <motion.a
                                href="https://www.nodus.my/login"
                                target="_blank"
                                rel="noopener noreferrer"
                                animate={{ width: isAutoExpanded ? 200 : 40 }}
                                whileHover={{ width: 200 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                className="h-10 flex items-center bg-white/50 rounded-full shadow-md overflow-hidden cursor-pointer group whitespace-nowrap border border-white/20 pointer-events-auto z-[50] cursor-target relative isolate"
                                style={{ display: 'flex', position: 'relative' }}
                            >
                                <div className="w-10 h-10 flex items-center justify-center shrink-0 p-[6px]">
                                    <video
                                        src="/icons/Anime_mascot_fixed_white_background_delpmaspu_.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover rounded-full mix-blend-multiply"
                                    />
                                </div>
                                <motion.span
                                    animate={{ opacity: isAutoExpanded ? 1 : 0 }}
                                    className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 pr-6 group-hover:opacity-100 transition-opacity duration-300 flex-1 text-center"
                                >
                                    {isPT ? 'Crie seu nodus' : 'Create your nodus'}
                                </motion.span>
                            </motion.a>
                        </div>
                    );
                })()}



                <div
                    className={`px-6 flex flex-col relative flex-1 ${profile.headerLayout === 'banner' ? 'pt-12 pb-2' : (profile.headerLayout === 'compact' ? 'pt-0 pb-4' : (isPreview ? 'pt-16 pb-0' : 'pt-[72px] pb-0'))}`}
                    style={profile.headerLayout === 'banner' ? {
                        minHeight: '250px'
                    } : {}}
                >

                    {/* Compact/Social Header Banner - Full Width & Clean */}
                    {profile.headerLayout === 'compact' && (
                        <>
                            <div
                                className="absolute top-0 -left-6 w-[calc(100%+3rem)] h-[230px] z-[15] overflow-hidden"
                                style={{
                                    background: headerContentBg !== 'transparent' ? headerContentBg : (isDarkTheme ? '#0f172a' : '#ffffff')
                                }}
                            >
                                {profile.customBackground ? (
                                    <img src={profile.customBackground} alt="" className="w-full h-full object-cover" loading="eager" decoding="async" />
                                ) : (
                                    <div className="w-full h-full opacity-10" style={{ background: currentTheme.buttonHex || '#000' }} />
                                )}
                            </div>
                            {/* Curved Intelligent Backdrop for Social Layout */}
                            <div
                                className="absolute top-[198px] left-0 w-full bottom-0 z-[16] overflow-hidden"
                                style={{
                                    background: headerContentBg !== 'transparent' ? headerContentBg : (isDarkTheme ? '#0f172a' : '#ffffff'),
                                    borderRadius: '100% 100% 0 0 / 50px 50px 0 0',
                                    transform: 'scaleX(1.15)'
                                }}
                            />
                        </>
                    )}

                    {/* Profile Section - Shared for other layouts */}
                    {profile.headerLayout !== 'banner' && (
                        <motion.div
                            className={`w-full mb-1 flex flex-col items-center text-center relative z-[30] ${profile.headerLayout === 'compact' ? 'mt-[198px] pt-0 pb-1 px-4' : ''}`}
                        >
                            {/* Avatar */}
                            {profile.avatarUrl && (
                                <div className={`relative group shrink-0 ${profile.headerLayout === 'compact' ? '-mt-[56px] mb-4 z-20' : 'mb-4'}`}>
                                    <div className={`overflow-hidden rounded-full ${profile.headerLayout === 'compact'
                                        ? 'w-[110px] h-[110px] border-[6px]'
                                        : `shadow-xl ${currentTheme.avatarBorder.replace(/\brounded-[^\s]+\b/g, '')} ${profile.avatarSize === 'sm' ? 'w-20 h-20' :
                                            profile.avatarSize === 'lg' ? 'w-32 h-32' :
                                                'w-24 h-24'
                                        }`
                                        }`}
                                        style={profile.headerLayout === 'compact' ? {
                                            borderColor: headerContentBg !== 'transparent' ? headerContentBg : (isDarkTheme ? '#0f172a' : '#ffffff'),
                                            backgroundColor: headerContentBg !== 'transparent' ? headerContentBg : (isDarkTheme ? '#0f172a' : '#ffffff')
                                        } : undefined}
                                    >
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className={`w-full h-full object-cover rounded-full`}
                                            loading="eager"
                                            decoding="async"
                                            {...({ fetchpriority: "high" } as any)}
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
                                            fontSize: profile.bioFontSize ? `${profile.bioFontSize}px` : undefined,
                                            fontWeight: profile.fontWeight || '400'
                                        }}
                                    >
                                        {profile.bio}
                                    </p>
                                )}
                            </div>

                            {/* Social Icons (BELOW BIO) */}
                            {socialLinks.length > 0 && (
                                <div className={`w-full overflow-hidden mt-3 mb-1 relative ${socialLinks.length > 5 ? 'social-marquee-mask' : ''}`}>
                                    <div
                                        className={`flex items-center gap-3 px-4 ${socialLinks.length > 5 ? 'animate-social-marquee' : 'justify-center flex-wrap'}`}
                                        style={{ '--duration': `${socialLinks.length * 3}s` } as any}
                                    >
                                        {socialLinks.map((link, idx) => {
                                            const network = SOCIAL_NETWORKS.find(n => n.id === link.platform) ||
                                                SOCIAL_NETWORKS.find(n => (link.title || '').toLowerCase().includes(n.id)) ||
                                                SOCIAL_NETWORKS.find(n => link.url.toLowerCase().includes(n.id)) ||
                                                SOCIAL_NETWORKS[0];
                                            const Icon = network.icon || Globe;
                                            return (
                                                <a
                                                    key={`classic-social-${link.id}`}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => handleLinkClick(link.id)}
                                                    className="hover:scale-110 active:scale-95 transition-all p-1"
                                                    style={{ color: getSmartTextColor() || (isDarkTheme ? '#ffffff' : '#0f172a') }}
                                                >
                                                    <Icon size={24} />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                    {/* TABS (Links / Shop) - Only if active stores exist */}
                    {stores && stores.some(s => s.isActive !== false) && (
                        <div className="w-full mb-3 px-1 flex justify-center">
                            <div className={`w-auto min-w-[200px] p-2 ${roundedClass || 'rounded-full'} flex relative transition-colors ${isDarkTheme ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/5'}`}>
                                {(() => {
                                    const cleanTabButtonClass = buttonClass
                                        .replace(/\b(py-[^ ]+|px-[^ ]+|p-[^ ]+|w-full|flex|items-center|justify-between|justify-center|shadow-[^ ]+|translate-y-[^ ]+)\b/g, '')
                                        .trim();

                                    return (
                                        <>
                                            <button
                                                onClick={() => setActiveTab('links')}
                                                className={`flex-1 py-1 px-6 ${roundedClass || 'rounded-full'} text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'links'
                                                    ? `${cleanTabButtonClass} z-10 shadow-sm opacity-100`
                                                    : 'opacity-40 hover:opacity-100'
                                                    }`}
                                                style={{
                                                    ...(activeTab === 'links' ? mainButtonStyle : mainTextColorStyle),
                                                    transform: 'none',
                                                    boxShadow: 'none',
                                                    fontWeight: profile.fontWeight || '900',
                                                    color: activeTab === 'links' ? getSmartTextColor() : (mainTextColorStyle.color || (isDarkTheme ? '#ffffff' : '#0f172a'))
                                                }}
                                            >
                                                Links
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('shop')}
                                                className={`flex-1 py-1 px-6 ${roundedClass || 'rounded-full'} text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'shop'
                                                    ? `${cleanTabButtonClass} z-10 shadow-sm opacity-100`
                                                    : 'opacity-40 hover:opacity-100'
                                                    }`}
                                                style={{
                                                    ...(activeTab === 'shop' ? mainButtonStyle : mainTextColorStyle),
                                                    transform: 'none',
                                                    boxShadow: 'none',
                                                    fontWeight: profile.fontWeight || '900',
                                                    color: activeTab === 'shop' ? getSmartTextColor() : (mainTextColorStyle.color || (isDarkTheme ? '#ffffff' : '#0f172a'))
                                                }}
                                            >
                                                Loja
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}


                    {/* Main Dynamic Content Area */}
                    <div className="flex flex-col w-full relative">
                        {(() => {
                            const renderStoreProduct = (product: Product) => {
                                if (product.isActive === false) return null;
                                return (
                                    <InteractiveButton key={product.id} className="w-full">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedProduct(product);
                                            }}
                                            className={`group/item flex items-center h-[88px] px-4 gap-4 transition-all duration-300 ${buttonClass} shadow-sm hover:translate-y-[-2px]`}
                                            style={{ ...mainButtonStyle, width: '100%', borderRadius: borderRadiusValue }}
                                        >
                                            <div className="relative w-16 h-16 shrink-0 rounded-sm overflow-hidden border border-black/5 bg-white">
                                                <img src={product.image} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                                {product.discountCode && (
                                                    <div className="absolute top-0 left-0 bg-[#ffdf00] text-black text-[8px] font-black px-2 py-0.5 rounded-br shadow-sm z-10 flex items-center gap-1">
                                                        <TagIcon size={8} strokeWidth={4} />
                                                        {product.discountCode}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col items-start text-left">
                                                <h4 className="text-[14px] font-black uppercase tracking-tight truncate w-full" style={{ color: getSmartTextColor() }}>{product.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-black opacity-40 uppercase tracking-widest" style={{ color: getSmartTextColor() }}>
                                                        {(() => {
                                                            const clean = String(product.price || '').replace(/[^\d,.]/g, '').replace(',', '.');
                                                            const val = parseFloat(clean);
                                                            if (isNaN(val)) return '';
                                                            return new Intl.NumberFormat(isPT ? 'pt-BR' : 'en-US', {
                                                                style: 'currency',
                                                                currency: isPT ? 'BRL' : 'USD'
                                                            }).format(val);
                                                        })()}
                                                    </span>
                                                    {product.discountCode && (
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 border border-dashed border-[#97cd7a]/50 text-[#97cd7a] rounded text-[9px] font-black uppercase tracking-wider">
                                                            <TagIcon size={10} strokeWidth={3} />
                                                            {product.discountCode}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`w-10 h-10 rounded-full ${isDarkTheme ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center opacity-40 group-hover/item:opacity-100 transition-opacity`}>
                                                <ShoppingCart size={18} style={{ color: getSmartTextColor() }} />
                                            </div>
                                        </button>
                                    </InteractiveButton>
                                );
                            };

                            return (
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {/* SHOP VIEW (Collections or Grid) */}
                                    {products.length > 0 && activeTab === 'shop' && (
                                        <motion.div
                                            key="shop-tab"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0 }}
                                            className="w-full space-y-4 flex-1 z-[30] relative"
                                        >

                                            {/* Consolidated Store Card View with Accordion Expansion */}
                                            {!activeCollection ? (
                                                <div className="space-y-6">
                                                    {stores.filter(s => s.isActive !== false).map(store => {
                                                        const storeProducts = products.filter(p => p.storeId === store.id && p.isActive !== false);
                                                        const storeColsList = Array.from(new Set([
                                                            ...(store.collections || []),
                                                            ...storeProducts.map(p => p.collection).filter(Boolean) as string[]
                                                        ])).filter(c => !(store.disabledCollections || []).includes(c));

                                                        const storeCols = storeColsList.map(c => ({
                                                            name: c,
                                                            items: storeProducts.filter(p => p.collection === c)
                                                        }));

                                                        if (storeProducts.length === 0 && storeCols.length === 0) return null;

                                                        return (
                                                            <div key={store.id} className="space-y-4">
                                                                <InteractiveButton
                                                                    className="w-full"
                                                                    onClick={() => {
                                                                        handleCollectionClick(store.name);
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={`w-full group relative transition-all duration-300 ${cleanClass(baseCardClass, ['bg', 'text']).replace('overflow-hidden', '')}`}
                                                                        style={{
                                                                            ...mainButtonStyle,
                                                                            color: getSmartTextColor(),
                                                                            ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art') ? { overflow: 'visible' } : { overflow: 'hidden' })
                                                                        }}
                                                                    >
                                                                        <div className={`flex flex-col w-full h-full overflow-hidden ${roundedClass}`}>
                                                                            {/* Store Branding Inside Card */}
                                                                            <div className={`px-4 pt-4 pb-2 flex items-center justify-center gap-2 opacity-60 ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
                                                                                {store.imageUrl ? (
                                                                                    <img src={store.imageUrl} className="w-4 h-4 rounded-sm object-cover" />
                                                                                ) : (
                                                                                    <ShoppingBag size={14} className="stroke-[2.5]" />
                                                                                )}
                                                                                <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: effectiveFontFamily, fontWeight: profile.fontWeight || '900' }}>{store.name}</span>
                                                                            </div>

                                                                            {/* Big Collage of Store Products */}
                                                                            <div className={`flex h-56 w-full gap-1 p-1 ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
                                                                                {storeProducts.length === 1 ? (
                                                                                    <div className="flex-1 h-full relative overflow-hidden rounded-md">
                                                                                        <img src={storeProducts[0].image} alt={storeProducts[0].name} className="w-full h-full block object-cover transition-transform duration-700" loading="lazy" decoding="async" />
                                                                                        <div className="absolute inset-0 bg-black/5" />
                                                                                    </div>
                                                                                ) : storeProducts.length > 0 ? (
                                                                                    <>
                                                                                        <div className="flex-[2] h-full relative overflow-hidden rounded-l-xl">
                                                                                            <img src={storeProducts[0].image} alt={storeProducts[0].name} className="w-full h-full block object-cover transition-transform duration-700" loading="lazy" decoding="async" />
                                                                                        </div>
                                                                                        <div className="flex-1 flex flex-col gap-1">
                                                                                            {storeProducts.slice(1, 4).map((item, i) => (
                                                                                                <div key={item.id} className={`flex-1 relative overflow-hidden ${(i === 1 && storeProducts.length > 2) || (i === 0 && storeProducts.length === 2) ? 'rounded-br-xl' : ''} ${(i === 0 && storeProducts.length > 2) || (i === 0 && storeProducts.length === 2) ? 'rounded-tr-xl' : ''}`}>
                                                                                                    <img src={item.image} alt={item.name} className="w-full h-full block object-cover" loading="lazy" decoding="async" />
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="flex-1 h-full bg-black/5 flex items-center justify-center text-black/10 rounded-md">
                                                                                        <ShoppingBag size={48} />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {/* Footer Call to Action */}
                                                                            <div className={`px-4 py-3 flex items-center justify-between border-t border-black/5 transition-colors group-hover:bg-black/5 ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
                                                                                <span className="text-[11px] uppercase tracking-[0.2em] opacity-60" style={{ fontFamily: effectiveFontFamily, color: getSmartTextColor(), fontWeight: profile.fontWeight || '900' }}>
                                                                                    {isPT ? 'PRODUTOS' : 'PRODUCTS'}
                                                                                </span>
                                                                                <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" style={{ color: getSmartTextColor() }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </InteractiveButton>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                /* Dedicated View for Selected Store/Collection */
                                                <div className="space-y-4">
                                                    {/* Header with Back Button */}
                                                    <div className="flex items-center gap-4 px-2">
                                                        <InteractiveButton strength={15}>
                                                            <button
                                                                onClick={() => setActiveCollection(null)}
                                                                className={`w-10 h-10 flex items-center justify-center transition-all bg-white/50 rounded-full shadow-md border border-white/20`}
                                                                style={{
                                                                    ...mainButtonStyle,
                                                                    borderRadius: borderRadiusValue,
                                                                    padding: 0 // Ensure it stays a square/circle even if buttonClass has padding
                                                                }}
                                                            >
                                                                <ChevronLeft size={20} style={{ color: getSmartTextColor() }} />
                                                            </button>
                                                        </InteractiveButton>
                                                        <div className="flex flex-col">
                                                            <h2 className="text-sm uppercase tracking-[0.2em] opacity-40 leading-none mb-1" style={{ color: getSmartTextColor(), fontWeight: profile.fontWeight || '900' }}>{isPT ? 'COLEÇÃO' : 'COLLECTION'}</h2>
                                                            <h3 className="text-xl uppercase tracking-tight leading-none" style={{ color: getSmartTextColor(), fontWeight: profile.fontWeight || '900' }}>{activeCollection}</h3>
                                                        </div>
                                                    </div>

                                                    {/* Products Grid with Collection Grouping */}
                                                    <div className="space-y-8">
                                                        {(() => {
                                                            const storeProducts = (collections[activeCollection] || []).filter(p => !p.isArchived && p.isActive !== false);
                                                            const uncat = storeProducts.filter(p => !p.collection);
                                                            const store = stores.find(s => s.name === activeCollection);

                                                            // Get unique collection names present in these products
                                                            const productCols = Array.from(new Set(storeProducts.map(p => p.collection).filter(Boolean))) as string[];

                                                            // Also consider empty collections defined in the store, but exclude disabled ones
                                                            const allColNames = Array.from(new Set([...productCols, ...(store?.collections || [])]))
                                                                .filter(c => !(store?.disabledCollections || []).includes(c));

                                                            return (
                                                                <>
                                                                    {/* Uncategorized Products First */}
                                                                    {uncat.length > 0 && (
                                                                        <div className="grid grid-cols-1 gap-4">
                                                                            {uncat.map(product => renderStoreProduct(product))}
                                                                        </div>
                                                                    )}

                                                                    {/* Grouped Products by Collection */}
                                                                    {allColNames.map(colName => {
                                                                        const colItems = storeProducts.filter(p => p.collection === colName);
                                                                        if (colItems.length === 0) return null;

                                                                        return (
                                                                            <div key={colName} className="space-y-4">
                                                                                <div className="px-2 flex items-center gap-3">
                                                                                    <div className="h-[2px] flex-1 bg-black/5" />
                                                                                    <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-30 whitespace-nowrap" style={{ color: getSmartTextColor(), fontWeight: profile.fontWeight || '900' }}>{colName}</h4>
                                                                                    <div className="h-[2px] flex-1 bg-black/5" />
                                                                                </div>
                                                                                <div className="grid grid-cols-1 gap-4">
                                                                                    {colItems.map(product => renderStoreProduct(product))}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </>
                                                            );
                                                        })()}
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
                                            className="flex flex-col gap-4 w-full relative flex-1 z-[30]"
                                        >
                                            {(() => {
                                                const renderedItems: React.ReactNode[] = [];

                                                // We no longer inject here at the top.
                                                // It will be rendered at its position in the loop below.

                                                const themeButtonHex = currentTheme.buttonHex || ((isDarkTheme || currentTheme.id === 'glass') ? '#ffffff' : '#ffffff');
                                                const cardAccentColor = themeButtonHex;
                                                const cardTextColor = (isDarkTheme || currentTheme.id === 'glass' ? '#ffffff' : '#1a1a1a');

                                                let currentIconGroup: LinkItem[] = [];
                                                let currentCardGroup: LinkItem[] = [];

                                                const flushIcons = () => {
                                                    if (currentIconGroup.length > 0) {
                                                        const group = [...currentIconGroup];
                                                        renderedItems.push(
                                                            <div key={`social-row-${group[0].id}`} className="flex items-center justify-center gap-3 w-full flex-wrap relative">
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
                                                                            <div className={`absolute inset-0 -m-2 opacity-10 rounded-full ${currentTheme.id.includes('dark') ? 'bg-white' : 'bg-[#1a1a1a]'}`}></div>

                                                                            <div className="relative z-10 p-1">
                                                                                {iconLink.image ? (
                                                                                    <img
                                                                                        src={iconLink.image}
                                                                                        alt=""
                                                                                        className="w-8 h-8 rounded-sm object-cover"
                                                                                        loading="lazy"
                                                                                        decoding="async"
                                                                                        onError={(e) => {
                                                                                            e.currentTarget.onerror = null;
                                                                                            e.currentTarget.style.display = 'none';
                                                                                            e.currentTarget.className = "w-8 h-8 rounded-sm object-contain p-1.5 opacity-30 bg-white/10";
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
                                                            <div key={`card-grid-${group[0].id}`} className="flex flex-col gap-4 w-full">
                                                                {group.map((cardLink) => {
                                                                    // Resolve the effective button background color explicitly
                                                                    const cardBgColor = (isCustomTheme && profile.customButtonColor)
                                                                        ? profile.customButtonColor
                                                                        : (buttonHex || currentTheme.buttonHex || '#ffffff');
                                                                    const smartText = getSmartTextColor();
                                                                    const separatorColor = smartText ? `${smartText}25` : (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');

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
                                                                                style={{
                                                                                    backgroundColor: cardBgColor,
                                                                                    borderRadius: borderRadiusValue,
                                                                                    overflow: 'hidden',
                                                                                }}
                                                                                className={`group relative transition-all duration-300 w-full flex flex-col ${cleanClass(baseCardClass, ['bg'])} ${getHighlightClass(cardLink.highlight)} cursor-pointer`}
                                                                            >
                                                                                {/* Image Area */}
                                                                                <div className="relative overflow-hidden h-44 md:h-52 w-full flex-shrink-0">
                                                                                    {cardLink.image ? (
                                                                                        <img
                                                                                            src={cardLink.image}
                                                                                            alt=""
                                                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                                            loading="lazy"
                                                                                            decoding="async"
                                                                                            onError={(e) => {
                                                                                                e.currentTarget.onerror = null;
                                                                                                e.currentTarget.style.display = 'none';
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center" style={{ color: smartText, opacity: 0.15 }}>
                                                                                            <Globe size={40} />
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {/* Footer — same bg as button, correct text color */}
                                                                                <div
                                                                                    className="p-3.5 flex flex-col justify-center items-center text-center w-full flex-shrink-0"
                                                                                    style={{
                                                                                        borderTop: `1px solid ${separatorColor}`,
                                                                                        minHeight: '56px',
                                                                                    }}
                                                                                >
                                                                                    {isMusicLink(cardLink) && (
                                                                                        <div className="mb-1 opacity-60">
                                                                                            {cardLink.url.includes('deezer') ? (
                                                                                                <DeezerIcon size={10} color={smartText} />
                                                                                            ) : (
                                                                                                <SiSpotify size={10} color={isButtonLight ? "#1a2c14" : "#1DB954"} />
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                    <span
                                                                                        className="text-[15px] leading-tight truncate w-full uppercase tracking-tight"
                                                                                        style={{
                                                                                            color: smartText,
                                                                                            fontWeight: (profile.fontWeight || '700'),
                                                                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                                                                            fontFamily: effectiveFontFamily,
                                                                                        }}
                                                                                    >{cardLink.title}</span>
                                                                                    {cardLink.subtitle && (
                                                                                        <span
                                                                                            className="text-[11px] leading-tight truncate w-full mt-1"
                                                                                            style={{
                                                                                                color: smartText,
                                                                                                opacity: 0.6,
                                                                                                fontFamily: effectiveFontFamily,
                                                                                            }}
                                                                                        >{cardLink.subtitle}</span>
                                                                                    )}
                                                                                </div>
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
                                                    // Countdown Mode: Scheduled for future + showCountdown enabled
                                                    const isCountdownActive = link.showCountdown && link.scheduleStart && new Date(link.scheduleStart) > currentTime;

                                                    if (isCountdownActive) {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <div key={`countdown-${link.id}`} className="w-full">
                                                                <InteractiveButton className="w-full">
                                                                    <div
                                                                        className={`w-full ${buttonClass} flex flex-col items-center justify-center overflow-hidden transition-all duration-300`}
                                                                        style={{ ...mainButtonStyle, borderRadius: borderRadiusValue, minHeight: '100px' }}
                                                                    >
                                                                        <LinkCountdown
                                                                            targetDate={link.scheduleStart!}
                                                                            title={link.title}
                                                                            onZero={() => {
                                                                                setCurrentTime(new Date());
                                                                            }}
                                                                            fontFamily={effectiveFontFamily}
                                                                            style={{ color: getSmartTextColor() }}
                                                                        />
                                                                    </div>
                                                                </InteractiveButton>
                                                            </div>
                                                        );
                                                        return;
                                                    }

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
                                                            <InteractiveButton key={`instagram-card-${link.id}`} className="w-full">
                                                                <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-1' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
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
                                                            <InteractiveButton key={`instagram-profile-card-${link.id}`} className="w-full">
                                                                <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-1' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                                    <InstagramCard username={instagramUsername || 'instagram_user'} followers={instagramFollowers || 0} avatarUrl={instagramAvatar || ''} media={instagramMedia} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} variant={link.layout === 'classic' ? 'profile' : 'feed'} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                </motion.div>
                                                            </InteractiveButton>
                                                        );
                                                    } else if (youtubeIntegration && (link.platform === 'youtube' || (link.url.includes('youtube.com') && !link.url.includes('watch?v=') && !link.url.includes('/shorts/')))) {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <InteractiveButton key={`youtube-card-${link.id}`} className="w-full">
                                                                <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-1' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                                    <YouTubeCard username={youtubeUsername || link.url} title={youtubeTitle || link.title} subscribers={youtubeSubscribers || 0} avatarUrl={youtubeAvatar || ''} isLive={youtubeIsLive} channelId={youtubeChannelId} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                </motion.div>
                                                            </InteractiveButton>
                                                        );
                                                    } else if (twitchIntegration && (link.platform === 'twitch' || link.title.toLowerCase().includes('twitch'))) {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <InteractiveButton key={`twitch-card-${link.id}`} className="w-full">
                                                                <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-1' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                                    <TwitchCard username={twitchUsername || 'twitch_user'} displayName={twitchDisplayName || 'Twitch User'} followers={twitchFollowers || 0} avatarUrl={twitchAvatar || ''} isLive={twitchIsLive} streamTitle={twitchStreamTitle} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                </motion.div>
                                                            </InteractiveButton>
                                                        );
                                                    } else if (kickIntegration && (link.platform === 'kick' || link.title.toLowerCase().includes('kick'))) {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <InteractiveButton key={`kick-card-${link.id}`} className="w-full">
                                                                <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-1' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
                                                                    <KickCard username={kickUsername || 'kick_user'} displayName={kickDisplayName || 'Kick User'} followers={kickFollowers || 0} avatarUrl={kickAvatar || ''} isLive={kickIsLive} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
                                                                </motion.div>
                                                            </InteractiveButton>
                                                        );
                                                    } else if (link.type === 'agenda') {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <InteractiveButton key={`agenda-${link.id}`} className="w-full">
                                                                <motion.div transition={{ duration: 0 }} className={`w-full ${renderedItems.length === 0 ? 'mt-1' : 'mt-0'} ${getHighlightClass(link.highlight)}`}>
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
                                                                        isPreview={isPreview}
                                                                        portalTarget={portalTargetRef.current}
                                                                    />
                                                                </motion.div>
                                                            </InteractiveButton>
                                                        );
                                                    } else if (link.type === 'incentives' && (profile.plan_type === 'monthly' || profile.plan_type === 'annual')) {
                                                        flushIcons();
                                                        flushCards();
                                                        const activeMethods = profile.paymentMethods?.filter(pm => pm.isActive !== false) || [];
                                                        if (activeMethods.length > 0) {
                                                            const isExpanded = expandedIncentive === link.id;
                                                            renderedItems.push(
                                                                <div key={`incentive-wrapper-${link.id}`} className="flex flex-col gap-2 w-full">
                                                                    <InteractiveButton className="w-full" glowColor={`${getSmartTextColor()}33`}>
                                                                        <motion.button
                                                                            whileTap={{ scale: 0.98 }}
                                                                            onClick={() => {
                                                                                if (activeMethods.length === 1) {
                                                                                    const method = activeMethods[0];
                                                                                    if (method.type === 'paypal') {
                                                                                        window.open(method.key.startsWith('http') ? method.key : `https://${method.key}`, '_blank');
                                                                                    } else {
                                                                                        navigator.clipboard.writeText(method.key);
                                                                                        alert('Chave Pix copiada!');
                                                                                    }
                                                                                } else {
                                                                                    setExpandedIncentive(isExpanded ? null : link.id);
                                                                                }
                                                                            }}
                                                                            className={`relative w-full h-[72px] transition-all duration-300 group flex items-center ${buttonClass} cursor-pointer`}
                                                                            style={{
                                                                                ...mainButtonStyle,
                                                                                color: getSmartTextColor(),
                                                                                borderRadius: borderRadiusValue,
                                                                                ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art' || currentTheme.id === 'technology-holo' || currentTheme.id === 'technology-neural') ? { overflow: 'visible' } : { overflow: 'hidden' })
                                                                            }}
                                                                        >
                                                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                            <div className="relative z-10 flex items-center gap-3 w-full px-6">
                                                                                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                                                                    {activeMethods[0].type === 'pix' ? (
                                                                                        <img src="/icons/pix-svgrepo-com.svg" className="w-7 h-7 opacity-90" style={{ filter: getSmartTextColor() === '#ffffff' ? 'invert(1) brightness(2)' : 'none' }} alt="Pix" />
                                                                                    ) : (
                                                                                        <SiPaypal size={24} className="opacity-90" />
                                                                                    )}
                                                                                </div>
                                                                                <span className="font-bold text-[15px] uppercase tracking-tight flex-1 text-center">
                                                                                    {link.title || 'Incentivos'}
                                                                                </span>
                                                                                <div className="w-9 shrink-0 flex items-center justify-center opacity-40">
                                                                                    {activeMethods.length > 1 && (
                                                                                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                                                                            <ChevronDown size={20} strokeWidth={3} />
                                                                                        </motion.div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </motion.button>
                                                                    </InteractiveButton>

                                                                    <AnimatePresence>
                                                                        {isExpanded && activeMethods.length > 1 && (
                                                                            <motion.div
                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                className="overflow-hidden flex flex-col gap-2 pt-1"
                                                                            >
                                                                                {activeMethods.map(method => (
                                                                                    <InteractiveButton key={method.id} className="w-full">
                                                                                        <motion.button
                                                                                            whileTap={{ scale: 0.98 }}
                                                                                            onClick={() => {
                                                                                                if (method.type === 'paypal') {
                                                                                                    window.open(method.key.startsWith('http') ? method.key : `https://${method.key}`, '_blank');
                                                                                                } else {
                                                                                                    navigator.clipboard.writeText(method.key);
                                                                                                    alert('Chave Pix copiada!');
                                                                                                }
                                                                                            }}
                                                                                            className={`relative w-full h-[64px] transition-all duration-300 group flex items-center ${buttonClass} cursor-pointer opacity-90 hover:opacity-100`}
                                                                                            style={{
                                                                                                ...mainButtonStyle,
                                                                                                backgroundColor: `${mainButtonStyle?.backgroundColor || '#ffffff'}ee`,
                                                                                                color: getSmartTextColor(),
                                                                                                borderRadius: borderRadiusValue,
                                                                                                borderWidth: '1px',
                                                                                                boxShadow: 'none'
                                                                                            }}
                                                                                        >
                                                                                            <div className="relative z-10 flex items-center gap-3 w-full px-6">
                                                                                                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                                                                                    {method.type === 'pix' ? (
                                                                                                        <img src="/icons/pix-svgrepo-com.svg" className="w-6 h-6 opacity-80" style={{ filter: getSmartTextColor() === '#ffffff' ? 'invert(1) brightness(2)' : 'none' }} alt="Pix" />
                                                                                                    ) : (
                                                                                                        <SiPaypal size={20} className="opacity-80" />
                                                                                                    )}
                                                                                                </div>
                                                                                                <span className="font-bold text-[13px] uppercase tracking-tight flex-1 text-center pr-8">
                                                                                                    {method.label || (method.type === 'pix' ? 'Copiar Chave Pix' : 'Abrir PayPal')}
                                                                                                </span>
                                                                                            </div>
                                                                                        </motion.button>
                                                                                    </InteractiveButton>
                                                                                ))}
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            );
                                                        }
                                                    } else if (link.type === 'header') {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(<motion.div key={`header-${link.id}`} transition={{ duration: 0 }} className="w-full text-center py-1 opacity-80" style={{ ...mainTextColorStyle, fontWeight: 'bold', fontSize: '1.1em', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{link.title}</motion.div>);
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
                                                                <motion.div key={link.id} transition={{ duration: 0 }} className={`w-full pt-1 pb-1 group/carousel ${renderedItems.length === 0 ? 'mt-1' : 'mt-0'}`}>
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
                                                                <motion.div key={link.id} transition={{ duration: 0 }} className={`w-full pt-1 pb-1 ${renderedItems.length === 0 ? 'mt-1' : 'mt-0'}`}>
                                                                    {link.title && (
                                                                        <div className="text-center mb-2 px-4 flex flex-col items-center gap-1.5 pt-2">
                                                                            <div className="opacity-90 text-sm font-normal uppercase tracking-widest" style={{ ...collectionTextColorStyle, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>{link.title}</div>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-col gap-4 relative">
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
                                                                                                <MusicRichCard
                                                                                                    link={child}
                                                                                                    handleLinkClick={handleLinkClick}
                                                                                                    baseCardClass={baseCardClass}
                                                                                                    mainButtonStyle={mainButtonStyle}
                                                                                                    effectiveFontFamily={effectiveFontFamily}
                                                                                                    profile={profile}
                                                                                                    getSmartTextColor={getSmartTextColor}
                                                                                                    getHighlightClass={getHighlightClass}
                                                                                                    setOpenPlaylist={setOpenPlaylist}
                                                                                                />
                                                                                            </div>
                                                                                        </InteractiveButton>
                                                                                    );
                                                                                } else if (child.embedType === 'youtube') {
                                                                                    nestedItems.push(
                                                                                        <InteractiveButton key={child.id} className="w-full">
                                                                                            <div className={getHighlightClass(child.highlight)}>
                                                                                                <YouTubeEmbed url={child.url} title={child.title} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} />
                                                                                            </div>
                                                                                        </InteractiveButton>
                                                                                    );
                                                                                } else if (child.embedType === 'tiktok') {
                                                                                    nestedItems.push(
                                                                                        <InteractiveButton key={child.id} className="w-full">
                                                                                            <div className={getHighlightClass(child.highlight)}>
                                                                                                <TikTokEmbed url={child.url} title={child.title} videoUrl={child.videoUrl} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} />
                                                                                            </div>
                                                                                        </InteractiveButton>
                                                                                    );
                                                                                } else {
                                                                                    // Check Integrations for children
                                                                                    let renderedSpecial = false;
                                                                                    if (instagramIntegration && (child.platform === 'instagram' || child.url?.includes('instagram.com') || (child.type === 'collection' && child.platform === 'instagram'))) {
                                                                                        const childMedia = child.type === 'collection' ? (child.children || []).map(c => ({
                                                                                            id: c.id,
                                                                                            media_url: c.image,
                                                                                            thumbnail_url: c.image,
                                                                                            permalink: c.url,
                                                                                            caption: c.title,
                                                                                            media_type: c.videoUrl ? 'VIDEO' : 'IMAGE'
                                                                                        })) : [];

                                                                                        nestedItems.push(
                                                                                            <InteractiveButton key={child.id} className="w-full">
                                                                                                <div className={getHighlightClass(child.highlight)}>
                                                                                                    <InstagramCard
                                                                                                        username={instagramUsername || 'instagram_user'}
                                                                                                        followers={instagramFollowers || 0}
                                                                                                        avatarUrl={instagramAvatar || ''}
                                                                                                        media={childMedia.length > 0 ? childMedia : instagramMedia}
                                                                                                        themeButtonClass={baseCardClass}
                                                                                                        themeButtonStyle={mainButtonStyle}
                                                                                                        themeTextHex={getSmartTextColor()}
                                                                                                        buttonRoundness={roundedClass || undefined}
                                                                                                        isDark={isDarkTheme}
                                                                                                        variant={child.layout === 'classic' ? 'profile' : 'feed'}
                                                                                                        fontFamily={profile.fontFamily}
                                                                                                        fontWeight={profile.fontWeight || undefined}
                                                                                                        fontItalic={profile.fontItalic}
                                                                                                    />
                                                                                                </div>
                                                                                            </InteractiveButton>
                                                                                        );
                                                                                        renderedSpecial = true;
                                                                                    }
                                                                                    if (!renderedSpecial && (child.platform === 'youtube' || (child.url.includes('youtube.com') && !child.url.includes('watch?v=') && !child.url.includes('/shorts/')))) {
                                                                                        if (youtubeIntegration) {
                                                                                            nestedItems.push(
                                                                                                <InteractiveButton key={child.id} className="w-full">
                                                                                                    <div className={getHighlightClass(child.highlight)}>
                                                                                                        <YouTubeCard username={youtubeUsername || child.url} title={youtubeTitle || child.title} subscribers={youtubeSubscribers || 0} avatarUrl={youtubeAvatar || ''} isLive={youtubeIsLive} channelId={youtubeChannelId} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} themeTextHex={getSmartTextColor()} buttonRoundness={roundedClass || undefined} isDark={isDarkTheme} fontFamily={profile.fontFamily} fontWeight={profile.fontWeight || undefined} fontItalic={profile.fontItalic} />
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
                                                                                                        href={child.isPasswordProtected ? undefined : child.url}
                                                                                                        target={child.isPasswordProtected ? undefined : "_blank"}
                                                                                                        rel="noreferrer"
                                                                                                        onClick={(e) => {
                                                                                                            if (handlePasswordProtectedLink(child, e)) return;
                                                                                                            handleLinkClick(child.id);
                                                                                                        }}
                                                                                                        className={`block w-full h-[72px] transform group relative px-4 flex items-center gap-3 ${buttonClass} ${getHighlightClass(child.highlight)}`}
                                                                                                        style={{
                                                                                                            ...mainButtonStyle,
                                                                                                            fontFamily: profile.fontFamily,
                                                                                                            fontWeight: (profile.fontWeight || undefined),
                                                                                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                                                                                            ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art' || currentTheme.id === 'technology-holo' || currentTheme.id === 'technology-neural') ? { overflow: 'visible' } : { overflow: 'hidden' }),
                                                                                                            borderRadius: borderRadiusValue
                                                                                                        }}
                                                                                                    >
                                                                                                        {/* Icon/Image Container */}
                                                                                                        <div className="relative shrink-0 z-10">
                                                                                                            {child.image ? (
                                                                                                                <div className="w-9 h-9 rounded-sm overflow-hidden border border-[#1a1a1a]/5 transition-transform">
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
                                                                                                                <div className="w-9 h-9 flex items-center justify-center opacity-80 transition-transform">
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
                                                                                                                <span className="text-[10px] opacity-60 leading-tight flex items-center justify-center gap-1 mt-0.5 truncate" style={{ color: getSmartTextColor() }}>
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
                                                        flushIcons();
                                                        flushCards();
                                                    } else if (isMusicLink(link)) {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <InteractiveButton key={link.id} className="w-full">
                                                                <div className={getHighlightClass(link.highlight)}>
                                                                    <MusicRichCard
                                                                        link={link}
                                                                        handleLinkClick={handleLinkClick}
                                                                        baseCardClass={baseCardClass}
                                                                        mainButtonStyle={mainButtonStyle}
                                                                        effectiveFontFamily={effectiveFontFamily}
                                                                        profile={profile}
                                                                        getSmartTextColor={getSmartTextColor}
                                                                        getHighlightClass={getHighlightClass}
                                                                        setOpenPlaylist={setOpenPlaylist}
                                                                    />
                                                                </div>
                                                            </InteractiveButton>
                                                        );
                                                    } else if (link.embedType === 'youtube') {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <InteractiveButton key={link.id} className="w-full">
                                                                <div className={getHighlightClass(link.highlight)}>
                                                                    <YouTubeEmbed url={link.url} title={link.title} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} />
                                                                </div>
                                                            </InteractiveButton>
                                                        );
                                                    } else if (link.embedType === 'tiktok') {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <InteractiveButton key={link.id} className="w-full">
                                                                <div className={getHighlightClass(link.highlight)}>
                                                                    <TikTokEmbed url={link.url} title={link.title} videoUrl={link.videoUrl} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} />
                                                                </div>
                                                            </InteractiveButton>
                                                        );
                                                    } else if (link.type === 'mediakit') {
                                                        flushIcons();
                                                        flushCards();
                                                        renderedItems.push(
                                                            <InteractiveButton key={`mediakit-${link.id}`} className="w-full" glowColor={`${getSmartTextColor()}33`}>
                                                                <motion.div
                                                                    transition={{ duration: 0.2 }}
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
                                                                            ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art' || currentTheme.id === 'technology-holo' || currentTheme.id === 'technology-neural') ? { overflow: 'visible' } : { overflow: 'hidden' })
                                                                        }}
                                                                    >
                                                                        <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0 border-r bg-black/[0.03]" style={{ borderColor: `${getSmartTextColor()}0A` }}>
                                                                            <BarChart3 size={22} className="transition-transform duration-300" strokeWidth={1.5} style={{ color: getSmartTextColor() }} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 flex flex-col items-start justify-center px-6 text-left">
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
                                                    } else if ((link.layout as any) === 'card') {
                                                        flushIcons();
                                                        currentCardGroup.push(link);
                                                    } else {
                                                        flushIcons();
                                                        flushCards();
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
                                                                        href={link.isPasswordProtected ? undefined : link.url}
                                                                        target={link.isPasswordProtected ? undefined : "_blank"}
                                                                        rel="noreferrer"
                                                                        onClick={(e) => {
                                                                            if (handlePasswordProtectedLink(link, e)) return;
                                                                            handleLinkClick(link.id);
                                                                        }}
                                                                        className={`block w-full h-[72px] transform group relative px-4 flex items-center gap-3 ${buttonClass} ${getHighlightClass(link.highlight)} cursor-pointer`}
                                                                        style={{
                                                                            ...mainButtonStyle,
                                                                            fontFamily: profile.fontFamily,
                                                                            fontWeight: (profile.fontWeight || undefined),
                                                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                                                            ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art' || currentTheme.id === 'technology-holo' || currentTheme.id === 'technology-neural') ? { overflow: 'visible' } : { overflow: 'hidden' }),
                                                                            borderRadius: borderRadiusValue
                                                                        }}
                                                                    >
                                                                        {/* Icon/Image Container */}
                                                                        <div className="relative shrink-0 z-10">
                                                                            {link.image ? (
                                                                                <div className="w-10 h-10 rounded-sm overflow-hidden border border-[#1a1a1a]/5 shadow-sm transition-transform duration-300">
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
                                                                                <div className="w-10 h-10 flex items-center justify-center opacity-80 transition-transform duration-300">
                                                                                    <Icon size={22} />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-10" /> // Spacer to keep title centered if no icon
                                                                            )}
                                                                        </div>

                                                                        {/* Text Content */}
                                                                        <div className="flex-1 flex flex-col justify-center text-center min-w-0 z-10 relative">
                                                                            <span className={`text-[15px] leading-tight uppercase tracking-tight ${link.subtitle ? 'line-clamp-1 truncate' : 'line-clamp-2 break-words'}`}
                                                                                style={{
                                                                                    color: getSmartTextColor(),
                                                                                    fontWeight: profile.fontWeight || '700'
                                                                                }}>
                                                                                {link.title}
                                                                            </span>
                                                                            {link.subtitle && (
                                                                                <span className="text-[11px] opacity-60 leading-tight flex items-center justify-center gap-1 mt-0.5 truncate" style={{ color: getSmartTextColor() }}>
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




                                            {activeLinks.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-10 opacity-50 space-y-2 flex-1">
                                                    <span className="text-sm">Nenhum link ativo</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            );
                        })()}
                    </div>
                    {/* Theme-Integrated Support Button & Newsletter */}
                    <div className="mt-4 flex flex-col gap-4 pb-12">
                        {profile.supportKey && (
                            <InteractiveButton key="support-button" className="w-full">
                                <motion.a
                                    transition={{ duration: 0.2 }}
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
                                        ...((currentTheme.id.startsWith('brutalist-') || currentTheme.id === 'artistic-pop-art' || currentTheme.id === 'technology-holo' || currentTheme.id === 'technology-neural') ? { overflow: 'visible' } : { overflow: 'hidden' })
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

                        <div className="mt-auto mb-2 flex flex-col items-center w-full px-4 text-center gap-1 relative z-30 shrink-0">
                            {(profile.plan_type === 'free' || !profile.plan_type || !profile.hideBranding) && (
                                <div className="flex flex-col items-center gap-0.5">
                                    <span style={{
                                        color: effectiveCollectionTextColor || '#111827',
                                        opacity: 0.6,
                                        fontSize: '8px',
                                        letterSpacing: '0.5em',
                                        textTransform: 'uppercase',
                                        fontWeight: 300,
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
                            )}

                            <div className="flex items-center gap-2">
                                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: effectiveCollectionTextColor || '#111827', opacity: 0.4, fontSize: '8px', textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.15em', fontWeight: 300 }}>Termos</a>
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: effectiveCollectionTextColor || '#111827', opacity: 0.4, fontSize: '8px', textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.15em', fontWeight: 300 }}>Privacidade</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Foreground Layer (For themes like Sakura) */}
            {currentTheme.id === 'kawaii-sakura' && profile.headerLayout !== 'banner' && <KawaiiSakuraForeground />}


            {/* 🛍️ Product Detail Drawer */}
            <ProductDrawer
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                isPT={isPT}
                profile={profile}
                currentTheme={currentTheme}
                effectiveFontFamily={effectiveFontFamily}
                getSmartTextColor={getSmartTextColor}
                buttonClass={buttonClass}
                mainButtonStyle={mainButtonStyle}
                borderRadiusValue={borderRadiusValue}
                isStatic={isStatic}
                handleLinkClick={handleLinkClick}
                activeCollection={activeCollection}
            />

            {/* 🎵 Music Playlist Drawer */}
            <MusicPlaylistDrawer
                openPlaylist={openPlaylist}
                setOpenPlaylist={setOpenPlaylist}
                isDarkTheme={isDarkTheme}
                handleLinkClick={handleLinkClick}
                profile={profile}
                currentTheme={currentTheme}
                getSmartTextColor={getSmartTextColor}
                effectiveFontFamily={effectiveFontFamily}
                borderRadiusValue={borderRadiusValue}
                isStatic={isStatic}
            />


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
