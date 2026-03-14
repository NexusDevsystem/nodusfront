import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Users, ExternalLink, Play } from 'lucide-react';

interface InstagramCardProps {
    username: string;
    followers: number;
    avatarUrl: string;
    media: any[];
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
    themeTextHex?: string;
    buttonRoundness?: string;
    isDark?: boolean;
    variant?: 'feed' | 'profile';
    fontFamily?: string;
    fontWeight?: string | number;
    fontItalic?: boolean;
}

export const InstagramCard: React.FC<InstagramCardProps> = ({
    username,
    followers,
    avatarUrl,
    media = [],
    themeButtonClass = '',
    themeButtonStyle = {},
    themeTextHex = '',
    buttonRoundness = 'rounded-3xl',
    isDark = false,
    variant = 'feed',
    fontFamily,
    fontWeight,
    fontItalic
}) => {
    // We take up to 6 items for the dynamic grid layout
    const displayMedia = media.slice(0, 6);

    if (variant === 'profile') {
        const formatFollowers = (count: number) => {
            if (count >= 1000000) return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
            if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'K';
            return count.toLocaleString();
        };

        return (
            <div className={`w-full overflow-hidden isolate relative group flex transition-all duration-300 ${themeButtonClass} h-[72px] p-0 items-center justify-between`}
                style={themeButtonStyle}>

                <div className="flex h-full items-center px-4 sm:px-5 gap-3.5 flex-1 min-w-0">
                    {/* Avatar with Ring */}
                    <div className="relative shrink-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] transition-transform duration-500 group-hover:scale-105">
                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white">
                                <img src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nodus'}
                                    alt={username}
                                    className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            </div>
                        </div>
                    </div>

                    {/* Info Column - Balanced Vertical Centering */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center h-full text-left" style={{ fontFamily, fontWeight: (fontWeight || undefined), fontStyle: fontItalic ? 'italic' : 'normal' }}>
                        {/* Header Label */}
                        <div className="flex items-center gap-1.5 mb-1 opacity-50">
                            <Instagram size={8} className="shrink-0" style={{ color: themeTextHex }} />
                            <span className="text-[7px] uppercase tracking-[0.25em] leading-none font-bold" style={{ color: themeTextHex }}>
                                Instagram
                            </span>
                        </div>

                        {/* Name/Username */}
                        <h4 className="text-[14px] sm:text-[16px] font-bold truncate tracking-tight uppercase leading-none mb-1.5" style={{ color: themeTextHex }}>
                            @{username}
                        </h4>

                        {/* Stats Row */}
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1 opacity-80">
                                <Users size={10} style={{ color: themeTextHex }} className="opacity-50" />
                                <span className="text-[10px] sm:text-[11px] font-bold leading-none" style={{ color: themeTextHex }}>
                                    {formatFollowers(followers)}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider opacity-50 font-medium leading-none" style={{ color: themeTextHex }}>
                                    seguidores
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Area */}
                <div className="shrink-0 h-full flex items-center pr-4 sm:pr-5">
                    <ExternalLink size={16} style={{ color: themeTextHex }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Overlay link */}
                <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="absolute inset-0 z-30 cursor-pointer" />

                {/* Subtle gloss effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        );
    }

    return (
        <div className={`w-full overflow-hidden isolate relative group flex flex-col transition-all duration-300 ${themeButtonClass} hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]`}
            style={themeButtonStyle}>

            {/* Dynamic Media Grid */}
            <div className="bg-white/5 aspect-[16/10] overflow-hidden">
                {displayMedia.length === 1 && (
                    <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item">
                        <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105" alt="" loading="lazy" decoding="async" />
                    </a>
                )}

                {displayMedia.length === 2 && (
                    <div className="grid grid-cols-2 h-full gap-[2px]">
                        {displayMedia.map(item => (
                            <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden">
                                <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" loading="lazy" decoding="async" />
                            </a>
                        ))}
                    </div>
                )}

                {displayMedia.length === 3 && (
                    <div className="grid grid-cols-3 h-full gap-[2px]">
                        <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer" className="col-span-2 h-full block group/item overflow-hidden">
                            <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" loading="lazy" decoding="async" />
                        </a>
                        <div className="grid grid-rows-2 gap-[2px]">
                            {displayMedia.slice(1, 3).map(item => (
                                <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden">
                                    <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" loading="lazy" decoding="async" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {displayMedia.length === 4 && (
                    <div className="grid grid-cols-2 grid-rows-2 h-full gap-[2px]">
                        {displayMedia.map(item => (
                            <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden">
                                <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" loading="lazy" decoding="async" />
                            </a>
                        ))}
                    </div>
                )}

                {displayMedia.length === 5 && (
                    <div className="grid grid-cols-3 grid-rows-2 h-full gap-[2px]">
                        <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer"
                            className="row-span-2 relative overflow-hidden group/item">
                            <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" loading="lazy" decoding="async" />
                            {displayMedia[0].media_type === 'VIDEO' && (
                                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-md">
                                    <Play size={10} fill="white" className="text-white" />
                                </div>
                            )}
                        </a>
                        {displayMedia.slice(1, 5).map((item) => (
                            <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer"
                                className="relative overflow-hidden group/item">
                                <img src={item.thumbnail_url || item.media_url}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" loading="lazy" decoding="async" />
                                {item.media_type === 'VIDEO' && (
                                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-md">
                                        <Play size={8} fill="white" className="text-white" />
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                )}

                {displayMedia.length >= 6 && (
                    <div className="grid grid-cols-3 grid-rows-3 h-full gap-[2px]">
                        <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer"
                            className="col-span-2 row-span-2 relative overflow-hidden group/item">
                            <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105" loading="lazy" decoding="async" />
                            {displayMedia[0].media_type === 'VIDEO' && (
                                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-md">
                                    <Play size={10} fill="white" className="text-white" />
                                </div>
                            )}
                        </a>
                        <div className="grid grid-rows-2 gap-[2px] col-span-1">
                            {displayMedia.slice(1, 3).map((item) => (
                                <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer"
                                    className="relative overflow-hidden group/item">
                                    <img src={item.thumbnail_url || item.media_url}
                                        alt=""
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" loading="lazy" decoding="async" />
                                    {item.media_type === 'VIDEO' && (
                                        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-md">
                                            <Play size={8} fill="white" className="text-white" />
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-[2px] col-span-3">
                            {displayMedia.slice(3, 6).map((item) => (
                                <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer"
                                    className="relative overflow-hidden group/item">
                                    <img src={item.thumbnail_url || item.media_url}
                                        alt=""
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" loading="lazy" decoding="async" />
                                    {item.media_type === 'VIDEO' && (
                                        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-md">
                                            <Play size={8} fill="white" className="text-white" />
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {displayMedia.length === 0 && (
                    <div className="flex items-center justify-center bg-zinc-950/60 text-zinc-500 text-[10px] font-bold uppercase tracking-widest italic min-h-[120px]">
                        Nenhum post disponível
                    </div>
                )}
            </div>

            {/* Ultra Compact Unified Footer Area */}
            <div className="px-3 py-2.5 flex flex-col items-center gap-0.5 mt-auto relative" style={{ fontFamily, fontWeight: (fontWeight || undefined), fontStyle: fontItalic ? 'italic' : 'normal' }}>
                {/* Subtle separator - keeping it very light to not distract */}
                <div className="absolute top-0 left-3 right-3 h-[1px] bg-current opacity-20" style={{ color: themeTextHex }} />

                <h3 className="text-[9px] tracking-[0.2em] uppercase" style={{ color: themeTextHex }}>Instagram</h3>

                {/* Profile Information - Maximum contrast for the @username */}
                <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 transition-opacity hover:opacity-70 active:scale-[0.98] group/pill">
                    <div className="w-3 h-3 flex items-center justify-center group-hover/pill:opacity-100 transition-opacity">
                        <Instagram size={9} style={{ color: themeTextHex }} strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                        <span className="text-[8px] tracking-tight uppercase" style={{ color: themeTextHex }}>{username}</span>
                        <span className="opacity-20 text-[8px]" style={{ color: themeTextHex }}>|</span>
                        <span className="text-[8px] tracking-tight uppercase" style={{ color: themeTextHex }}>{followers.toLocaleString()} seguidores</span>
                    </div>
                </a>
            </div>
        </div>
    );
};
