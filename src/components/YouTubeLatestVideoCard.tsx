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
    fontItalic
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    if (!video?.id) return null;

    const handlePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPlaying(true);
    };

    return (
        <motion.div
            layout
            className={`w-full overflow-hidden relative group flex flex-col ${themeButtonClass}`}
            style={{ ...themeButtonStyle, height: 'auto', padding: 0 }}
        >
            {/* Header (Top) - Compact Style with Avatar on Left */}
            <div className="px-4 py-3 flex items-center gap-3 w-full relative border-b border-black/5">
                {/* Left: Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5 shadow-sm shrink-0">
                    <img src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${channelName}`} alt={channelName} className="w-full h-full object-cover" />
                </div>

                {/* Right: Info Column */}
                <div className="flex flex-col min-w-0">
                    <h2 className="text-[13px] md:text-[14px] font-black tracking-tight leading-tight uppercase" style={{ color: themeTextHex, fontFamily }}>
                        {localStorage.getItem('language') === 'pt' ? 'Último Vídeo do YouTube' : 'Latest YouTube Video'}
                    </h2>
                    
                    <div className="flex items-center gap-1.5 opacity-60 overflow-hidden mt-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold whitespace-nowrap overflow-hidden">
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
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&modestbranding=1&rel=0`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="w-full h-full cursor-pointer group relative" onClick={handlePlay}>
                        {/* Thumbnail */}
                        <img 
                            src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                            }}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Overlay Gradient for Title */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                        {/* Video Title (Overlay Bottom) */}
                        <div className="absolute bottom-0 left-0 w-full p-4 z-10">
                            <h3 className="text-white text-[14px] md:text-[15px] font-black leading-tight tracking-tight line-clamp-2 uppercase drop-shadow-lg" style={{ fontFamily }}>
                                {video.title}
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
