import React from 'react';
import { LinkItem } from '../types';
import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface MapBlockProps {
    link: LinkItem;
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
    themeTextHex?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontItalic?: boolean;
}

const ScrollingTitle: React.FC<{ title: string; isCard: boolean; color: string; fontFamily?: string; fontWeight?: string; fontItalic?: boolean }> = ({ title, isCard, color, fontFamily, fontWeight, fontItalic }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const textRef = React.useRef<HTMLSpanElement>(null);
    const [shouldScroll, setShouldScroll] = React.useState(false);

    React.useEffect(() => {
        if (containerRef.current && textRef.current) {
            setShouldScroll(textRef.current.offsetWidth > containerRef.current.offsetWidth);
        }
    }, [title]);

    return (
        <div ref={containerRef} className="overflow-hidden whitespace-nowrap w-full relative">
            <motion.span
                ref={textRef}
                className={`inline-block font-black uppercase tracking-tight leading-tight ${isCard ? 'text-[14px]' : 'text-[12px]'}`}
                style={{ 
                    color,
                    fontFamily,
                    fontWeight: fontWeight || '900',
                    fontStyle: fontItalic ? 'italic' : 'normal'
                }}
                animate={shouldScroll ? {
                    x: [0, -(textRef.current?.offsetWidth || 0) + (containerRef.current?.offsetWidth || 0) - 10, 0]
                } : {}}
                transition={shouldScroll ? {
                    duration: title.length * 0.2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1
                } : {}}
            >
                {title}
            </motion.span>
            {!shouldScroll && title && (
                <style>{`
                    .truncate-fallback { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                `}</style>
            )}
        </div>
    );
};

export const MapBlock: React.FC<MapBlockProps> = ({
    link,
    themeButtonClass = '',
    themeButtonStyle = {},
    themeTextHex = '#000000',
    fontFamily,
    fontWeight,
    fontItalic
}) => {
    const { t } = useTranslation();
    if (!link.url && !link.title) return null;

    // Encode only the address for Google Maps Search URL to ensure accurate results
    const mapQuery = encodeURIComponent(link.url || '');
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    const isCard = link.layout === 'card';

    return (
        <motion.div
            whileHover={{ }}
            whileTap={{ scale: 0.99 }}
            className={`relative flex flex-col overflow-hidden group ${themeButtonClass} ${isCard ? 'p-0' : 'h-[72px] p-2.5'}`}
            style={{
                ...themeButtonStyle,
            }}
        >
            {/* Background Accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Map Preview for Card Layout */}
            {isCard && link.url && (
                <div 
                    className="w-full aspect-[16/9] border-b overflow-hidden relative grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    style={{ borderColor: `${themeTextHex}1A` }}
                >
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(link.url)}&output=embed`}
                        allowFullScreen
                        loading="lazy"
                        className="pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                </div>
            )}

            <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between min-w-0 relative z-10 ${isCard ? 'p-3 px-4' : ''}`}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                        className={`${isCard ? 'w-7 h-7' : 'w-6 h-6'} flex items-center justify-center shrink-0`}
                    >
                        <MapPin size={isCard ? 18 : 16} strokeWidth={2.5} style={{ color: themeTextHex }} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                        <span
                            className="text-[7px] font-bold uppercase tracking-[0.15em] opacity-40 mb-0.5 leading-none"
                            style={{ 
                                color: themeTextHex,
                                fontFamily,
                                fontWeight: fontWeight || '700',
                                fontStyle: fontItalic ? 'italic' : 'normal'
                            }}
                        >
                            {t('links.mapLabelMobile')}
                        </span>
                        {link.title && (
                            <ScrollingTitle title={link.title} isCard={isCard} color={themeTextHex} fontFamily={fontFamily} fontWeight={fontWeight} fontItalic={fontItalic} />
                        )}
                        {link.url && (
                            <span
                                className="text-[8px] font-bold opacity-60 truncate mt-0.5 leading-none"
                                style={{ 
                                    color: themeTextHex,
                                    fontFamily,
                                    fontWeight: fontWeight || '700',
                                    fontStyle: fontItalic ? 'italic' : 'normal'
                                }}
                            >
                                {link.url}
                            </span>
                        )}
                    </div>
                </div>

                <div
                    className={`${isCard ? 'w-7 h-7' : 'w-6 h-6'} flex items-center justify-center shrink-0 opacity-20 group-hover:opacity-100 transition-all duration-300`}
                >
                    <Navigation size={isCard ? 18 : 14} strokeWidth={2.5} style={{ color: themeTextHex }} />
                </div>
            </a>

            {/* Premium Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </motion.div>
    );
};
