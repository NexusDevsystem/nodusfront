import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface TikTokEmbedProps {
    url: string;
    title: string;
    videoUrl?: string;
    className?: string;
}

const TikTokEmbed: React.FC<TikTokEmbedProps> = ({ url, title, videoUrl, className = '' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Regex to extract video ID from TikTok URLs (Keep as fallback for iframe)
    const videoId = url.match(/\/video\/(\d+)/)?.[1] ||
        url.match(/(?:vm|v|t|vt)\.tiktok\.com\/([a-zA-Z0-9]+)/)?.[1] ||
        url.match(/v=(\d+)/)?.[1];

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    // If we have a direct videoUrl, use a clean native player
    if (videoUrl && !hasError) {
        return (
            <div className={`relative w-full overflow-hidden border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] aspect-[9/16] max-h-[650px] bg-black group rounded-2xl ${className}`}>
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={() => setHasError(true)}
                />

                {/* Unmute Overlay/Button */}
                <button
                    onClick={toggleMute}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Aesthetic Gradient Overlay (Bottom) */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-16 z-10 pointer-events-none">
                    <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-md">
                        {title || 'Vídeo do TikTok'}
                    </p>
                </div>
            </div>
        );
    }

    // Fallback to Iframe if direct videoUrl is not available or fails
    // FALLBACK: Standard TikTok Embed
    return (
        <div className={`relative w-full overflow-hidden border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] aspect-[9/16] max-h-[650px] bg-white group rounded-2xl ${className}`}>
            <iframe
                src={`https://www.tiktok.com/embed/v2/${videoId}`}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                scrolling="no"
                title={title || "TikTok Video"}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                style={{ overflow: 'hidden' }}
            />
        </div>
    );
}

export default TikTokEmbed;
