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
    // We only need 5 items for the specific grid layout (1 big + 4 small)
    const displayMedia = media.slice(0, 5);

    if (variant === 'profile') {
        const formatFollowers = (count: number) => {
            if (count >= 1000000) return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
            if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'K';
            return count.toLocaleString();
        };

        return (
            <div className={`w-full overflow-hidden isolate relative group flex transition-all duration-300 ${themeButtonClass} p-2 sm:p-2.5 gap-2.5 items-center pl-3 sm:pl-3.5`}
                style={themeButtonStyle}>

                {/* Avatar with Ring - Even More Compact */}
                <div className="relative shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[1px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                        <div className="w-full h-full rounded-full overflow-hidden border border-white bg-white">
                            <img
                                src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nodus'}
                                alt={username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Info Column - Tight Spacing */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-left" style={{ fontFamily, fontWeight: (fontWeight || undefined), fontStyle: fontItalic ? 'italic' : 'normal' }}>
                    <div className="flex items-center gap-1 mb-0">
                        <Instagram size={7} className="shrink-0 opacity-70" style={{ color: themeTextHex }} />
                        <span className="text-[7px] uppercase tracking-[0.05em] leading-none opacity-70" style={{ color: themeTextHex }}>
                            Instagram
                        </span>
                    </div>
                    <h4 className="text-[11px] sm:text-xs truncate tracking-tight uppercase leading-snug" style={{ color: themeTextHex }}>
                        @{username}
                    </h4>
                    <div className="flex items-center gap-1 mt-0">
                        <span className="text-[9px] sm:text-[10px]" style={{ color: themeTextHex }}>
                            {formatFollowers(followers)}
                        </span>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-tight opacity-70" style={{ color: themeTextHex }}>
                            seguidores
                        </span>
                    </div>
                </div>

                {/* Arrow/Action */}
                <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black/5 group-hover:bg-black/10 transition-all mr-0.5">
                    <ExternalLink size={10} style={{ color: themeTextHex }} />
                </div>

                <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="absolute inset-0 z-10" />
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
                        <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105" alt="" />
                    </a>
                )}

                {displayMedia.length === 2 && (
                    <div className="grid grid-cols-2 h-full gap-[2px]">
                        {displayMedia.map(item => (
                            <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden">
                                <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" />
                            </a>
                        ))}
                    </div>
                )}

                {displayMedia.length === 3 && (
                    <div className="grid grid-cols-3 h-full gap-[2px]">
                        <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer" className="col-span-2 h-full block group/item overflow-hidden">
                            <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" />
                        </a>
                        <div className="grid grid-rows-2 gap-[2px]">
                            {displayMedia.slice(1, 3).map(item => (
                                <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden">
                                    <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {displayMedia.length === 4 && (
                    <div className="grid grid-cols-2 grid-rows-2 h-full gap-[2px]">
                        {displayMedia.map(item => (
                            <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="w-full h-full block group/item overflow-hidden">
                                <img src={item.thumbnail_url || item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" />
                            </a>
                        ))}
                    </div>
                )}

                {displayMedia.length >= 5 && (
                    <div className="grid grid-cols-3 grid-rows-2 h-full gap-[2px]">
                        <a href={displayMedia[0].permalink} target="_blank" rel="noreferrer"
                            className="row-span-2 relative overflow-hidden group/item">
                            <img src={displayMedia[0].thumbnail_url || displayMedia[0].media_url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
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
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                                {item.media_type === 'VIDEO' && (
                                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-md">
                                        <Play size={8} fill="white" className="text-white" />
                                    </div>
                                )}
                            </a>
                        ))}
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
