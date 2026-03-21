import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isMuted, setIsMuted] = React.useState(true);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Twitch PostMessage API attempt
        iframeRef.current?.contentWindow?.postMessage({
            method: 'setMuted',
            args: [!isMuted]
        }, '*');
        
        setIsMuted(!isMuted);
    };

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'K';
        return count.toLocaleString();
    };

    return (
        <motion.div 
            layout
            initial={false}
            animate={{ 
                height: isLive ? 'auto' : 72
            }}
            transition={{
                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
            }}
            className={`w-full overflow-hidden isolate relative group flex flex-col ${themeButtonClass} p-0`}
            style={{ ...themeButtonStyle }}>

            <div className="flex h-[72px] items-center px-4 sm:px-5 gap-3.5 w-full shrink-0">
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
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 outline outline-2 outline-white text-[7px] font-black text-white px-1.5 py-0.5 rounded-full whitespace-nowrap z-10 shadow-lg scale-[0.85]">
                            AO VIVO
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
                    </div>
                </div>

                {/* Action Area */}
                <div className="shrink-0 h-full flex items-center pr-4">
                    <ExternalLink size={16} style={{ color: themeTextHex }} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Live Embed Area */}
            <AnimatePresence>
                {isLive && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full aspect-video mt-1 mb-4 px-4 sm:px-5 relative group/embed overflow-hidden"
                    >
                        <div className="w-full h-full rounded-2xl overflow-hidden bg-black relative border border-white/10 pointer-events-none">
                            <iframe
                                ref={iframeRef}
                                src={`https://player.twitch.tv/?autoplay=true&muted=true&channel=${username}&parent=${window.location.hostname}&controls=false&playsinline=true`}
                                height="100%"
                                width="100%"
                                title="Twitch Live Stream"
                                className="select-none"
                                frameBorder="0"
                                allow="autoplay; fullscreen; encrypted-media; picture-in-picture;"
                                allowFullScreen
                            ></iframe>
                        </div>
                        
                        {/* Remote Control Overlay */}
                        <div className="absolute inset-x-4 sm:inset-x-5 inset-y-0 z-20 pointer-events-none flex items-end justify-center pb-4">
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleMute}
                                className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-2xl hover:bg-black/80 transition-colors uppercase tracking-wider"
                            >
                                {isMuted ? (
                                    <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> DESMUTAR SOM</>
                                ) : (
                                    <><span className="w-2 h-2 rounded-full bg-green-500" /> MUTAR SOM</>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay link */}
            <a href={`https://twitch.tv/${username}`} target="_blank" rel="noreferrer" className="absolute top-0 inset-x-0 h-[72px] z-30 cursor-pointer" />

            {/* Subtle gloss effect if not live */}
            {!isLive && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
        </motion.div>
    );
};
