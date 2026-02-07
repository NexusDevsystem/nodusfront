import React, { useState } from 'react';
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
    Coffee
} from 'lucide-react';
// @ts-ignore
import LightPillar from './LightPillar';
import GlassSurface from './GlassSurface';

// @ts-ignore
import NewsletterWidget from './NewsletterWidget';
import { apiClient } from '../services/apiClient';

interface ProfileRendererProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    isPreview?: boolean; // If true, shows mock status bar (9:41, wifi etc)
}

const ProfileRenderer: React.FC<ProfileRendererProps> = ({ profile, links, products = [], isPreview = false }) => {
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const activeLinks = links.filter(l => l.isActive);

    // Top level social links
    const socialLinks = activeLinks.filter(l => l.layout === 'social' && l.type !== 'collection');

    // Button links
    const buttonLinks = activeLinks.filter(l => l.layout !== 'social' || l.type === 'collection');

    const isDarkTheme =
        currentTheme.id.includes('dark') ||
        currentTheme.id.includes('black') ||
        currentTheme.id === 'luxury-gold' ||
        currentTheme.id === 'vampire' ||
        currentTheme.id === 'leafy';

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
            await apiClient.trackClick(id);
        } catch (e) {
            console.error('Failed to track click:', e);
        }
    };


    const isSoftRect = profile.buttonStyle === 'soft-rect';
    const isRounded = profile.buttonStyle === 'rounded';

    const borderRadius = isSoftRect ? 14 : 50;

    // Determine rounding class: if user explicitly chose a style AND it's not a theme that overrides it
    // Actually, let's make it smarter: only apply if the theme doesn't already specify rounding
    const hasThemeRounding = currentTheme.buttonClass.includes('rounded-');
    const roundedClass = hasThemeRounding ? '' : (isSoftRect ? 'rounded-2xl' : 'rounded-full');

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
            {profile.customSolidColor ? (
                <div className="absolute inset-0 z-0 overflow-hidden" style={{ backgroundColor: profile.customSolidColor }}></div>
            ) : profile.customBackground ? (
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img src={profile.customBackground} alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
            ) : currentTheme.id === 'glass' ? (
                <div className="absolute inset-0 z-0 overflow-hidden bg-black">
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
            ) : (
                <div className={`absolute inset-0 z-0 ${currentTheme.backgroundClass}`}></div>
            )}

            {/* Content Container */}
            <div
                className={`w-full h-full overflow-y-auto scrollbar-hide flex flex-col relative z-10 ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass}`}
                style={{
                    fontFamily: profile.fontFamily,
                    color: profile.customTextColor || undefined
                }}
            >
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
                    <button className={`p-2 rounded-full transition-colors ${isDarkTheme || profile.customBackground || currentTheme.id === 'glass' ? 'bg-black/20 text-white hover:bg-black/30' : 'bg-transparent text-slate-800 hover:bg-black/5'}`}>
                        <Share2 size={20} />
                    </button>
                </div>
                {/* Menu / Options Button */}
                <div className="absolute top-6 left-6 z-20">
                    <button className={`p-2 rounded-full transition-colors ${isDarkTheme || profile.customBackground || currentTheme.id === 'glass' ? 'bg-black/20 text-white hover:bg-black/30' : 'bg-transparent text-slate-800 hover:bg-black/5'}`}>
                        <img src="/icons/logo sem fundo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    </button>
                </div>



                {/* Custom CSS Injection */}
                {profile.customCSS && (
                    <style dangerouslySetInnerHTML={{ __html: profile.customCSS }} />
                )}

                {/* Content Scrollable Area */}
                <div className={`px-6 pb-40 ${isPreview ? 'pt-12' : 'pt-16'} flex-1 flex flex-col min-h-full`}>

                    {/* Profile Section */}
                    <div className="flex flex-col items-center text-center mb-6 animate-fade-in mt-8">
                        <div className={`w-32 h-32 mb-4 rounded-full overflow-hidden border-4 ${currentTheme.avatarBorder} shadow-lg`}>
                            <img src={profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nodus'} alt={profile.name || 'Avatar'} className="w-full h-full object-cover bg-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 tracking-tight">{profile.name}</h3>
                        <p className="text-base font-medium opacity-90 leading-relaxed max-w-[300px]">{profile.bio}</p>
                    </div>

                    {/* Social Icons Row */}
                    {socialLinks.length > 0 && (
                        <div className="flex items-center justify-center gap-6 mb-10 animate-fade-in flex-wrap">
                            {socialLinks.map(link => {
                                const network = SOCIAL_NETWORKS.find(n => n.name === link.title) ||
                                    SOCIAL_NETWORKS.find(n => link.url.toLowerCase().includes(n.id)) ||
                                    SOCIAL_NETWORKS[0];

                                const Icon = network.icon || Globe;

                                return (
                                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer" onClick={() => handleLinkClick(link.id)} className={`${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass} hover:opacity-70 transition-opacity hover:scale-110 transform duration-200`}>
                                        <Icon size={40} />
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {/* Shop Carousel */}
                    {products.length > 0 && (
                        <div className="mb-6 w-full animate-fade-in">
                            <div className={`flex items-center gap-2 mb-3 text-base font-bold opacity-80 ${(profile.customBackground || currentTheme.id === 'glass') ? 'text-white' : currentTheme.textClass} px-1`}>
                                <ShoppingBag size={18} />
                                <span>Vitrine</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide snap-x">
                                {products.map(product => (
                                    <a key={product.id} href={product.url} target="_blank" rel="noreferrer" onClick={() => handleLinkClick(product.id)} className={`snap-start shrink-0 w-36 flex flex-col gap-2 group relative rounded-2xl ${currentTheme.id === 'glass' ? '' : 'p-3'}`}>
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

                    {/* Button Links List */}
                    <div className="space-y-4 w-full flex-1">
                        {buttonLinks.map(link => {

                            // COLLECTION
                            if (link.type === 'collection') {
                                const hasChildren = link.children && link.children.length > 0;
                                const activeChildren = link.children ? link.children.filter(c => c.isActive) : [];

                                if (!hasChildren && !activeChildren.length) return null;

                                return (
                                    <div key={link.id} className="w-full pt-2 pb-1">
                                        <div className="text-center mb-3 font-bold opacity-90 text-lg">
                                            {link.title}
                                        </div>

                                        <div className="space-y-4">
                                            {activeChildren.map(child => (
                                                <a
                                                    key={child.id}
                                                    href={child.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => handleLinkClick(child.id)}
                                                    className={`block w-full ${roundedClass} text-center text-base font-medium transition-all duration-300 transform group relative hover:scale-[1.02] active:scale-[0.98] ${currentTheme.id === 'glass' ? '' : `py-4 px-6 flex items-center justify-between ${!profile.customButtonColor ? currentTheme.buttonClass : ''} ${getHighlightClass(child.highlight)} overflow-hidden ${hasThemeShadow ? '' : 'shadow-sm'}`}`}
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
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // EMBED HANDLING
                            if (link.embedType === 'youtube') {
                                const videoId = link.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                                if (videoId) {
                                    return (
                                        <div key={link.id} className="w-full rounded-2xl overflow-hidden shadow-lg aspect-video mb-4">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title={link.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    );
                                }
                            }

                            if (link.embedType === 'spotify') {
                                const match = link.url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
                                if (match) {
                                    const [_, type, id] = match;
                                    return (
                                        <div key={link.id} className="w-full mb-4">
                                            <iframe
                                                style={{ borderRadius: '12px' }}
                                                src={`https://open.spotify.com/embed/${type}/${id}`}
                                                width="100%"
                                                height="152"
                                                frameBorder="0"
                                                allowFullScreen
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                            ></iframe>
                                        </div>
                                    );
                                }
                            }

                            // STANDARD LINK
                            return (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => handleLinkClick(link.id)}
                                    className={`block w-full ${roundedClass} text-center text-base font-medium transition-all duration-300 transform group relative hover:scale-[1.02] active:scale-[0.98] ${currentTheme.id === 'glass' ? '' : `py-4 px-6 flex items-center justify-between ${!profile.customButtonColor ? currentTheme.buttonClass : ''} ${getHighlightClass(link.highlight)} overflow-hidden ${hasThemeShadow ? '' : 'shadow-sm'}`}`}
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
                                            <span className="truncate flex-1 px-3 text-white text-lg">{link.title}</span>
                                            <span className="w-8 shrink-0"></span>
                                        </div>
                                    </GlassSurface>
                                        : (
                                            <>
                                                <div className="relative z-10 w-full flex items-center justify-between">
                                                    {link.image ? (
                                                        <img src={link.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0" />
                                                    ) : (
                                                        <span className="w-8"></span>
                                                    )}
                                                    <span className="truncate flex-1 px-3">{link.title}</span>
                                                    <span className="w-8 shrink-0"></span>
                                                </div>
                                            </>
                                        )}
                                </a>
                            );
                        })}

                        {activeLinks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50 space-y-2">
                                <span className="text-sm font-medium">Nenhum link ativo</span>
                            </div>
                        )}

                        {/* Theme-Integrated Support Button */}
                        {profile.supportKey && (
                            <a
                                href={profile.supportType === 'paypal' ? `https://${profile.supportKey}` : '#'}
                                onClick={(e) => {
                                    if (profile.supportType === 'pix') {
                                        e.preventDefault();
                                        alert(`Chave Pix copiada: ${profile.supportKey}`);
                                        navigator.clipboard.writeText(profile.supportKey);
                                    }
                                }}
                                className={`block w-full ${roundedClass} text-center text-base font-medium transition-all duration-300 transform group relative hover:scale-[1.02] active:scale-[0.98] ${currentTheme.id === 'glass' ? '' : `py-4 px-6 flex items-center justify-between ${!profile.customButtonColor ? currentTheme.buttonClass : ''} ${hasThemeShadow ? '' : 'shadow-sm'} overflow-hidden`}`}
                                style={!profile.customButtonColor ? {} : {
                                    backgroundColor: profile.customButtonColor,
                                    color: profile.customTextColor || (isDarkTheme ? '#fff' : '#000')
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
                                    : (
                                        <>
                                            <div className="relative z-10 w-full flex items-center justify-between">
                                                {profile.supportType === 'pix' ? (
                                                    <img src="https://img.icons8.com/?size=100&id=CuUOYOfd3Dy9&format=png&color=000000" alt="Pix" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-0.5" />
                                                ) : (
                                                    <img src="https://img.icons8.com/?size=100&id=34525&format=png&color=000000" alt="PayPal" className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shrink-0 p-1" />
                                                )}
                                                <span className="truncate flex-1 px-3">Apoiar</span>
                                                <span className="w-8 opacity-50 flex justify-end"><Coffee size={20} /></span>
                                            </div>
                                        </>
                                    )}
                            </a>
                        )}
                    </div>

                    {/* Newsletter Widget */}
                    {profile.showNewsletter && (
                        <div className="w-full px-2 animate-fade-in">
                            <NewsletterWidget profile={profile} />
                        </div>
                    )}

                    {/* Footer Text */}
                    <div className="mt-8 mb-6 flex flex-col items-center gap-3 w-full px-4">
                        <a href="https://nodus.cc" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                            <span className="text-sm font-bold text-black text-center">Junte-se a {profile.name} no Nodus</span>
                        </a>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileRenderer;
