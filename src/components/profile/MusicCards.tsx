import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkItem, UserProfile } from '../../types';
import { ChevronUp, Music, Play, ChevronDown, X } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';
import BackgroundLayer from '../BackgroundLayer';

interface MusicRichCardProps {
    link: LinkItem;
    handleLinkClick: (id: string) => void;
    baseCardClass: string;
    mainButtonStyle: React.CSSProperties;
    effectiveFontFamily: string;
    profile: UserProfile;
    getSmartTextColor: () => string | undefined;
    getHighlightClass: (highlight?: string) => string;
    setOpenPlaylist: (link: LinkItem | null) => void;
}

export const MusicRichCard: React.FC<MusicRichCardProps> = ({
    link,
    handleLinkClick,
    baseCardClass,
    mainButtonStyle,
    effectiveFontFamily,
    profile,
    getSmartTextColor,
    getHighlightClass,
    setOpenPlaylist
}) => {
    const musicTitle = link.title || 'Música';
    const musicArtist = link.subtitle || 'Artista';
    const isDeezer = link.embedType === 'deezer' || link.url.includes('deezer');
    const contrastColor = getSmartTextColor();
    const hasTracks = link.children && link.children.length > 0;

    return (
        <div
            className={`w-full overflow-visible isolate relative group flex transition-all duration-300 ${baseCardClass} min-h-[72px] h-auto py-3 px-3 items-center justify-between mb-1 ${getHighlightClass(link.highlight)}`}
            style={mainButtonStyle}
        >
            {/* Album Art */}
            <div className={`relative w-12 h-12 flex-shrink-0 ${profile.buttonRoundness === 'square' ? 'rounded-none' : 'rounded-sm'} overflow-hidden shadow-sm shrink-0 transition-transform duration-500`}>
                <img src={link.image || (isDeezer ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg' : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b')}
                    alt={musicTitle}
                    className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>

            {/* Info Column */}
            <div className="flex-1 min-w-0 flex flex-col justify-center text-center px-2" style={{ fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}>
                {/* Header Label */}
                <div className="flex items-center justify-center gap-1.5 mb-1 opacity-50">
                    {isDeezer ? <Music size={10} color={getSmartTextColor()} /> : <SiSpotify size={10} color="#1DB954" />}
                    <span className="text-[7px] uppercase tracking-[0.25em] leading-none font-bold" style={{ color: contrastColor }}>
                        {isDeezer ? 'Deezer' : 'Spotify'} {hasTracks ? 'Álbum' : ''}
                    </span>
                </div>

                {/* Song Title */}
                <h4 className="text-[14px] font-bold whitespace-normal break-words tracking-tight uppercase leading-none mb-1.5" style={{ color: contrastColor }}>
                    {musicTitle}
                </h4>

                {/* Artist Info Row */}
                <div className="flex items-center justify-center gap-2 overflow-hidden">
                    <div className="flex items-center gap-1 opacity-80 min-w-0">
                        <Music size={10} style={{ color: contrastColor }} className="opacity-50 shrink-0" />
                        <span className="text-[10px] font-bold uppercase leading-none whitespace-pre-line" style={{ color: contrastColor }}>
                            {musicArtist}
                        </span>
                        {(hasTracks || !isDeezer) && (
                            <div className="flex items-end gap-0.5 h-2 ml-1 opacity-40 shrink-0">
                                <span className="w-0.5 h-full bg-current animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ color: contrastColor }} />
                                <span className="w-0.5 h-1/2 bg-current animate-[music-bar_1.1s_ease-in-out_infinite]" style={{ color: contrastColor }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="shrink-0 w-12 h-full flex items-center justify-center">
                {hasTracks ? (
                    <ChevronUp size={20} style={{ color: contrastColor }} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <Play size={18} fill={contrastColor} style={{ color: contrastColor }} className="ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                )}
            </div>

            {/* Overlay link */}
            <a
                href={hasTracks ? "#" : link.url}
                target={hasTracks ? "_self" : "_blank"}
                rel="noreferrer"
                className="absolute inset-0 z-30 cursor-pointer"
                onClick={(e) => {
                    if (hasTracks) {
                        e.preventDefault();
                        setOpenPlaylist(link);
                    } else {
                        handleLinkClick(link.id);
                    }
                }}
            />

            <style>{`
                @keyframes music-bar {
                    0%, 100% { height: 25%; opacity: 0.5; }
                    50% { height: 100%; opacity: 1; }
                }
            `}</style>
        </div>
    );
};

interface MusicPlaylistDrawerProps {
    openPlaylist: LinkItem | null;
    setOpenPlaylist: (link: LinkItem | null) => void;
    isDarkTheme: boolean;
    handleLinkClick: (id: string) => void;
    profile: UserProfile;
    currentTheme: any;
    getSmartTextColor: () => string | undefined;
    effectiveFontFamily: string;
    borderRadiusValue: any;
    isStatic: boolean;
    mainButtonStyle?: React.CSSProperties;
    buttonClass?: string;
}

export const MusicPlaylistDrawer: React.FC<MusicPlaylistDrawerProps> = ({
    openPlaylist,
    setOpenPlaylist,
    isDarkTheme,
    handleLinkClick,
    profile,
    currentTheme,
    getSmartTextColor,
    effectiveFontFamily,
    borderRadiusValue,
    isStatic,
    mainButtonStyle = {},
    buttonClass = ""
}) => {
    const isDeezer = openPlaylist?.embedType === 'deezer' || openPlaylist?.url.includes('deezer');
    const isDark = isDarkTheme;
    const contrastColor = mainButtonStyle?.color as string || getSmartTextColor() || (isDark ? '#FFFFFF' : '#000000');

    return (
        <AnimatePresence>
            {openPlaylist && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenPlaylist(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                        className={`relative w-full max-w-lg overflow-hidden flex flex-col shadow-2xl pointer-events-auto ${buttonClass.replace(/\b(w-full|h-full|p-[xy]?-\d+|flex|items-center|justify-between|h-\[.*?\]|min-h-\[.*?\])\b/g, '').trim()}`}
                        style={{
                            ...mainButtonStyle,
                            backgroundColor: mainButtonStyle?.backgroundColor || (profile.themeId === 'custom' && profile.customSolidColor ? profile.customSolidColor : undefined),
                            color: contrastColor,
                            fontFamily: effectiveFontFamily,
                            borderTopLeftRadius: borderRadiusValue === 0 ? '0px' : '32px',
                            borderTopRightRadius: borderRadiusValue === 0 ? '0px' : '32px',
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            height: 'auto',
                            maxHeight: '90%',
                            willChange: 'transform',
                            boxShadow: profile.buttonShadow ? '0 -4px 0 0 #1a1a1a, 4px 0 0 0 #1a1a1a, -4px 0 0 0 #1a1a1a' : undefined
                        }}
                    >

                        {/* Header Section */}
                        <div className={`px-2 pt-8 pb-6 flex items-center gap-4 border-b relative z-10 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                            <div className="relative group/cover shrink-0">
                                <img src={openPlaylist?.image || (isDeezer ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg' : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b')}
                                    className="w-16 h-16 rounded-lg object-cover shadow-lg transition-transform duration-500"
                                    alt="" loading="lazy" decoding="async" />
                            </div>
                            <div className="flex-1 min-w-0 pr-10">
                                <div className="flex items-center gap-1.5 mb-1 opacity-50">
                                    {isDeezer ? <Music size={12} color={contrastColor} /> : <SiSpotify size={12} color="#1DB954" />}
                                    <span className="text-[8px] uppercase tracking-[0.3em] font-black">
                                        {isDeezer ? 'Deezer' : 'Spotify'} {openPlaylist?.url.includes('album') ? 'Álbum' : 'Playlist'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black truncate leading-none uppercase tracking-tight mb-1">
                                    {openPlaylist?.title}
                                </h3>
                                <p className="text-sm opacity-60 font-medium italic whitespace-pre-line" style={{ color: contrastColor }}>
                                    {openPlaylist?.subtitle || 'Várias faixas'}
                                </p>
                            </div>
                            <button
                                onClick={() => setOpenPlaylist(null)}
                                className={`absolute top-2 right-2 p-2.5 rounded-none border-2 border-[#1a1a1a] shadow-[3px_3px_0_0_#1a1a1a] transform transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none z-50 ${isDark ? 'bg-white text-[#1a1a1a]' : 'bg-white text-[#1a1a1a]'}`}
                            >
                                <X size={18} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Tracks List */}
                        <div className={`overflow-y-auto flex-1 relative z-10 overscroll-contain scrollbar-hide ${openPlaylist.layout === 'carousel' ? 'overflow-x-hidden' : ''}`}>
                            {openPlaylist.layout === 'carousel' ? (
                                <div className="flex overflow-x-auto snap-x snap-mandatory px-4 py-8 gap-5 scrollbar-hide">
                                    {openPlaylist.children?.map((track, idx) => (
                                        <motion.a
                                            key={track.id}
                                            href={track.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => handleLinkClick(track.id)}
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex-shrink-0 w-64 snap-center relative group"
                                        >
                                            {/* Album Card */}
                                            <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-[#1a1a1a]">
                                                <img 
                                                    src={track.image || openPlaylist.image || (isDeezer ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg' : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b')}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                    alt={track.title}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-xl">
                                                        <Play fill="black" size={28} className="translate-x-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Track Info */}
                                            <div className="px-2">
                                                <h4 className="text-lg font-black truncate leading-tight uppercase tracking-tight mb-1" style={{ color: contrastColor }}>
                                                    {track.title}
                                                </h4>
                                                {track.subtitle && (
                                                    <p className="text-xs font-bold opacity-60 uppercase tracking-widest whitespace-pre-line" style={{ color: contrastColor }}>
                                                        {track.subtitle}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Brutalist Shadow Effect */}
                                            <div className="absolute inset-0 -z-10 translate-x-2 translate-y-2 bg-[#1a1a1a] rounded-2xl opacity-20" />
                                        </motion.a>
                                    ))}
                                    {/* Spacer for horizontal scroll */}
                                    <div className="flex-shrink-0 w-4" />
                                </div>
                            ) : (
                                <div className="py-1 space-y-0.5">
                                    {openPlaylist.children?.map((track, idx) => (
                                        <motion.a
                                            key={track.id}
                                            href={track.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => handleLinkClick(track.id)}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className={`flex items-center gap-4 px-2 py-4 group transition-all relative overflow-hidden ${isDark ? 'hover:bg-white/8' : 'hover:bg-black/5'}`}
                                        >
                                            <div className="flex items-baseline gap-4 flex-1 min-w-0">
                                                <span className="text-[10px] font-mono opacity-20 w-4 shrink-0 font-black" style={{ color: contrastColor }}>
                                                    {(idx + 1).toString().padStart(2, '0')}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold truncate tracking-tight uppercase" style={{ color: contrastColor }}>
                                                        {track.title}
                                                    </h4>
                                                    {track.subtitle && (
                                                        <p className="text-[10px] opacity-40 font-bold tracking-wider uppercase mt-0.5 whitespace-pre-line" style={{ color: contrastColor }}>
                                                            {track.subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 flex items-center justify-center transition-all">
                                                <Play
                                                    size={16}
                                                    fill={contrastColor}
                                                    className="transition-all opacity-40 group-hover:opacity-100 group-hover:scale-110 ml-0.5"
                                                    style={{ color: contrastColor }}
                                                />
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="h-6 w-full shrink-0" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
