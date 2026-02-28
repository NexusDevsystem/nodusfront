import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Users, ExternalLink, Play } from 'lucide-react';

interface YouTubeCardProps {
    username: string;
    title: string;
    subscribers: number;
    avatarUrl: string;
    videoCount?: number;
    viewCount?: number;
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
    themeTextHex?: string;
    buttonRoundness?: string;
    isDark?: boolean;
    fontFamily?: string;
    fontWeight?: string | number;
    fontItalic?: boolean;
}

export const YouTubeCard: React.FC<YouTubeCardProps> = ({
    username,
    title,
    subscribers,
    avatarUrl,
    themeButtonClass = '',
    themeButtonStyle = {},
    themeTextHex = '',
    buttonRoundness = 'rounded-3xl',
    isDark = false,
    fontFamily,
    fontWeight,
    fontItalic
}) => {
    const formatCount = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'K';
        return count.toLocaleString();
    };

    return (
        <div className={`w-full overflow-hidden isolate relative group flex transition-all duration-300 ${themeButtonClass} h-[80px] p-0 items-center justify-between`}
            style={themeButtonStyle}>

            <div className="flex h-full items-center px-4 sm:px-5 gap-3.5 flex-1 min-w-0">
                {/* Avatar */}
                <div className="relative shrink-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full p-[2px] transition-transform duration-500 group-hover:scale-105 bg-[#ff0000]">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white">
                            <img
                                src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=YouTube'}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-center h-full text-left" style={{ fontFamily, fontWeight: (fontWeight || undefined), fontStyle: fontItalic ? 'italic' : 'normal' }}>
                    <div className="flex items-center gap-1.5 mb-1 opacity-50">
                        <Youtube size={8} className="shrink-0 text-[#ff0000]" />
                        <span className="text-[7px] uppercase tracking-[0.25em] leading-none font-bold" style={{ color: themeTextHex }}>
                            YouTube
                        </span>
                    </div>

                    <h4 className="text-[14px] sm:text-[16px] font-bold truncate tracking-tight uppercase leading-none mb-1.5" style={{ color: themeTextHex }}>
                        {title}
                    </h4>

                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                            <Users size={10} style={{ color: themeTextHex }} className="opacity-50" />
                            <span className="text-[10px] sm:text-[11px] font-bold leading-none" style={{ color: themeTextHex }}>
                                {formatCount(subscribers)}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider opacity-50 font-medium leading-none" style={{ color: themeTextHex }}>
                                inscritos
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="shrink-0 h-full flex items-center pr-4 sm:pr-5">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <ExternalLink size={14} style={{ color: themeTextHex }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Overlay link */}
            <a href={username.startsWith('http') ? username : `https://youtube.com/@${username}`} target="_blank" rel="noreferrer" className="absolute inset-0 z-30 cursor-pointer" />

            {/* Subtle red glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ff000005] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
};
