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
import Grainient from './Grainient';

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

// @ts-ignore
import LightPillar from './LightPillar';
import GlassSurface from './GlassSurface';

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

    const buttonStyleType = profile.buttonStyleType || 'solid';
    const buttonRoundness = profile.buttonRoundness || (profile.buttonStyle === 'soft-rect' ? 'rounder' : 'full');

    let borderRadius = 50;
    let roundedClass = 'rounded-full';

    switch (buttonRoundness) {
        case 'square':
            borderRadius = 0;
            roundedClass = 'rounded-none';
            break;
        case 'round':
            borderRadius = 8;
            roundedClass = 'rounded-lg';
            break;
        case 'rounder':
            borderRadius = 16;
            roundedClass = 'rounded-2xl';
            break;
        case 'full':
            borderRadius = 999;
            roundedClass = 'rounded-full';
            break;
    }

    // Check if theme has its own shadow
    const hasThemeShadow = currentTheme.buttonClass.includes('shadow-');

    // Helper to get custom styles
    const getCustomButtonStyles = () => {
        if (!isCustomButtonStyle) return {};

        // Default base color
        const defaultBaseColor = currentTheme.buttonHex || ((isDarkTheme || currentTheme.id === 'glass') ? '#ffffff' : '#0f172a');
        const baseColor = profile.customButtonColor || defaultBaseColor;

        let textColor = profile.customTextColor;

        if (!textColor) {
            if (['solid', 'push', 'gradient', 'cyber', 'skeuo'].includes(buttonStyleType)) {
                if (profile.customButtonColor) {
                    textColor = '#ffffff'; // Default white text for fill buttons
                } else if (currentTheme.textHex && !profile.customButtonColor) {
                    textColor = currentTheme.textHex;
                } else {
                    textColor = (isDarkTheme || currentTheme.id === 'glass') ? '#000000' : '#ffffff';
                }
            } else if (buttonStyleType === 'neon') {
                textColor = baseColor;
            } else {
                // Outline, Soft, Glass, Hard-Shadow, Minimal: Match text to base color
                textColor = baseColor;
            }
        }

        const styles: React.CSSProperties = {
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // smooth physics
            borderRadius: `${borderRadius}px`
        };

        switch (buttonStyleType) {
            case 'solid':
                styles.backgroundColor = baseColor;
                styles.color = textColor;
                styles.border = '2px solid transparent';
                break;

            case 'outline':
                styles.backgroundColor = 'transparent';
                styles.color = textColor;
                styles.border = `2px solid ${baseColor}`;
                break;

            case 'soft':
                styles.backgroundColor = `${baseColor}26`; // ~15% opacity
                styles.color = baseColor; // Always use base color for text in soft mode for contrast
                styles.fontWeight = 600;
                break;

            case 'glass':
                styles.backgroundColor = `${baseColor}26`;
                styles.backdropFilter = 'blur(12px)';
                styles.WebkitBackdropFilter = 'blur(12px)';
                styles.color = textColor;
                styles.border = `1px solid ${baseColor}4D`;
                styles.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)';
                break;

            case 'hard-shadow':
                styles.backgroundColor = isDarkTheme ? '#000000' : '#ffffff';
                styles.color = baseColor;
                styles.border = `2px solid ${baseColor}`;
                styles.boxShadow = `4px 4px 0px ${baseColor}`;
                // styles.transform = 'translate(-2px, -2px)'; // Handled by motion or hover usually
                break;

            case 'push':
                styles.backgroundColor = baseColor;
                styles.color = textColor;
                styles.borderBottom = `6px solid rgba(0,0,0,0.2)`; // Simple darkening
                // styles.marginBottom = '2px'; // Handled by margin in container or specific offset
                break;

            case 'gradient':
                styles.background = `linear-gradient(135deg, ${baseColor}, ${baseColor}88)`;
                styles.color = textColor;
                styles.border = 'none';
                styles.boxShadow = `0 4px 15px ${baseColor}66`;
                break;

            case 'cyber':
                styles.backgroundColor = baseColor;
                styles.color = textColor;
                styles.clipPath = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';
                styles.borderRadius = '0px'; // Cyber still looks best square
                styles.borderLeft = '2px solid rgba(255,255,255,0.2)';
                styles.letterSpacing = '1px';
                break;

            case 'neon':
                styles.backgroundColor = 'transparent';
                styles.color = baseColor;
                styles.border = `2px solid ${baseColor}`;
                styles.boxShadow = `0 0 10px ${baseColor}, inset 0 0 5px ${baseColor}`;
                styles.textShadow = `0 0 5px ${baseColor}`;
                break;

            case 'skeuo':
                styles.backgroundColor = baseColor;
                styles.color = textColor;
                styles.borderTop = '2px solid rgba(255,255,255,0.5)';
                styles.borderLeft = '2px solid rgba(255,255,255,0.5)';
                styles.borderRight = '2px solid rgba(0,0,0,0.3)';
                styles.borderBottom = '2px solid rgba(0,0,0,0.3)';
                styles.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
                break;

            case 'minimal-hover':
                styles.backgroundColor = 'transparent';
                styles.color = baseColor;
                styles.border = 'none';
                styles.borderBottom = `1px solid ${baseColor}`;
                styles.borderRadius = '0px';
                styles.boxShadow = 'none';
                break;

            case 'paper':
                styles.backgroundColor = baseColor;
                styles.color = textColor;
                // Complex clip-path for torn edges
                styles.clipPath = 'polygon(3% 0, 7% 1%, 11% 0%, 16% 2%, 20% 0, 23% 2%, 28% 2%, 32% 1%, 35% 1%, 39% 3%, 41% 1%, 45% 0%, 47% 2%, 50% 2%, 53% 0, 58% 2%, 60% 2%, 63% 1%, 65% 0%, 69% 2%, 72% 2%, 75% 1%, 79% 1%, 82% 1%, 85% 0, 88% 1%, 91% 0, 93% 2%, 96% 0, 98% 1%, 100% 0, 100% 7%, 99% 11%, 100% 13%, 100% 22%, 99% 23%, 100% 27%, 100% 30%, 100% 36%, 99% 40%, 100% 43%, 100% 50%, 99% 55%, 100% 60%, 100% 66%, 99% 68%, 100% 71%, 100% 77%, 100% 80%, 99% 83%, 100% 89%, 100% 96%, 98% 98%, 95% 99%, 92% 99%, 89% 100%, 86% 99%, 83% 100%, 78% 99%, 74% 99%, 70% 100%, 66% 99%, 63% 100%, 59% 99%, 56% 100%, 53% 99%, 49% 100%, 46% 99%, 42% 100%, 39% 99%, 36% 100%, 31% 99%, 27% 100%, 24% 99%, 21% 100%, 18% 99%, 13% 100%, 9% 99%, 6% 100%, 3% 99%, 0 100%, 1% 97%, 0% 94%, 1% 89%, 0% 84%, 1% 81%, 0 76%, 0 73%, 1% 69%, 0% 64%, 1% 60%, 0% 55%, 0 51%, 1% 47%, 0% 44%, 1% 40%, 0% 36%, 0 31%, 1% 27%, 0% 23%, 1% 18%, 0% 15%, 0 10%, 1% 6%, 0% 0)';
                styles.borderRadius = '0px';
                styles.filter = 'drop-shadow(2px 2px 1px rgba(0,0,0,0.2))';
                break;

            case 'liquid':
                styles.backgroundColor = baseColor;
                styles.color = textColor;
                // If the user hasn't specified roundness, use the fluid shape. 
                // If they did, we might want to blend, but for now fluid shape as priority for this style.
                styles.borderRadius = '60% 40% 30% 70% / 60% 30% 70% 40%';
                styles.animation = 'wobble-shape 6s ease-in-out infinite';
                styles.boxShadow = `0 10px 20px ${baseColor}4D`;
                styles.border = 'none';
                break;

            default: // solid fallback
                styles.backgroundColor = baseColor;
                styles.color = textColor;
                break;
        }

        return styles;
    };

    const isCustomButtonStyle = !!(profile.customButtonColor || profile.buttonStyleType || profile.customTextColor || profile.buttonRoundness);

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
                @keyframes wobble-shape {
                    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                    50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1.02); }
                    75% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
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
                        {/* ... Existing fallbacks ... */}
                        {/* Fallback for new themes */}
                        {currentTheme.id === 'animated-grainient-cool' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900"></div>}
                        {currentTheme.id === 'animated-grainient-warm' && <div className="absolute inset-0 bg-gradient-to-br from-orange-900 to-red-900"></div>}
                        {currentTheme.id === 'animated-grainient-mono' && <div className="absolute inset-0 bg-zinc-900"></div>}

                        {/* Fallback for any other animated theme not caught above - Keep existing fallback */}
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
                        {/* Glitch CSS ... */}
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
                ) : currentTheme.id === 'animated-grainient-cool' ? (
                    <Grainient color1="#4f46e5" color2="#7c3aed" color3="#2563eb" />
                ) : currentTheme.id === 'animated-grainient-warm' ? (
                    <Grainient color1="#ea580c" color2="#dc2626" color3="#f59e0b" />
                ) : currentTheme.id === 'animated-grainient-mono' ? (
                    <Grainient color1="#334155" color2="#0f172a" color3="#000000" saturation={0} />
                ) : (
                    <div
                        className={`absolute inset-0 ${currentTheme.backgroundClass}`}
                        style={currentTheme.category === 'solid' && profile.customSolidColor ? { backgroundColor: profile.customSolidColor } : {}}
                    ></div>
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
                    fontSize: `${profile.fontSize || 16}px`,
                    fontWeight: profile.fontWeight || undefined,
                    fontStyle: profile.fontItalic ? 'italic' : 'normal',
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
                                        <h3 className={`mb-1 tracking-tight flex items-center gap-2 text-wrap break-words ${profile.headerLayout === 'hero' ? 'text-[2em]' : 'text-[1.5em]'
                                            }`}>
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
                                    <p className={`text-[1em] opacity-90 leading-relaxed whitespace-pre-line ${profile.headerLayout === 'compact' ? 'text-left' : 'text-center max-w-[300px]'
                                        }`}>
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
                                                        <div className="text-center mb-3 opacity-90 text-lg">
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
                                                                        <span className="text-[0.75em] leading-tight truncate text-slate-900 font-bold">{child.title}</span>
                                                                        {child.subtitle && (
                                                                            <span className="text-[0.7em] leading-tight truncate text-slate-500 mt-0.5">{child.subtitle}</span>
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
                                                                    className={`block w-full ${roundedClass} text-center text-base transform group relative hover:scale-[1.02] active:scale-[0.98] ${currentTheme.id === 'glass' ? '' : `py-4 px-6 flex items-center justify-between ${!profile.customButtonColor ? currentTheme.buttonClass : ''} ${getHighlightClass(child.highlight)} overflow-hidden ${hasThemeShadow ? '' : 'shadow-sm'}`}`}
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
                                                                            <div className="flex-1 px-3 flex flex-col justify-center overflow-hidden text-white text-center">
                                                                                <span className="truncate text-[0.9em] leading-tight font-bold">{child.title}</span>
                                                                                {child.subtitle && (
                                                                                    <span className="truncate text-[0.75em] opacity-90 leading-tight mt-0.5">
                                                                                        {child.subtitle}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </GlassSurface>
                                                                    ) : (
                                                                        <div className="relative z-10 w-full flex items-center justify-between">
                                                                            {child.image ? (
                                                                                <img src={child.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0" />
                                                                            ) : (
                                                                                <span className="w-8"></span>
                                                                            )}
                                                                            <div className="flex-1 px-3 flex flex-col justify-center overflow-hidden text-center">
                                                                                <span className="truncate text-[0.9em] leading-tight font-bold">{child.title}</span>
                                                                                {child.subtitle && (
                                                                                    <span className="truncate text-[0.75em] opacity-80 leading-tight flex items-center justify-center gap-1 mt-0.5">
                                                                                        {child.subtitle}
                                                                                    </span>
                                                                                )}
                                                                            </div>
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
                                                                <span className="text-[0.9em] leading-tight truncate text-slate-900 font-bold">{link.title}</span>
                                                                {link.subtitle && (
                                                                    <span className="text-[0.75em] leading-tight truncate text-slate-500">{link.subtitle}</span>
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
                                                className={`block w-full ${roundedClass} text-center text-base transform group relative hover:scale-[1.02] active:scale-[0.98] ${(currentTheme.id === 'glass' && !isCustomButtonStyle) ? '' : `py-4 px-6 flex items-center justify-between ${(!isCustomButtonStyle || (!profile.customButtonColor && !profile.buttonStyleType)) ? currentTheme.buttonClass : 'bg-slate-100 shadow-sm'} ${getHighlightClass(link.highlight)} overflow-hidden ${hasThemeShadow && !isCustomButtonStyle ? '' : 'shadow-sm'}`}`}
                                                style={!isCustomButtonStyle ? {} : getCustomButtonStyles()}
                                            >
                                                {currentTheme.id === 'glass' && !isCustomButtonStyle ? <GlassSurface
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
                                                        <div className="flex-1 px-3 flex flex-col justify-center overflow-hidden text-white text-center">
                                                            <span className="truncate text-[0.9em] leading-tight font-bold">{link.title}</span>
                                                            {link.subtitle && (
                                                                <span className="truncate text-[0.75em] opacity-90 leading-tight mt-0.5">
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
                                                            <div className="flex-1 px-3 flex flex-col justify-center overflow-hidden text-center">
                                                                <span className="truncate text-[0.9em] leading-tight font-bold">{link.title}</span>
                                                                {link.subtitle && (
                                                                    <span className="truncate text-[0.75em] opacity-80 leading-tight flex items-center justify-center gap-1 mt-0.5">
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
                                    layout
                                    href={profile.supportType === 'paypal' ? `https://${profile.supportKey}` : '#'}
                                    onClick={(e) => {
                                        if (profile.supportType === 'pix') {
                                            e.preventDefault();
                                            alert(`Chave Pix copiada: ${profile.supportKey}`);
                                            navigator.clipboard.writeText(profile.supportKey || '');
                                        }
                                    }}
                                    className={`block w-full ${roundedClass} text-center text-base transition-all duration-300 transform group relative hover:scale-[1.02] active:scale-[0.98] ${currentTheme.id === 'glass' ? '' : `py-4 px-6 flex items-center justify-between ${!profile.customButtonColor ? currentTheme.buttonClass : ''} ${hasThemeShadow ? '' : 'shadow-sm'} overflow-hidden`}`}
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
                                <span className="text-[13px] tracking-tight">
                                    Junte-se a {profile.name} no Nodus
                                </span>
                            </a>

                            {/* Legal Links (Minimalist) */}
                            <div className={`flex items-center gap-2 text-[10px] transition-opacity duration-300 ${isDarkTheme ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-600'}`}>
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
