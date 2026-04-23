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
    buttonRoundness = 'rounded-sm',
    isDark = false,
    variant = 'feed',
    fontFamily,
    fontWeight,
    fontItalic
}) => {
    // We take up to 6 items for the dynamic grid layout
    const displayMedia = media.slice(0, 6);

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'K';
        return count.toLocaleString();
    };

    if (variant === 'profile') {
        return (
            <div className={`w-full overflow-hidden isolate relative group flex transition-all duration-300 ${themeButtonClass} min-h-[72px] h-auto py-3 px-0 items-center justify-between`}
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
                    <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center" style={{ fontFamily, fontWeight: (fontWeight || undefined), fontStyle: fontItalic ? 'italic' : 'normal' }}>
                        {/* Header Label */}
                        <div className="flex items-center justify-center gap-1.5 opacity-50">
                            <Instagram size={8} className="shrink-0" style={{ color: themeTextHex }} />
                            <span className="text-[7px] uppercase tracking-[0.25em] leading-none font-bold" style={{ color: themeTextHex }}>
                                Instagram
                            </span>
                        </div>

                        {/* Name/Username */}
                        <h4 className="text-[14px] sm:text-[16px] font-bold whitespace-normal break-words tracking-tight uppercase leading-none my-1" style={{ color: themeTextHex }}>
                            @{username}
                        </h4>

                        {/* Stats Row */}
                        <div className="flex items-center justify-center gap-2.5 overflow-hidden">
                            <div className="flex items-center justify-center gap-1 opacity-60 min-w-0">
                                <Users size={10} style={{ color: themeTextHex }} className="opacity-50 shrink-0" />
                                <span className="text-[10px] sm:text-[11px] font-bold leading-none shrink-0" style={{ color: themeTextHex }}>
                                    {formatFollowers(followers)}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider opacity-50 font-medium leading-none whitespace-nowrap" style={{ color: themeTextHex }}>
                                    seguidores
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Area - Balanced Spacer to match Avatar width (approx 48px + gap) */}
                <div className="shrink-0 w-[48px] sm:w-[56px] flex items-center justify-center">
                    <ExternalLink size={16} style={{ color: themeTextHex }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Overlay link */}
                <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="absolute inset-0 z-30 cursor-pointer" />
            </div>
        );
    }

    return (
        <div className={`w-full overflow-hidden isolate relative group flex flex-col transition-all duration-300 ${themeButtonClass}`}
            style={{ ...themeButtonStyle, height: 'auto' }}>

            {/* Wrapper to enforce border radius safely */}
            <div className="w-full h-full overflow-hidden flex flex-col" style={{ borderRadius: 'inherit' }}>
                {/* Dynamic Media Grid */}
                <div className={`overflow-hidden border-b border-black/5 ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                <div className="aspect-square sm:aspect-video w-full">
                    {displayMedia.length === 1 && (
                        <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item">
                            <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105" alt="" loading="lazy" decoding="async" />
                        </a>
                    )}

                    {displayMedia.length === 2 && (
                        <div className="grid grid-cols-2 h-full gap-[2px] bg-black/5">
                            {displayMedia.map(item => (
                                <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden bg-white">
                                    <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" loading="lazy" decoding="async" />
                                </a>
                            ))}
                        </div>
                    )}

                    {displayMedia.length === 3 && (
                        <div className="grid grid-cols-3 h-full gap-[2px] bg-black/5">
                            <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer" className="col-span-2 h-full block group/item overflow-hidden bg-white">
                                <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" loading="lazy" decoding="async" />
                            </a>
                            <div className="grid grid-rows-2 gap-[2px] bg-black/5">
                                {displayMedia.slice(1, 3).map(item => (
                                    <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden bg-white">
                                        <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" loading="lazy" decoding="async" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {displayMedia.length === 4 && (
                        <div className="grid grid-cols-2 grid-rows-2 h-full gap-[2px] bg-black/5">
                            {displayMedia.map(item => (
                                <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden bg-white">
                                    <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" loading="lazy" decoding="async" />
                                </a>
                            ))}
                        </div>
                    )}

                    {displayMedia.length === 5 && (
                        <div className="grid grid-cols-3 grid-rows-2 h-full gap-[2px] bg-black/5">
                            <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer"
                                className="row-span-2 relative overflow-hidden group/item bg-white">
                                <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" loading="lazy" decoding="async" />
                                {displayMedia[0].media_type === 'VIDEO' && (
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded-md border border-black/10">
                                        <Play size={10} fill="black" className="text-black" />
                                    </div>
                                )}
                            </a>
                            {displayMedia.slice(1, 5).map((item) => (
                                <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer"
                                    className="relative overflow-hidden group/item bg-white">
                                    <img src={item.thumbnail_url || item.media_url}
                                        alt=""
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" loading="lazy" decoding="async" />
                                    {item.media_type === 'VIDEO' && (
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-0.5 rounded-sm border border-black/10">
                                            <Play size={8} fill="black" className="text-black" />
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    )}

                    {displayMedia.length >= 6 && (
                        <div className="grid grid-cols-3 grid-rows-3 h-full gap-[2px] bg-black/5">
                            <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer"
                                className="col-span-2 row-span-2 relative overflow-hidden group/item bg-white">
                                <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105" loading="lazy" decoding="async" />
                                {displayMedia[0].media_type === 'VIDEO' && (
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded-md border border-black/10">
                                        <Play size={12} fill="black" className="text-black" />
                                    </div>
                                )}
                            </a>
                            <div className="grid grid-rows-2 gap-[2px] col-span-1 bg-black/5">
                                {displayMedia.slice(1, 3).map((item) => (
                                    <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer"
                                        className="relative overflow-hidden group/item bg-white">
                                        <img src={item.thumbnail_url || item.media_url}
                                            alt=""
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" loading="lazy" decoding="async" />
                                        {item.media_type === 'VIDEO' && (
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-0.5 rounded-sm border border-black/10">
                                                <Play size={8} fill="black" className="text-black" />
                                            </div>
                                        )}
                                    </a>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-[2px] col-span-3 bg-black/5">
                                {displayMedia.slice(3, 6).map((item) => (
                                    <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer"
                                        className="relative overflow-hidden group/item bg-white">
                                        <img src={item.thumbnail_url || item.media_url}
                                            alt=""
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" loading="lazy" decoding="async" />
                                        {item.media_type === 'VIDEO' && (
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-0.5 rounded-sm border border-black/10">
                                                <Play size={8} fill="black" className="text-black" />
                                            </div>
                                        )}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {displayMedia.length === 0 && (
                        <div className={`flex flex-col items-center justify-center h-full p-10 text-center gap-3 ${isDark ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                            <div className="w-12 h-12 rounded-md border-2 border-dashed border-black/10 flex items-center justify-center">
                                <Instagram size={24} className="opacity-20" />
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] italic opacity-40">
                                Nenhum post disponível
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Compact Footer Area */}
            <div className="px-4 py-4 flex flex-col items-center gap-1.5" style={{ fontFamily, fontWeight: (fontWeight || undefined), fontStyle: fontItalic ? 'italic' : 'normal' }}>
                <div className="flex items-center gap-1.5 opacity-40">
                    <Instagram size={10} style={{ color: themeTextHex }} />
                    <span className="text-[8px] tracking-[0.25em] uppercase font-bold" style={{ color: themeTextHex }}>Instagram</span>
                </div>

                {/* Profile Information */}
                <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer"
                    className="flex flex-col items-center gap-0.5 transition-all hover:scale-105 active:scale-95 group/pill w-full overflow-hidden">
                    <span className="text-[12px] font-black tracking-tight uppercase whitespace-normal break-words w-full text-center" style={{ color: themeTextHex }}>@{username}</span>
                    <div className="flex items-center justify-center gap-1.5 opacity-60 w-full overflow-hidden">
                        <Users size={10} style={{ color: themeTextHex }} className="shrink-0" />
                        <span className="text-[9px] font-bold tracking-tight uppercase whitespace-nowrap" style={{ color: themeTextHex }}>{followers.toLocaleString()} seguidores</span>
                    </div>
                </a>
            </div>
            </div>
        </div>
    );
};
