import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Megaphone, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface Announcement {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    imageUrls?: string[];
    blogPostSlug?: string | null;
}

export default function AnnouncementModal() {
    const { profile } = useAuth();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Check for active announcement
        const checkAnnouncement = async () => {
            try {
                const active = await apiClient.getActiveAnnouncement();
                if (active && active.id) {
                    // ALWAYS show what the backend returns. The backend handles filtering based on DB 'announcement_views'.
                    setAnnouncement(active);
                    setTimeout(() => setIsOpen(true), 1200);
                }
            } catch (error) {
                console.warn('[Announcement] Could not check for announcements:', error);
            }
        };

        checkAnnouncement();
    }, [profile?.id]);

    // Manual Navigation Helpers
    const paginate = (newDirection: number) => {
        if (!announcement?.imageUrls || announcement.imageUrls.length <= 1) return;
        const total = announcement.imageUrls.length;
        setCurrentImageIndex(prev => (prev + newDirection + total) % total);
    };

    const handleClose = async () => {
        setIsOpen(false);
        if (announcement) {
            try {
                await apiClient.dismissAnnouncement(announcement.id);
            } catch (e) {
                // Ignore errors if guest
            }
        }
    };

    if (!announcement) return null;

    const urls = announcement.imageUrls && announcement.imageUrls.length > 0 
        ? announcement.imageUrls 
        : (announcement.imageUrl ? [announcement.imageUrl] : []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative w-full max-w-5xl max-h-[90vh] bg-white border-2 border-black rounded-2xl shadow-[0_16px_0_0_#000] overflow-hidden flex flex-col md:flex-row mx-auto"
                    >
                        {/* 1. Left side: Image Carousel (Adaptive) */}
                        <div className="relative w-full md:w-auto md:max-w-[60%] bg-black flex-shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-black max-h-[50vh] md:max-h-none flex items-center justify-center overflow-hidden group">
                            {urls.length > 0 ? (
                                <div className="relative h-full w-full flex items-center justify-center touch-none">
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.img 
                                            key={currentImageIndex}
                                            src={urls[currentImageIndex]} 
                                            alt={announcement.title}
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            onDragEnd={(_, info) => {
                                                const swipe = info.offset.x;
                                                const threshold = 50;
                                                if (swipe < -threshold) paginate(1);
                                                else if (swipe > threshold) paginate(-1);
                                            }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full h-full max-h-full object-contain cursor-grab active:cursor-grabbing select-none"
                                        />
                                    </AnimatePresence>
                                    
                                    {/* Navigation Arrows */}
                                    {urls.length > 1 && (
                                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-between pointer-events-none">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                                                className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white border-2 border-black shadow-[4px_4px_0_0_#22c55e] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all"
                                            >
                                                <ChevronLeft size={28} strokeWidth={3} className="text-black" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                                                className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white border-2 border-black shadow-[4px_4px_0_0_#22c55e] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all"
                                            >
                                                <ChevronRight size={28} strokeWidth={3} className="text-black" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Indicators */}
                                    {urls.length > 1 && (
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                                            {urls.map((_, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => setCurrentImageIndex(i)}
                                                    className={`h-2 transition-all duration-300 border border-black/20 ${i === currentImageIndex ? 'w-10 bg-[#ffdf00]' : 'w-3 bg-white/40'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                    <Megaphone size={64} className="text-[#22c55e]" />
                                </div>
                            )}

                            {/* Badge */}
                            <div className="absolute top-6 left-6 z-40 bg-[#ffdf00] border-2 border-black px-4 py-1.5 shadow-[4px_4px_0_0_#000]">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black flex items-center gap-2">
                                    <Sparkles size={12} /> Destaque Nodus
                                </span>
                            </div>
                        </div>

                        {/* 2. Right Side: Text & Actions */}
                        <div className="flex-1 flex flex-col bg-white overflow-hidden min-h-0">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 md:p-8 bg-slate-50 border-b-2 border-black">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-[4px_4px_0_0_#22c55e]">
                                        <Megaphone size={24} className="text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black uppercase tracking-widest text-[12px] text-black">Comunicado</span>
                                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-tighter">Official Release 2026</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleClose}
                                    className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                                >
                                    <X size={24} strokeWidth={4} />
                                </button>
                            </div>

                            {/* Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-4">
                                        <h3 
                                            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8] italic text-black"
                                            style={{ textShadow: '6px 6px 0px #22c55e' }}
                                        >
                                            {announcement.title}
                                        </h3>
                                        <div className="w-24 h-4 bg-black" />
                                    </div>

                                    <div className="prose-xl">
                                        <p className="text-xl md:text-2xl font-bold text-black border-l-8 border-[#22c55e] pl-6 py-2 leading-relaxed whitespace-pre-line">
                                            {announcement.content}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Extra Compact Footer */}
                            <div className="p-4 md:p-6 bg-slate-50 border-t-2 border-black flex items-center justify-end">
                                {announcement.blogPostSlug && (
                                    <a 
                                        href={`/blog/${announcement.blogPostSlug}`}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-white text-black border-2 border-black px-8 py-3 font-black uppercase text-xs tracking-[0.2em] shadow-[4px_4px_0_0_#22c55e] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#22c55e] active:translate-y-[2px] active:shadow-none transition-all group"
                                    >
                                        Explorar
                                        <ChevronRight size={18} strokeWidth={4} className="group-hover:translate-x-2 transition-transform" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
