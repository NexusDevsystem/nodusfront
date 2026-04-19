import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ExternalLink, Play } from 'lucide-react';
import { KickIcon } from '../constants'; // Assumes KickIcon is exported from constants

interface KickCardProps {
    username: string;
    displayName: string;
    followers: number;
    avatarUrl: string;
    isLive?: boolean; // added back to avoid ts errors when called
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
    themeTextHex?: string;
    buttonRoundness?: string;
    isDark?: boolean;
    fontFamily?: string;
    fontWeight?: string | number;
    fontItalic?: boolean;
}

export const KickCard: React.FC<KickCardProps> = ({
    username,
    displayName,
    followers,
    avatarUrl,
    isLive = false,
    themeButtonClass = '',
    themeButtonStyle = {},
    themeTextHex = '',
    buttonRoundness = 'rounded-sm',
    isDark = false,
    fontFamily,
    fontWeight,
    fontItalic
}) => {
    const [imgError, setImgError] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);

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
                    <div className={`w-12 h-12 rounded-full p-[2px] transition-transform duration-500 group-hover:scale-105 ${isLive ? 'bg-[#53FC18] animate-pulse' : 'bg-[#53FC18]'}`}>
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white">
                            {!imgError && avatarUrl ? (
                                <img src={avatarUrl}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="w-full h-full bg-[#0B0E0F] flex items-center justify-center">
                                    <KickIcon size={24} style={{ color: '#53FC18' }} />
                                </div>
                            )}
                        </div>
                    </div>
                    {isLive && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 outline outline-2 outline-white text-[7px] font-black text-white px-1.5 py-0.5 rounded-full whitespace-nowrap z-10 shadow-lg scale-[0.85]">
                            AO VIVO
                        </div>
                    )}
                </div>

                {/* Info Column - Balanced Vertical Centering */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-left" style={{ fontFamily, fontWeight: (fontWeight || undefined), fontStyle: fontItalic ? 'italic' : 'normal' }}>
                    <div className="flex items-center gap-1.5 opacity-50">
                        <KickIcon size={8} className="shrink-0" style={{ color: themeTextHex }} />
                        <span className="text-[7px] uppercase tracking-[0.25em] leading-none font-bold" style={{ color: themeTextHex }}>
                            Kick
                        </span>
                    </div>

                    <h4 className="text-[14px] sm:text-[16px] font-bold whitespace-normal break-words tracking-tight uppercase leading-none my-1" style={{ color: themeTextHex }}>
                        @{displayName || username}
                    </h4>

                    <div className="flex items-center gap-2.5 overflow-hidden">
                        {followers > 0 ? (
                            <div className="flex items-center gap-1 opacity-60 min-w-0">
                                <Users size={10} style={{ color: themeTextHex }} className="opacity-50 shrink-0" />
                                <span className="text-[10px] sm:text-[11px] font-bold leading-none shrink-0" style={{ color: themeTextHex }}>
                                    {formatFollowers(followers)}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider opacity-50 font-medium leading-none whitespace-nowrap" style={{ color: themeTextHex }}>
                                    seguidores
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 opacity-50 min-w-0" style={{ color: themeTextHex }}>
                                <span className="text-[9px] uppercase tracking-wider font-medium leading-none whitespace-normal break-words">
                                    Canal Oficial
                                </span>
                            </div>
                        )}
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
                        <div className={`w-full h-full rounded-md overflow-hidden bg-black relative border border-white/10 ${isInteracting ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                            <iframe
                                src={`https://player.kick.com/${username}?autoplay=true&muted=true&playsinline=true`}
                                height="100%"
                                width="100%"
                                className="select-none"
                                frameBorder="0"
                                allow="autoplay; fullscreen; encrypted-media; picture-in-picture;"
                                allowFullScreen
                            ></iframe>
                        </div>

                        <div className="absolute inset-x-4 sm:inset-x-5 inset-y-0 z-20 pointer-events-none flex items-end justify-center pb-4">
                            <motion.button
                                whileHover={{}}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setIsInteracting(!isInteracting);
                                }}
                                className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-md flex items-center gap-2 text-xs font-bold shadow-2xl hover:bg-black/80 transition-colors uppercase tracking-wider"
                            >
                                {isInteracting ? (
                                    <><span className="w-2 h-2 rounded-full bg-[#53FC18]" /> BLOQUEAR PARA ANIMAR</>
                                ) : (
                                    <><Play size={12} className="fill-white" /> INTERAGIR NO PLAYER</>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay link */}
            <a href={`https://kick.com/${username}`} target="_blank" rel="noreferrer" className="absolute top-0 inset-x-0 h-[72px] z-30 cursor-pointer" />

            {/* Subtle gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
};
