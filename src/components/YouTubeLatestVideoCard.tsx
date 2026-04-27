import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Users, Play, ExternalLink } from 'lucide-react';

interface YouTubeLatestVideoCardProps {
    video: {
        id: string;
        title: string;
        url: string;
        published?: string;
    };
    channelName: string;
    avatarUrl?: string;
    subscribers?: string;
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
    themeTextHex?: string;
    fontFamily?: string;
    fontWeight?: string | number;
    fontItalic?: boolean;
    isLive?: boolean;
    channelId?: string;
}

export const YouTubeLatestVideoCard: React.FC<YouTubeLatestVideoCardProps> = ({
    video,
    channelName,
    avatarUrl,
    subscribers,
    themeButtonClass = '',
    themeButtonStyle = {},
    themeTextHex = '#000000',
    fontFamily,
    fontWeight,
    fontItalic,
    isLive: isLiveProp = false,
    channelId
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Auto-detect live from title if prop is false
    const isLive = isLiveProp || video?.title?.toLowerCase().includes('live') || video?.title?.includes('🔴') || video?.title?.includes('⭕');

    if (!video?.id && !isLive) return null;

    const handlePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPlaying(true);
    };

    const embedUrl = isLive && channelId 
        ? `https://www.youtube.com/embed/live_stream?autoplay=1&channel=${channelId}&modestbranding=1&rel=0`
        : `https://www.youtube.com/embed/${video.id}?autoplay=1&modestbranding=1&rel=0`;

    const thumbnailUrl = isLive && channelId
        ? `https://img.youtube.com/vi_webp/live/maxresdefault.webp` // Fallback, YouTube live thumbnails are tricky
        : `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;

    return (
        <motion.div
            layout
            className={`w-full overflow-hidden relative group flex flex-col ${themeButtonClass}`}
            style={{ ...themeButtonStyle, height: 'auto', padding: 0 }}
        >
            {/* Header (Top) - Avatar Left, Text Centered */}
            <div className="px-4 py-3 flex items-center w-full relative border-b border-black/5 min-h-[64px]">
                {/* Left: Avatar */}
                <div className="relative shrink-0 z-10">
                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm ${isLive ? 'border-red-600 animate-pulse' : 'border-black/5'}`}>
                        <img src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${channelName}`} alt={channelName} className="w-full h-full object-cover" />
                    </div>
                    {isLive && (
                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-[6px] font-black text-white px-1 py-0.5 rounded shadow-sm border border-white uppercase">
                            Live
                        </div>
                    )}
                </div>

                {/* Center: Text Column */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-16 pointer-events-none">
                    <h2 className={`text-[12px] md:text-[13px] font-black tracking-tight leading-tight uppercase flex items-center gap-2`} style={{ color: isLive ? '#ef4444' : themeTextHex, fontFamily }}>
                        {isLive && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                        {isLive 
                            ? (localStorage.getItem('language') === 'pt' ? 'AO VIVO AGORA' : 'LIVE NOW')
                            : (localStorage.getItem('language') === 'pt' ? 'Último Vídeo do YouTube' : 'Latest YouTube Video')
                        }
                    </h2>
                    
                    <div className="flex items-center justify-center gap-1.5 opacity-60 overflow-hidden mt-0.5">
                        <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold whitespace-nowrap overflow-hidden">
                            <span style={{ color: themeTextHex }}>{channelName.startsWith('@') ? channelName : `@${channelName}`}</span>
                            {subscribers && (
                                <>
                                    <span className="opacity-40">•</span>
                                    <span style={{ color: themeTextHex }}>{subscribers}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Thumbnail / Video Area */}
            <div className="w-full aspect-video relative overflow-hidden bg-black">
                {isPlaying ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title={video.title || 'YouTube Live'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="w-full h-full cursor-pointer group relative" onClick={handlePlay}>
                        {/* Thumbnail */}
                        <img 
                            src={thumbnailUrl}
                            onError={(e) => {
                                if (!isLive) {
                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                                } else {
                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi_webp/live/hqdefault.webp`;
                                }
                            }}
                            alt={video.title || 'YouTube Live'}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Overlay Gradient for Title */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                        {/* LIVE Badge */}
                        {isLive && (
                            <div className="absolute top-4 left-4 z-20 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                LIVE
                            </div>
                        )}

                        {/* Video Title (Overlay Bottom) */}
                        <div className="absolute bottom-0 left-0 w-full p-4 z-10">
                            <h3 className="text-white text-[14px] md:text-[15px] font-black leading-tight tracking-tight line-clamp-2 uppercase drop-shadow-lg" style={{ fontFamily }}>
                                {isLive ? (video.title || (localStorage.getItem('language') === 'pt' ? 'Assista à Live' : 'Watch the Stream')) : video.title}
                            </h3>
                        </div>

                        {/* Play Button (Center) */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                             <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <Play size={28} fill="white" className="text-white ml-1" />
                             </div>
                        </div>

                        {/* External Link Hover */}
                        <a 
                            href={video.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink size={14} />
                        </a>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
