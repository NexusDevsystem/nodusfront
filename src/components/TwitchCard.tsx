import React from 'react';
import { motion } from 'framer-motion';
import { Twitch, Users, ExternalLink, Radio } from 'lucide-react';

interface TwitchCardProps {
    username: string;
    displayName: string;
    followers: number;
    avatarUrl: string;
    isLive?: boolean;
    gameName?: string;
    streamTitle?: string;
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
    themeTextHex?: string;
    buttonRoundness?: string;
    isDark?: boolean;
    fontFamily?: string;
    fontWeight?: string | number;
    fontItalic?: boolean;
}

export const TwitchCard: React.FC<TwitchCardProps> = ({
    username,
    displayName,
    followers,
    avatarUrl,
    isLive = false,
    gameName,
    streamTitle,
    themeButtonClass = '',
    themeButtonStyle = {},
    themeTextHex = '',
    buttonRoundness = 'rounded-3xl',
    isDark = false,
    fontFamily,
    fontWeight,
    fontItalic
}) => {
    const formatFollowers = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'K';
        return count.toLocaleString();
    };

    return (
        <div className={`w-full overflow-hidden isolate relative group flex transition-all duration-300 ${themeButtonClass} h-[72px] p-0 items-center justify-between`}
            style={themeButtonStyle}>

            <div className="flex h-full items-center px-4 sm:px-5 gap-3.5 flex-1 min-w-0">
                {/* Avatar with Status */}
                <div className="relative shrink-0 flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full p-[2px] transition-transform duration-500 group-hover:scale-105 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-[#6441a5]'}`}>
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white">
                            <img src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Twitch'}
                                alt={displayName}
                                className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                    </div>
                    {isLive && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[7px] font-bold px-1 py-0.5 rounded-[3px] border border-white shadow-sm uppercase tracking-tighter z-20 whitespace-nowrap">
                            LIVE
                        </div>
                    )}
                </div>

                {/* Info Column - Balanced Vertical Centering */}
                <div className="flex-1 min-w-0 flex flex-col justify-center h-full text-left" style={{ fontFamily, fontWeight: (fontWeight || undefined), fontStyle: fontItalic ? 'italic' : 'normal' }}>
                    <div className="flex items-center gap-1.5 mb-1 opacity-50">
                        <Twitch size={8} className="shrink-0" style={{ color: themeTextHex }} />
                        <span className="text-[7px] uppercase tracking-[0.25em] leading-none font-bold" style={{ color: themeTextHex }}>
                            Twitch
                        </span>
                    </div>

                    <h4 className="text-[14px] sm:text-[16px] font-bold truncate tracking-tight uppercase leading-none mb-1.5" style={{ color: themeTextHex }}>
                        {displayName || username}
                    </h4>

                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                            <Users size={10} style={{ color: themeTextHex }} className="opacity-50" />
                            <span className="text-[10px] sm:text-[11px] font-bold leading-none" style={{ color: themeTextHex }}>
                                {formatFollowers(followers)}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider opacity-50 font-medium leading-none" style={{ color: themeTextHex }}>
                                seguidores
                            </span>
                        </div>

                        {isLive && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 rounded-full border border-red-500/10">
                                <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                                <span className="text-[8px] uppercase tracking-wider font-bold text-red-600">
                                    ON
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="shrink-0 h-full flex items-center pr-4 sm:pr-5">
                <ExternalLink size={16} style={{ color: themeTextHex }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Overlay link */}
            <a href={`https://twitch.tv/${username}`} target="_blank" rel="noreferrer" className="absolute inset-0 z-30 cursor-pointer" />

            {/* Subtle gloss effect if not live */}
            {!isLive && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
        </div>
    );
};
