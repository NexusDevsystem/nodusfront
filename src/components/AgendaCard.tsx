import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EventItem } from '../types';
import { ExternalLink, MapPin, Clock, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface AgendaCardProps {
    events: EventItem[];
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
    themeTextHex?: string;
    isDark?: boolean;
    fontFamily?: string;
    fontWeight?: string | number;
    fontItalic?: boolean;
    isPreview?: boolean;
    portalTarget?: HTMLElement | null;
}

const ScrollingTitle: React.FC<{ title: string; themeTextHex: string }> = ({ title, themeTextHex }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (containerRef.current && textRef.current) {
                const hasOverflow = textRef.current.offsetWidth > containerRef.current.offsetWidth;
                setShouldScroll(hasOverflow);
            }
        };

        checkScroll();
        window.addEventListener('resize', checkScroll);
        // Pequeno delay para garantir que o layout foi renderizado
        const timeout = setTimeout(checkScroll, 100);

        return () => {
            window.removeEventListener('resize', checkScroll);
            clearTimeout(timeout);
        };
    }, [title]);

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden whitespace-nowrap flex items-center">
            <motion.div
                className={`inline-block ${!shouldScroll ? 'mx-auto' : ''}`}
                animate={shouldScroll ? {
                    x: [0, -(textRef.current?.offsetWidth || 0) - 40],
                    transition: {
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: title.length * 0.25,
                            ease: "linear",
                            delay: 2
                        }
                    }
                } : { x: 0 }}
            >
                <span
                    ref={textRef}
                    className="text-[18px] font-black uppercase tracking-tight px-1"
                    style={{ color: themeTextHex }}
                >
                    {title}
                </span>
                {shouldScroll && (
                    <span
                        className="text-[18px] font-black uppercase tracking-tight ml-[40px] px-1"
                        style={{ color: themeTextHex }}
                    >
                        {title}
                    </span>
                )}
            </motion.div>
        </div>
    );
};

export const AgendaCard: React.FC<AgendaCardProps> = ({
    events,
    themeButtonClass = '',
    themeButtonStyle = {},
    themeTextHex = '',
    isDark = false,
    fontFamily,
    fontWeight,
    fontItalic,
    isPreview = false,
    portalTarget = null
}) => {
    const { t, i18n } = useTranslation();
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every 10 seconds to refresh scheduled events visibility
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const isMultiColumn = events.length > 2;

    // Filter events based on schedule
    const activeEvents = React.useMemo(() => {
        const now = currentTime;
        return events.filter(event => {
            const start = event.scheduleStart ? new Date(event.scheduleStart) : null;
            const end = event.scheduleEnd ? new Date(event.scheduleEnd) : null;

            if (start && now < start) return false;
            if (end && now > end) return false;
            return true;
        });
    }, [events, currentTime]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = date.toLocaleString(i18n.language || 'pt-BR', { month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', '');
        const year = date.getUTCFullYear();
        const fullDate = date.toLocaleDateString(i18n.language || 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        return { day, month, year, fullDate };
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [activeEvents.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!activeEvents || activeEvents.length === 0) return null;

    return (
        <>
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>

            <div
                className="relative group/agenda w-full mt-2"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Desktop Navigation Arrows */}
                {isMultiColumn && (
                    <div className="hidden md:block">
                        <AnimatePresence>
                            {showLeftArrow && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: isHovering ? 1 : 0,
                                        scale: isHovering ? 1 : 0.8,
                                        pointerEvents: isHovering ? 'auto' : 'none'
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => scroll('left')}
                                    className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white flex items-center justify-center text-black active:scale-95 transition-all cursor-pointer border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a]"
                                >
                                    <ChevronLeft size={16} strokeWidth={2} />
                                </motion.button>
                            )}
                            {showRightArrow && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: isHovering ? 1 : 0,
                                        scale: isHovering ? 1 : 0.8,
                                        pointerEvents: isHovering ? 'auto' : 'none'
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => scroll('right')}
                                    className="absolute right-[-12px] top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white flex items-center justify-center text-black active:scale-95 transition-all cursor-pointer border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a]"
                                >
                                    <ChevronRight size={16} strokeWidth={2} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className={`w-full ${isMultiColumn
                        ? "grid grid-flow-col grid-rows-2 gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-4 pr-12"
                        : "flex flex-col gap-2"
                        }`}
                >
                    {activeEvents.map((event, index) => {
                        const { day, month, year } = formatDate(event.date);

                        return (
                            <motion.div
                                key={event.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedEvent(event)}
                                className={`relative group flex shrink-0 transition-all duration-300 overflow-hidden cursor-pointer snap-center ${themeButtonClass} h-[90px] p-0 active:scale-[0.98]`}
                                style={{
                                    ...themeButtonStyle,
                                    width: isMultiColumn ? '250px' : '100%',
                                    maxWidth: 'none',
                                    flexShrink: 0
                                }}
                            >
                                {/* Date Box */}
                                <div className="w-[85px] h-[85px] p-2 shrink-0 flex items-center justify-center my-auto">
                                    <div 
                                        className="w-full h-full border-2 rounded-md flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm"
                                        style={{ borderColor: `${themeTextHex}20` }}
                                    >
                                        <span className="text-[10px] font-bold tracking-tighter opacity-70 leading-none mb-[-1px]" style={{ color: themeTextHex }}>{month}</span>
                                        <span className="text-[32px] font-black leading-none my-[-4px]" style={{ color: themeTextHex }}>{day}</span>
                                        <span className="text-[10px] font-bold tracking-widest opacity-30 leading-none mt-[-1px]" style={{ color: themeTextHex }}>{year}</span>
                                    </div>
                                </div>

                                {/* Content Section - Centered with Marquee Animation */}
                                <div className="flex-1 px-4 flex flex-col justify-center min-w-0" style={{ fontFamily }}>
                                    <ScrollingTitle title={event.title} themeTextHex={themeTextHex} />
                                </div>

                                {/* Status/Action Indicator */}
                                <div className="px-4 shrink-0 flex items-center justify-center">
                                    {event.status && event.status !== 'Tickets' ? (
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: themeTextHex }}>
                                            {event.status === 'Sold Out' ? t('agenda.statusSoldOut').toUpperCase() :
                                                event.status === 'Free' ? t('agenda.statusFree').toUpperCase() :
                                                    event.status === 'Buy' ? t('agenda.statusBuy').toUpperCase() :
                                                        event.status}
                                        </span>
                                    ) : (
                                        <ExternalLink size={16} className="opacity-20 group-hover:opacity-60 transition-opacity" style={{ color: themeTextHex }} />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Sheet Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedEvent && (
                        <motion.div 
                            key="agenda-modal-overlay"
                            // No initial/animate here to avoid conflict with children, 
                            // but its presence keeps children alive for exit
                            className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-[10000] flex items-end justify-center pointer-events-none`}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, ease: "linear" }}
                                onClick={() => setSelectedEvent(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                            />
                            <motion.div
                                initial={{ y: "100%", scale: 0.96 }}
                                animate={{ y: 0, scale: 1 }}
                                exit={{ y: "100%", scale: 0.96 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`relative w-full max-w-lg border-t-2 border-x-2 rounded-t-[32px] overflow-hidden flex flex-col max-h-[92vh] pb-safe pointer-events-auto shadow-2xl ${themeButtonClass}`}
                                style={{ 
                                    fontFamily,
                                    ...themeButtonStyle,
                                    borderColor: `${themeTextHex}20`
                                }}
                            >
                                {/* Modal Header */}
                                <div
                                    className="flex flex-col items-start px-8 pt-8 pb-4 relative z-10 w-full shrink-0"
                                >
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="absolute right-6 top-6 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer pointer-events-auto bg-black/5 hover:bg-black/10"
                                        style={{ color: themeTextHex }}
                                    >
                                        <X size={22} strokeWidth={3} />
                                    </button>

                                    <div className="w-full text-left pr-8">
                                        <span className="block mb-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: themeTextHex }}>
                                            {t('agenda.titleLabel').toUpperCase()}
                                        </span>
                                        <h2 className="text-[28px] font-black leading-[1.1] tracking-[-0.02em]" style={{ color: themeTextHex }}>
                                            {selectedEvent.title}
                                        </h2>
                                    </div>
                                </div>

                                {/* List Content */}
                                <div className="flex-1 overflow-y-auto px-8 custom-scrollbar space-y-0 w-full mb-4">
                                    <div className="flex flex-col">
                                        {/* Item: Data */}
                                        <div className="flex items-start gap-4 py-5 border-b border-black/5" style={{ borderColor: `${themeTextHex}0A` }}>
                                            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                                <Calendar size={22} style={{ color: themeTextHex }} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <span className="block text-[10px] font-bold uppercase tracking-widest mb-1 opacity-40" style={{ color: themeTextHex }}>{t('agenda.dateLabel')}</span>
                                                <span className="font-bold text-[16px] truncate block leading-none" style={{ color: themeTextHex }}>{formatDate(selectedEvent.date).fullDate}</span>
                                            </div>
                                        </div>

                                        {/* Item: Localização */}
                                        {selectedEvent.location && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-4 py-5 border-b border-black/5 hover:bg-black/5 transition-colors cursor-pointer group"
                                                style={{ borderColor: `${themeTextHex}0A` }}
                                            >
                                                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                                    <MapPin size={22} style={{ color: themeTextHex }} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-40" style={{ color: themeTextHex }}>
                                                        {t('agenda.locationLabel')} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-[1px]" />
                                                    </span>
                                                    <span className="font-bold text-[16px] truncate block leading-none" style={{ color: themeTextHex }}>{selectedEvent.location}</span>
                                                </div>
                                            </a>
                                        )}

                                        {/* Item: Horário */}
                                        {selectedEvent.time && (
                                            <div className="flex items-start gap-4 py-5 border-b border-black/5" style={{ borderColor: `${themeTextHex}0A` }}>
                                                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                                    <Clock size={22} style={{ color: themeTextHex }} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <span className="block text-[10px] font-bold uppercase tracking-widest mb-1 opacity-40" style={{ color: themeTextHex }}>{t('agenda.timeLabel')}</span>
                                                    <span className="font-bold text-[16px] truncate block leading-none" style={{ color: themeTextHex }}>{selectedEvent.time}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Divider & Description */}
                                        {selectedEvent.description && (
                                            <div className="py-6">
                                                <span className="block text-[10px] font-bold uppercase tracking-widest mb-3 opacity-40" style={{ color: themeTextHex }}>
                                                    {t('common.details', 'DETAILS')}
                                                </span>
                                                <p className="leading-relaxed text-[15px] font-medium opacity-80" style={{ color: themeTextHex }}>
                                                    {selectedEvent.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Button */}
                                <div className="px-6 py-6 border-t shrink-0 mb-safe" style={{ borderColor: `${themeTextHex}0A` }}>
                                    {selectedEvent.url && (
                                        <a
                                            href={selectedEvent.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex w-full h-14 items-center justify-center gap-2 rounded-[18px] font-bold uppercase tracking-[0.05em] text-[15px] active:scale-[0.98] transition-transform shadow-lg"
                                            style={{ 
                                                backgroundColor: themeTextHex, 
                                                color: themeButtonStyle.backgroundColor || '#fff',
                                            }}
                                        >
                                            {selectedEvent.status === 'Sold Out' ? t('agenda.statusSoldOut').toUpperCase() :
                                                selectedEvent.status === 'Free' ? t('agenda.statusFree').toUpperCase() :
                                                    t('agenda.statusBuy').toUpperCase()}
                                            <ExternalLink size={16} className="ml-1 opacity-70" />
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                portalTarget || document.body
            )}
        </>
    );
};
