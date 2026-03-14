import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';

interface YouTubeEmbedProps {
    url: string;
    title: string;
    className?: string; // Allow passing extra classes like 'rounded-2xl' etc
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url, title, className = '' }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];

    if (!videoId) return null;

    if (isPlaying) {
        return (
            <div className={`w-full overflow-hidden border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] aspect-video ${className}`}>
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
            className={`relative w-full overflow-hidden border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] aspect-video group cursor-pointer ${className}`}
            onClick={() => setIsPlaying(true)}
        >
            {/* Thumbnail */}
            <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                onError={(e) => {
                    // Fallback if maxres doesn't exist
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlays / Gradients for readability */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors duration-300" />

            {/* Bottom Gradient for title */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

            {/* YouTube Logo (Top Left) - Scaled down even more */}
            <div className="absolute top-2.5 left-2.5 z-10 transition-transform group-hover:scale-110">
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
                <div className="transition-all duration-300 group-hover:scale-110 group-hover:opacity-100 opacity-80 drop-shadow-[0_0_15px_rgba(26,26,26,0.4)]">
                    <Play size={32} fill="white" className="text-white ml-0.5" />
                </div>
            </div>
        </div>
    );
};

export default YouTubeEmbed;
