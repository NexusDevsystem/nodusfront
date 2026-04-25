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
                                    Seguidores
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
            {/* Wrapper to enforce border radius safely */}
            <div className="w-full h-full overflow-hidden flex flex-col p-1.5" style={{ borderRadius: 'inherit' }}>
                
                {/* Header (Top) */}
                <div className="px-2 pt-2 pb-4 flex items-center justify-between w-full relative">
                    {/* Left: Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-black/5 shadow-sm shrink-0">
                        <img src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nodus'} alt={username} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Center: Text */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-none">
                        <span className="text-[12px] font-black tracking-tight leading-tight uppercase" style={{ color: themeTextHex, fontFamily }}>
                            {username}
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.2em] opacity-40 font-bold leading-none" style={{ color: themeTextHex, fontFamily }}>
                            Instagram
                        </span>
                    </div>

                    {/* Right: Spacer for balance */}
                    <div className="w-8 h-8" />
                </div>

                {/* Grid Container */}
                <div className={`w-full ${displayMedia.length > 0 ? 'mb-1' : ''}`}>
                    {displayMedia.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center aspect-[4/3] rounded-xl border-2 border-dashed border-black/5 ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50/50'}`}>
                            <Instagram size={28} className="opacity-10 mb-2" />
                            <span className="text-[11px] font-bold uppercase tracking-widest opacity-30 italic">Sem posts</span>
                        </div>
                    ) : (
                        <div className={`grid gap-1 ${
                            displayMedia.length === 1 ? 'grid-cols-1' : 
                            displayMedia.length === 2 ? 'grid-cols-2' : 
                            'grid-cols-3'
                        }`}>
                            {displayMedia.map((item) => (
                                <a 
                                    key={item.id} 
                                    href={item.permalink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={`relative aspect-square overflow-hidden rounded-md bg-slate-100 group/post transition-all duration-500 hover:shadow-lg shadow-sm`}
                                >
                                    <img 
                                        src={item.thumbnail_url || item.media_url} 
                                        alt={item.caption || ""} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/post:scale-105" 
                                        loading="lazy"
                                    />
                                    {item.media_type === 'VIDEO' && (
                                        <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-md p-1 rounded-sm">
                                            <Play size={10} fill="white" className="text-white" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover/post:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                        <Instagram size={16} className="text-white opacity-0 group-hover/post:opacity-40 transition-all duration-300" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer removed per user request */}
            </div>

            {/* Hidden overlay link for the whole card to profile */}
            <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="absolute inset-0 z-0 opacity-0" />
        </div>
    );
};
