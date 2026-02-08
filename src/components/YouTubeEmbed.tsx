import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface YouTubeEmbedProps {
    url: string;
    title: string;
    className?: string; // Allow passing extra classes like 'rounded-2xl' etc
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url, title, className = '' }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];

    if (!videoId) return null;

    if (isPlaying) {
        return (
            <div className={`w-full overflow-hidden shadow-lg aspect-video ${className}`}>
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
            className={`relative w-full overflow-hidden shadow-lg aspect-video group cursor-pointer ${className}`}
            onClick={() => setIsPlaying(true)}
        >
            {/* Thumbnail */}
            <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                onError={(e) => {
                    // Fallback if maxres doesn't exist
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

            {/* Custom Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                    <Play size={32} fill="white" className="text-white ml-1" />
                </div>
            </div>
        </div>
    );
};

export default YouTubeEmbed;
