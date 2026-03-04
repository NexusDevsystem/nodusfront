import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkItem } from '../../types';
import { ChevronDown, ChevronUp, Music, Play } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';
import DeezerIcon from '../icons/DeezerIcon';

interface MusicRichCardProps {
    link: LinkItem;
    handleLinkClick: (id: string) => void;
    baseCardClass: string;
    mainButtonStyle: React.CSSProperties;
    effectiveFontFamily: string;
    profile: { fontWeight?: number | string; fontItalic?: boolean; buttonRoundness?: string };
    getSmartTextColor: () => string | undefined;
    setOpenPlaylist: (link: LinkItem | null) => void;
}

const MusicRichCard: React.FC<MusicRichCardProps> = ({
    link,
    handleLinkClick,
    baseCardClass,
    mainButtonStyle,
    effectiveFontFamily,
    profile,
    getSmartTextColor,
    setOpenPlaylist,
}) => {
    const musicTitle = link.title || 'Música';
    const musicArtist = link.subtitle || 'Artista';
    const isDeezer = link.embedType === 'deezer' || link.url.includes('deezer');
    const contrastColor = getSmartTextColor();
    const hasTracks = link.children && link.children.length > 0;

    return (
        <div
            className={`w-full overflow-hidden isolate relative group flex transition-all duration-300 ${baseCardClass} h-[80px] p-0 items-center justify-between mb-1`}
            style={mainButtonStyle}
        >
            <div className="flex h-full items-center px-4 gap-3.5 flex-1 min-w-0">
                {/* Album Art */}
                <div className={`relative w-12 h-12 ${profile.buttonRoundness === 'square' ? 'rounded-none' : 'rounded-lg'} overflow-hidden shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500`}>
                    <img
                        src={link.image || (isDeezer
                            ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg'
                            : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b'
                        )}
                        alt={musicTitle}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Info Column */}
                <div
                    className="flex-1 min-w-0 flex flex-col justify-center h-full text-left"
                    style={{ fontFamily: effectiveFontFamily, fontWeight: (profile.fontWeight || undefined), fontStyle: profile.fontItalic ? 'italic' : 'normal' }}
                >
                    {/* Header Label */}
                    <div className="flex items-center gap-1.5 mb-1 opacity-50">
                        {isDeezer
                            ? <DeezerIcon size={10} color={getSmartTextColor()} />
                            : <SiSpotify size={10} color="#1DB954" />
                        }
                        <span className="text-[7px] uppercase tracking-[0.25em] leading-none font-bold" style={{ color: contrastColor }}>
                            {isDeezer ? 'Deezer' : 'Spotify'} {hasTracks ? 'Álbum' : ''}
                        </span>
                    </div>

                    {/* Song Title */}
                    <h4 className="text-[14px] font-bold truncate tracking-tight uppercase leading-none mb-1.5" style={{ color: contrastColor }}>
                        {musicTitle}
                    </h4>

                    {/* Artist Row */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 opacity-80">
                            <Music size={10} style={{ color: contrastColor }} className="opacity-50" />
                            <span className="text-[10px] font-bold uppercase leading-none" style={{ color: contrastColor }}>
                                {musicArtist}
                            </span>
                            {(hasTracks || !isDeezer) && (
                                <div className="flex items-end gap-0.5 h-2 ml-1 opacity-40">
                                    <span className="w-0.5 h-full bg-current animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ color: contrastColor }} />
                                    <span className="w-0.5 h-1/2 bg-current animate-[music-bar_1.1s_ease-in-out_infinite]" style={{ color: contrastColor }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="shrink-0 h-full flex items-center pr-4">
                {hasTracks ? (
                    <ChevronUp size={20} style={{ color: contrastColor }} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <Play size={18} fill={contrastColor} style={{ color: contrastColor }} className="ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                )}
            </div>

            {/* Overlay link */}
            <a
                href={hasTracks ? '#' : link.url}
                target={hasTracks ? '_self' : '_blank'}
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
}

export const MusicPlaylistDrawer: React.FC<MusicPlaylistDrawerProps> = ({
    openPlaylist,
    setOpenPlaylist,
    isDarkTheme,
    handleLinkClick,
}) => {
    const isDeezer = openPlaylist?.embedType === 'deezer' || openPlaylist?.url.includes('deezer');

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
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.4}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) {
                                setOpenPlaylist(null);
                            }
                        }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-lg bg-white rounded-t-[32px] overflow-hidden pointer-events-auto flex flex-col shadow-2xl"
                        style={{
                            backgroundColor: isDarkTheme ? '#121212' : '#FFFFFF',
                            color: isDarkTheme ? '#FFFFFF' : '#000000',
                            borderTop: isDarkTheme ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            height: 'auto',
                            maxHeight: '85%'
                        }}
                    >
                        {/* Drawer Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1">
                            <div className={`w-12 h-1.5 rounded-full ${isDarkTheme ? 'bg-white/10' : 'bg-black/10'}`} />
                        </div>

                        {/* Header Section */}
                        <div className={`px-6 pt-4 pb-6 flex items-center gap-5 border-b ${isDarkTheme ? 'border-white/5' : 'border-black/5'}`}>
                            <div className="relative group/cover shrink-0">
                                <img
                                    src={openPlaylist?.image || (isDeezer
                                        ? 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg'
                                        : 'https://i.scdn.co/image/ab6761610000e5eb4f4cb38605332c021379c13b'
                                    )}
                                    className="w-20 h-20 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                                    alt=""
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1 opacity-50">
                                    {isDeezer
                                        ? <DeezerIcon size={12} color={isDarkTheme ? '#FFFFFF' : '#000000'} />
                                        : <SiSpotify size={12} color="#1DB954" />
                                    }
                                    <span className="text-[8px] uppercase tracking-[0.3em] font-black">
                                        {isDeezer ? 'Deezer' : 'Spotify'}{openPlaylist?.url.includes('album') ? ' Álbum' : ' Playlist'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black truncate leading-none uppercase tracking-tight mb-1">
                                    {openPlaylist?.title}
                                </h3>
                                <p className="text-sm opacity-60 font-medium truncate italic">
                                    {openPlaylist?.subtitle || 'Várias faixas'}
                                </p>
                            </div>
                            <button
                                onClick={() => setOpenPlaylist(null)}
                                className={`p-2 rounded-full transform active:scale-95 transition-all ${isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                            >
                                <ChevronDown size={24} />
                            </button>
                        </div>

                        {/* Tracks List */}
                        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-1 overscroll-contain scrollbar-hide">
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
                                    className={`flex items-center gap-4 p-3.5 rounded-2xl group transition-all relative overflow-hidden ${isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                                >
                                    <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                                    <div className="flex items-baseline gap-4 flex-1 min-w-0">
                                        <span className="text-[10px] font-mono opacity-20 w-4 shrink-0 font-black">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-bold truncate tracking-tight uppercase ${isDarkTheme ? 'text-white/90' : 'text-black/90'}`}>
                                                {track.title}
                                            </h4>
                                            {track.subtitle && (
                                                <p className="text-[10px] opacity-40 font-bold tracking-wider truncate uppercase mt-0.5">
                                                    {track.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 flex items-center justify-center transition-all">
                                        <Play
                                            size={16}
                                            fill={isDarkTheme ? '#FFFFFF' : '#000000'}
                                            className={`transition-all ${isDarkTheme ? 'text-white' : 'text-black'} opacity-40 group-hover:opacity-100 group-hover:scale-110 ml-0.5`}
                                        />
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        {/* Bottom Pad for Home Indicator */}
                        <div className="h-4 w-full" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MusicRichCard;
