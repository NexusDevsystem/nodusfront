import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';

interface YouTubeEmbedProps {
    url: string;
    title: string;
    className?: string; // Allow passing extra classes like 'rounded-md' etc
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ 
    url, 
    title, 
    className = '',
    themeButtonClass = '',
    themeButtonStyle = {}
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];

    if (!videoId) return null;

    if (isPlaying) {
        return (
            <div 
                className={`w-full overflow-hidden aspect-video ${themeButtonClass} ${className}`}
                style={themeButtonStyle}
            >
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    return (
        <div
            className={`relative w-full overflow-hidden aspect-video group cursor-pointer ${themeButtonClass} ${className}`}
            style={themeButtonStyle}
            onClick={() => setIsPlaying(true)}
        >
            {/* Thumbnail */}
            <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                onError={(e) => {
                    // Fallback if maxres doesn't exist
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700"
            />

            {/* Overlays / Gradients for readability removed as per user request */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-[#ffdf00]/15 transition-colors duration-300" />

            {/* YouTube Logo (Top Left) - Scaled down even more */}
            <div className="absolute top-2.5 left-2.5 z-10 transition-transform">
                <div className="w-6 h-6 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg">
                    <FaYoutube size={12} className="text-white" />
                </div>
            </div>

            {/* Video Title (Bottom Left) - More compact size */}
            <div className="absolute bottom-0 left-0 w-full p-3.5 z-10">
                <h3 className="text-white text-[12px] md:text-[13px] font-bold leading-tight drop-shadow-md text-left tracking-tight line-clamp-2 uppercase">
                    {title}
                </h3>
            </div>

            {/* Custom Play Button - Scaled down even more, NO BACKGROUND */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="transition-all duration-300 group-hover:opacity-100 opacity-80 drop-shadow-[0_0_15px_rgba(26,26,26,0.4)]">
                    <Play size={32} fill="white" className="text-white ml-0.5" />
                </div>
            </div>
        </div>
    );
};

export default YouTubeEmbed;
