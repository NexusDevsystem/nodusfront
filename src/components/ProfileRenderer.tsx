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
    Coffee,
    BadgeCheck,
    ChevronDown
} from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';
import verifiedBadge from '../assets/verified-badge.png';
// @ts-ignore
import LightPillar from './LightPillar';
import GlassSurface from './GlassSurface';

// @ts-ignore
import NewsletterWidget from './NewsletterWidget';
import AuroraBackground from './AuroraBackground';
import ParticlesBackground from './ParticlesBackground';
import MatrixBackground from './MatrixBackground';
import GradientMeshBackground from './GradientMeshBackground';
import CyberGridBackground from './CyberGridBackground';
import FloatingShapesBackground from './FloatingShapesBackground';
import NeonCityBackground from './NeonCityBackground';
import GeometricFlowBackground from './GeometricFlowBackground';
import SpaceWarpBackground from './SpaceWarpBackground';
import AbstractWavesBackground from './AbstractWavesBackground';
import NodusOfficialBackground from './NodusOfficialBackground';
import Prism from './Prism';
import { apiClient } from '../services/apiClient';
import { Play, Plus, Music } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';

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
    const activeLinks = links.filter(l => l.isActive);
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

    const isDarkTheme =
        currentTheme.id.includes('dark') ||
        currentTheme.id.includes('black') ||
        currentTheme.id.includes('midnight') ||
        currentTheme.id.includes('vampire') ||
        currentTheme.id.includes('animated-') ||
        ['luxury-gold', 'leafy', 'evergreen', 'golden-hour', 'berry-blast', 'steel-blue'].includes(currentTheme.id) ||
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
            <div className={`rounded-[16px] p-2.5 flex items-center relative overflow-hidden group shadow-md border border-white/5 min-h-[64px] w-full ${isDeezer ? 'bg-[#1a1c3b]' : 'bg-[#5c540d]'}`}>
                {/* Album Art */}
                <div className="relative z-10 w-[42px] h-[42px] rounded-md overflow-hidden shadow-sm mr-2.5 shrink-0 transition-transform duration-500 group-hover:scale-105">
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
                        className="w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-sm hover:bg-slate-50"
                    >
                        <Play size={12} fill="currentColor" className="ml-0.5" />
                    </a>
                </div>

                {/* Background Grain/Noise Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" />
            </div>
        );
    };

    const isSoftRect = profile.buttonStyle === 'soft-rect';
    const isRounded = profile.buttonStyle === 'rounded';
    const borderRadius = isSoftRect ? 14 : 50;
    const roundedClass = isRounded ? 'rounded-full' : isSoftRect ? 'rounded-2xl' : '';

    // Check if theme has its own shadow
    const hasThemeShadow = currentTheme.buttonClass.includes('shadow-');

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden">
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
            `}</style>
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {profile.customSolidColor ? (
                    <div className="absolute inset-0" style={{ backgroundColor: profile.customSolidColor }}></div>
                ) : profile.customBackground ? (
                    <div className="absolute inset-0">
                        <img src={profile.customBackground} alt="Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                ) : isStatic && currentTheme.id.startsWith('animated-') ? (
                    // STATIC FALLBACK FOR ANIMATED THEMES
                    <div className="absolute inset-0 bg-zinc-900 border-2 border-red-500/0">
                        {/* Fallback gradients/colors based on theme ID to look somewhat similar */}
                        {currentTheme.id === 'animated-hologram' && <div className="absolute inset-0 bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>}
                        {currentTheme.id === 'animated-aurora' && <div className="absolute inset-0 bg-slate-900 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900"></div>}
                        {currentTheme.id === 'animated-starfield' && <div className="absolute inset-0 bg-[#020617]"></div>}
                        {currentTheme.id === 'animated-matrix' && <div className="absolute inset-0 bg-black"><span className="text-green-500 font-mono text-xs opacity-20 p-2 block">101010</span></div>}
                        {currentTheme.id === 'animated-glitch' && <div className="absolute inset-0 bg-[#050505]"></div>}
                        {currentTheme.id === 'animated-mesh' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>}
                        {currentTheme.id === 'animated-cybergrid' && <div className="absolute inset-0 bg-zinc-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>}
                        {currentTheme.id === 'animated-shapes' && <div className="absolute inset-0 bg-slate-50"></div>}
                        {currentTheme.id === 'animated-neon-city' && <div className="absolute inset-0 bg-black bg-[linear-gradient(to_bottom,transparent,rgba(167,139,250,0.2))]"></div>}
                        {currentTheme.id === 'animated-geo-flow' && <div className="absolute inset-0 bg-zinc-900"></div>}
                        {currentTheme.id === 'animated-space-warp' && <div className="absolute inset-0 bg-black"></div>}
                        {currentTheme.id === 'animated-waves' && <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900"></div>}
                        {currentTheme.id === 'animated-nodus-official' && <div className="absolute inset-0 bg-[#0f1f1a]"></div>}

                        {/* Fallback for any other animated theme not caught above */}
                        <div className={`absolute inset-0 ${currentTheme.backgroundClass}`}></div>
                    </div>
                ) : currentTheme.id === 'glass' ? (
                    <div className="absolute inset-0 bg-black">
                        <LightPillar
                            topColor="#5227FF"
                            bottomColor="#FF9FFC"
                            intensity={1}
                            rotationSpeed={0.3}
                            glowAmount={0.002}
                            pillarWidth={3}
                            pillarHeight={0.4}
                            noiseIntensity={0.5}
                            pillarRotation={25}
                            interactive={false}
                            mixBlendMode="screen"
                            quality="high"
                        />
                        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                    </div>
                ) : currentTheme.id === 'animated-hologram' ? (
                    <div className="absolute inset-0 bg-black">
                        <Prism
                            animationType="3drotate"
                            glow={1.5}
                            scale={4}
                            hueShift={0}
                            colorFrequency={0.8}
                            transparent={true}
                        />
                        <div className="absolute inset-0 bg-black/40" />
                    </div>
                ) : currentTheme.id === 'animated-aurora' ? (
                    <AuroraBackground />
                ) : currentTheme.id === 'animated-starfield' ? (
                    <div className="absolute inset-0 bg-[#020617]">
                        <ParticlesBackground color="#ffffff" count={80} />
                    </div>
                ) : currentTheme.id === 'animated-matrix' ? (
                    <MatrixBackground />
                ) : currentTheme.id === 'animated-glitch' ? (
                    <div className="absolute inset-0 bg-[#050505]">
                        <style>{`
                        @keyframes glitch-bg {
                            0% { background: #050505; }
                            95% { background: #050505; }
                            96% { background: #1a001a; }
                            97% { background: #051a1a; }
                            98% { background: #050505; }
                        }
                        @keyframes scanline {
                            0% { transform: translateY(-100%); }
                            100% { transform: translateY(100%); }
                        }
                    `}</style>
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ animation: 'glitch-bg 4s infinite' }} />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-[100px] bg-white/5 opacity-10 pointer-events-none" style={{ animation: 'scanline 8s linear infinite' }} />
                    </div>
                ) : currentTheme.id === 'animated-mesh' ? (
                    <GradientMeshBackground />
                ) : currentTheme.id === 'animated-cybergrid' ? (
                    <CyberGridBackground />
                ) : currentTheme.id === 'animated-shapes' ? (
                    <FloatingShapesBackground />
                ) : currentTheme.id === 'animated-neon-city' ? (
                    <NeonCityBackground />
                ) : currentTheme.id === 'animated-geo-flow' ? (
                    <GeometricFlowBackground />
                ) : currentTheme.id === 'animated-space-warp' ? (
                    <SpaceWarpBackground />
                ) : currentTheme.id === 'animated-waves' ? (
                    <AbstractWavesBackground />
                ) : currentTheme.id === 'animated-nodus-official' ? (
                    <NodusOfficialBackground />
                ) : (
                    <div className={`absolute inset-0 ${currentTheme.backgroundClass}`}></div>
                )}

                {/* GLOBAL BLUR FADE OVERLAY */}
                {profile.enableBlur && (
                    <>
                        {/* Gradient Fade Overlay - Top transparent, Bottom Solid Matching Theme or Custom Color */}
                        <div
                            className="absolute inset-0 z-10 pointer-events-none"
                            style={{
                                background: `linear-gradient(to bottom, transparent 0%, ${profile.customSolidColor || currentTheme.solidColor || (isDarkTheme ? '#000000' : '#ffffff')}FF 45%, ${profile.customSolidColor || currentTheme.solidColor || (isDarkTheme ? '#000000' : '#ffffff')} 100%)`
                            }}
                        ></div>
                        {/* Backdrop Blur */}
                        <div className="absolute inset-0 backdrop-blur-[2px] z-10 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent 10%, black 60%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 10%, black 60%)' }}></div>
                    </>
                )}
            </div>

            {/* Content Container */}
            <div
                className={`w-full h-full overflow-y-auto scrollbar-hide flex flex-col relative z-20 ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass}`}
                style={{
                    fontFamily: profile.fontFamily,
                    color: profile.customTextColor || undefined
                }}
            >
                <LayoutGroup id="profile-content">
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
                    <div className={`px-6 pb-40 ${isPreview ? 'pt-12' : 'pt-16'} flex-1 flex flex-col min-h-full`}>

                        {/* Profile Section */}
                        <motion.div layout className={`w-full mb-6 ${profile.headerLayout === 'compact'
                            ? 'flex flex-row items-center gap-4 text-left px-2'
                            : 'flex flex-col items-center text-center'
                            }`}>
                            {/* Avatar */}
                            {profile.avatarUrl && (
                                <div className={`relative group shrink-0 ${profile.headerLayout === 'compact' ? 'mb-0' : 'mb-4'
                                    }`}>
                                    <div className={`rounded-full overflow-hidden border-4 transition-all duration-300 shadow-lg ${currentTheme.avatarBorder
                                        } ${profile.avatarSize === 'sm' ? 'w-20 h-20' :
                                            profile.avatarSize === 'lg' ? 'w-32 h-32' :
                                                'w-24 h-24' // default (md)
                                        } ${profile.headerLayout === 'hero' ? 'w-40 h-40 border-[6px]' : ''
                                        }`}>
                                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
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
                                        <h3 className={`font-bold mb-1 tracking-tight flex items-center gap-2 text-wrap break-words ${profile.headerLayout === 'hero' ? 'text-3xl' : 'text-2xl'
                                            }`} style={{ fontFamily: profile.fontFamily }}>
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
                                    <p className={`text-base font-medium opacity-90 leading-relaxed whitespace-pre-line ${profile.headerLayout === 'compact' ? 'text-left' : 'text-center max-w-[300px]'
                                        }`} style={{ fontFamily: profile.fontFamily }}>
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
                                            className={`${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass} hover:opacity-70 transition-all hover:scale-110 active:scale-95`}
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
                                    transition={{ duration: 0.15 }}
                                    layout
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
                                                    className={`w-full group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${currentTheme.id === 'glass' ? '' : currentTheme.buttonClass}`}
                                                >
                                                    {currentTheme.id === 'glass' ? (
                                                        <GlassSurface
                                                            width="100%"
                                                            height="auto"
                                                            borderRadius={16}
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
                                                    <a key={product.id} href={product.url} target="_blank" rel="noreferrer" onClick={() => handleLinkClick(product.id)} className={`flex flex-col gap-2 group relative rounded-2xl w-full ${currentTheme.id === 'glass' ? '' : 'p-2'}`}>
                                                        {currentTheme.id === 'glass' ? (
                                                            <GlassSurface
                                                                width="100%"
                                                                height="auto"
                                                                borderRadius={16}
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
                                                                    <div className={`aspect-square rounded-xl overflow-hidden border-2 transition-transform transform group-hover:scale-[1.02] ${currentTheme.avatarBorder} bg-white relative w-full`}>
                                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                                        {product.discountCode && (
                                                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm">
                                                                                {product.discountCode}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col gap-0.5 w-full">
                                                                        <span className="text-sm font-medium truncate text-center text-white opacity-90">{product.name}</span>
                                                                        {product.price && (
                                                                            <span className="text-xs font-bold truncate text-center text-white">{product.price}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </GlassSurface>

                                                        ) : (
                                                            <div className="relative z-10 flex flex-col gap-2">
                                                                <div className={`aspect-square rounded-xl overflow-hidden border-2 transition-transform transform group-hover:scale-[1.02] ${currentTheme.avatarBorder} bg-white relative`}>
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
                                    transition={{ duration: 0.15 }}
                                    layout
                                    className="flex flex-col gap-4 w-full flex-1 relative"
                                >
                                    {buttonLinks.map(link => {

                                        // COLLECTION
                                        if (link.type === 'collection') {
                                            const hasChildren = link.children && link.children.length > 0;
                                            const activeChildren = link.children ? link.children.filter(c => c.isActive) : [];

                                            if (!hasChildren && !activeChildren.length) return null;

                                            // Check if this collection contains card layouts (trigger carousel mode)
                                            const isCardCollection = activeChildren.some(c => c.layout === 'card');

                                            if (isCardCollection) {
                                                return (
                                                    <motion.div
                                                        key={link.id}
                                                        layout
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        className="w-full pt-2 pb-1"
                                                    >
                                                        <div className="text-center mb-3 font-bold opacity-90 text-lg">
                                                            {link.title}
                                                        </div>

                                                        {/* CAROUSEL CONTAINER */}
                                                        <div className="flex overflow-x-auto gap-3 px-1 pb-4 -mx-1 scrollbar-hide snap-x relative">
                                                            {activeChildren.map(child => (
                                                                <motion.a
                                                                    key={child.id}
                                                                    layout
                                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                                    href={child.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={() => handleLinkClick(child.id)}
                                                                    className="relative group flex-shrink-0 w-40 snap-start flex flex-col rounded-[20px] overflow-hidden transition-all duration-300 shadow-sm"
                                                                >
                                                                    {/* Top Image - 2/3 Height */}
                                                                    <div className="h-24 w-full bg-slate-100 relative">
                                                                        {child.image ? (
                                                                            <img src={child.image} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                                                <ShoppingBag size={20} />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Bottom Content - White & Compact */}
                                                                    <div className="bg-white p-3 flex flex-col justify-center h-16 relative">
                                                                        <span className="text-[12px] font-bold leading-tight line-clamp-2 text-slate-900">{child.title}</span>
                                                                        {child.subtitle && (
                                                                            <span className="text-[10px] font-medium leading-tight truncate text-slate-500 mt-0.5">{child.subtitle}</span>
                                                                        )}
                                                                        {/* Tiny visual indicator */}
                                                                        <div className="absolute right-2 bottom-2 w-1 h-1 rounded-full bg-slate-300"></div>
                                                                    </div>
                                                                </motion.a>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                );
                                            }

                                            return (
                                                <motion.div
                                                    key={link.id}
                                                    layout
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    className="w-full pt-2 pb-1"
                                                >
                                                    <div className="text-center mb-3 font-bold opacity-90 text-lg">
                                                        {link.title}
                                                    </div>

                                                    <motion.div layout className="flex flex-col gap-4 relative">
                                                        {activeChildren.map(child => {
                                                            // ... (inner content same as before, but wrapped in motion later if needed)
                                                            // For now, let's keep it simple at the collection level
                                                            // Special handling for Spotify/Deezer - custom mini player
                                                            if (isMusicLink(child)) {
                                                                return (
                                                                    <motion.div key={child.id} layout className="w-full">
                                                                        <MusicRichCard link={child} handleLinkClick={handleLinkClick} />
                                                                    </motion.div>
                                                                );
                                                            }

                                                            // YOUTUBE EMBED IN COLLECTION
                                                            if (child.embedType === 'youtube') {
                                                                return (
                                                                    <motion.div key={child.id} layout className="mb-4">
                                                                        <YouTubeEmbed url={child.url} title={child.title} className="rounded-2xl" />
                                                                    </motion.div>
                                                                );
                                                            }
                                                            return (
                                                                <motion.a
                                                                    key={child.id}
                                                                    layout
                                                                    href={child.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={() => handleLinkClick(child.id)}
                                                                    className={`block w-full ${roundedClass} text-center text-base font-medium transform group relative hover:scale-[1.02] active:scale-[0.98] ${currentTheme.id === 'glass' ? '' : `py-4 px-6 flex items-center justify-between ${!profile.customButtonColor ? currentTheme.buttonClass : ''} ${getHighlightClass(child.highlight)} overflow-hidden ${hasThemeShadow ? '' : 'shadow-sm'}`}`}
                                                                    style={!profile.customButtonColor ? {} : {
                                                                        backgroundColor: profile.customButtonColor,
                                                                        color: profile.customTextColor || (isDarkTheme ? '#fff' : '#000')
                                                                    }}
                                                                >
                                                                    {currentTheme.id === 'glass' ? (
                                                                        <GlassSurface
                                                                            width="100%"
                                                                            height="auto"
                                                                            borderRadius={borderRadius}
                                                                            displace={0.5}
                                                                            distortionScale={-180}
                                                                            redOffset={0}
                                                                            greenOffset={10}
                                                                            blueOffset={20}
                                                                            brightness={50}
                                                                            opacity={0.93}
                                                                            mixBlendMode="screen"
                                                                            className={`${getHighlightClass(child.highlight)}`}
                                                                        >
                                                                            <div className="w-full flex items-center justify-between py-3 px-5">
                                                                                {child.image ? (
                                                                                    <img src={child.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0" />
                                                                                ) : (
                                                                                    <span className="w-8"></span>
                                                                                )}
                                                                                <span className="truncate flex-1 px-3 text-white text-lg">{child.title}</span>
                                                                                <span className="w-8 shrink-0"></span>
                                                                            </div>
                                                                        </GlassSurface>
                                                                    ) : (
                                                                        <div className="relative z-10 w-full flex items-center justify-between">
                                                                            {child.image ? (
                                                                                <img src={child.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0" />
                                                                            ) : (
                                                                                <span className="w-8"></span>
                                                                            )}
                                                                            <span className="truncate flex-1 px-3">{child.title}</span>
                                                                            <span className="w-8 shrink-0"></span>
                                                                        </div>
                                                                    )}
                                                                </motion.a>
                                                            );
                                                        })}
                                                    </motion.div>
                                                </motion.div>
                                            );
                                        }

                                        // CARD LAYOUT STANDARD
                                        if (link.layout === 'card') {
                                            return (
                                                <motion.a
                                                    key={link.id}
                                                    layout
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => handleLinkClick(link.id)}
                                                    className={`block w-full rounded-[22px] overflow-hidden relative group ${getHighlightClass(link.highlight)} shadow-sm`}
                                                >
                                                    <div className="flex flex-col w-full h-full">
                                                        {/* Image Area - The user wanted a "Card" style with image on top */}
                                                        <div className="aspect-[2.2/1] w-full bg-slate-100 relative">
                                                            {link.image ? (
                                                                <img src={link.image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                                    <ShoppingBag size={32} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content Area - STRICTLY WHITE background as requested */}
                                                        <div className="bg-white px-5 py-4 flex items-center justify-between relative min-h-[80px]">
                                                            <div className="flex flex-col gap-0.5 w-full pr-6">
                                                                <span className="font-bold text-lg leading-tight line-clamp-2 text-slate-900">{link.title}</span>
                                                                {link.subtitle && (
                                                                    <span className="text-sm font-medium leading-tight truncate text-slate-500">{link.subtitle}</span>
                                                                )}
                                                            </div>
                                                            <div className="text-slate-400 shrink-0 ml-2">
                                                                <MoreHorizontal size={20} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.a>
                                            );
                                        }

                                        // EMBED HANDLING
                                        if (link.embedType === 'youtube') {
                                            return (
                                                <motion.div
                                                    key={link.id}
                                                    layout
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    className="mb-4"
                                                >
                                                    <YouTubeEmbed url={link.url} title={link.title} className="rounded-2xl" />
                                                </motion.div>
                                            );
                                        }

                                        if (isMusicLink(link)) {
                                            return (
                                                <motion.div
                                                    key={link.id}
                                                    layout
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    className="w-full mb-5"
                                                >
                                                    <MusicRichCard link={link} handleLinkClick={handleLinkClick} />
                                                </motion.div>
                                            );
                                        }

                                        // STANDARD LINK
                                        return (
                                            <motion.a
                                                key={link.id}
                                                layout
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={() => handleLinkClick(link.id)}
                                                className={`block w-full ${roundedClass} text-center text-base font-medium transform group relative hover:scale-[1.02] active:scale-[0.98] ${currentTheme.id === 'glass' ? '' : `py-4 px-6 flex items-center justify-between ${!profile.customButtonColor ? currentTheme.buttonClass : ''} ${getHighlightClass(link.highlight)} overflow-hidden ${hasThemeShadow ? '' : 'shadow-sm'}`}`}
                                                style={!profile.customButtonColor ? {} : {
                                                    backgroundColor: profile.customButtonColor,
                                                    color: profile.customTextColor || (isDarkTheme ? '#fff' : '#000') // Fallback or override
                                                }}
                                            >
                                                {currentTheme.id === 'glass' ? <GlassSurface
                                                    width="100%"
                                                    height="auto"
                                                    borderRadius={borderRadius}
                                                    displace={0.5}
                                                    distortionScale={-180}
                                                    redOffset={0}
                                                    greenOffset={10}
                                                    blueOffset={20}
                                                    brightness={50}
                                                    opacity={0.93}
                                                    mixBlendMode="screen"
                                                    className={`${getHighlightClass(link.highlight)}`}
                                                >
                                                    <div className="w-full flex items-center justify-between py-3 px-5">
                                                        {link.image ? (
                                                            <img src={link.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0" />
                                                        ) : (
                                                            <span className="w-8"></span>
                                                        )}
                                                        <div className="flex-1 px-3 flex flex-col justify-center overflow-hidden text-white">
                                                            <span className="truncate text-lg leading-tight">{link.title}</span>
                                                            {link.subtitle && (
                                                                <span className="truncate text-xs opacity-90 leading-tight mt-0.5">
                                                                    {link.subtitle}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="w-8 shrink-0"></span>
                                                    </div>
                                                </GlassSurface>
                                                    : (
                                                        <div className="relative z-10 w-full flex items-center justify-between">
                                                            {link.image ? (
                                                                <img src={link.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0" />
                                                            ) : (
                                                                <span className="w-8"></span>
                                                            )}
                                                            <div className="flex-1 px-3 flex flex-col justify-center overflow-hidden">
                                                                <span className="truncate leading-tight">{link.title}</span>
                                                                {link.subtitle && (
                                                                    <span className="truncate text-xs opacity-80 leading-tight flex items-center justify-center gap-1 mt-0.5">
                                                                        {link.subtitle}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="w-8 shrink-0"></span>
                                                        </div>
                                                    )}
                                            </motion.a>
                                        );
                                    })}

                                    {activeLinks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-50 space-y-2">
                                            <span className="text-sm font-medium">Nenhum link ativo</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>



                        {/* Theme-Integrated Support Button & Newsletter */}
                        <div className="mt-4 flex flex-col gap-4">
                            {profile.supportKey && (
                                <motion.a
                                    layout
                                    href={profile.supportType === 'paypal' ? `https://${profile.supportKey}` : '#'}
                                    onClick={(e) => {
                                        if (profile.supportType === 'pix') {
                                            e.preventDefault();
                                            alert(`Chave Pix copiada: ${profile.supportKey}`);
                                            navigator.clipboard.writeText(profile.supportKey || '');
                                        }
                                    }}
                                    className={`block w-full ${roundedClass} text-center text-base font-medium transition-all duration-300 transform group relative hover:scale-[1.02] active:scale-[0.98] ${currentTheme.id === 'glass' ? '' : `py-4 px-6 flex items-center justify-between ${!profile.customButtonColor ? currentTheme.buttonClass : ''} ${hasThemeShadow ? '' : 'shadow-sm'} overflow-hidden`}`}
                                    style={!profile.customButtonColor ? {} : {
                                        backgroundColor: profile.customButtonColor,
                                        color: profile.customTextColor || (isDarkTheme ? '#fff' : '#000')
                                    }}
                                >
                                    {currentTheme.id === 'glass' ? (
                                        <GlassSurface
                                            width="100%"
                                            height="auto"
                                            borderRadius={borderRadius}
                                            displace={0.5}
                                            distortionScale={-180}
                                            redOffset={0}
                                            greenOffset={10}
                                            blueOffset={20}
                                            brightness={50}
                                            opacity={0.93}
                                            mixBlendMode="screen"
                                            className=""
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
                                        <div className="relative z-10 w-full flex items-center justify-between">
                                            {profile.supportType === 'pix' ? (
                                                <img src="https://img.icons8.com/?size=100&id=CuUOYOfd3Dy9&format=png&color=000000" alt="Pix" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-0.5" />
                                            ) : (
                                                <img src="https://img.icons8.com/?size=100&id=34525&format=png&color=000000" alt="PayPal" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-1" />
                                            )}
                                            <span className="truncate flex-1 px-3">Apoiar</span>
                                            <span className="w-8 opacity-50 flex justify-end"><Coffee size={20} /></span>
                                        </div>
                                    )}
                                </motion.a>
                            )}

                            {profile.showNewsletter && (
                                <motion.div layout className="w-full px-2">
                                    <NewsletterWidget profile={profile} />
                                </motion.div>
                            )}
                        </div>

                        <motion.div layout className="mt-auto pt-20 mb-12 flex flex-col items-center gap-1 w-full px-4">
                            <a
                                href="https://www.noduscc.com.br"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] mb-2 ${isDarkTheme
                                    ? 'bg-white text-slate-900'
                                    : 'bg-slate-900 text-white'
                                    }`}
                            >
                                <span className="text-[13px] font-semibold tracking-tight">
                                    Junte-se a {profile.name} no Nodus
                                </span>
                            </a>

                            {/* Legal Links (Minimalist) */}
                            <div className={`flex items-center gap-2 text-[10px] font-medium transition-opacity duration-300 ${isDarkTheme ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-600'}`}>
                                <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Termos</a>
                                <span>•</span>
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacidade</a>
                            </div>
                        </motion.div>
                    </div>
                </LayoutGroup>
            </div>
        </div>
    );
};

export default ProfileRenderer;
