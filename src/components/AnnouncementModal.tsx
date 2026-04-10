import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Megaphone, Sparkles } from 'lucide-react';
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
                    // Logic: 
                    // 1. If logged in, the backend already filtered out announcements DISMISSED in DB.
                    //    We ignore localStorage to allow account-switching on the same browser.
                    // 2. If guest (no profile), we use localStorage as the only source of truth.
                    
                    if (profile && profile.id) {
                        // Logged in: Always show what the backend returns
                        setAnnouncement(active);
                        setTimeout(() => setIsOpen(true), 1200);
                    } else {
                        // Guest: Use localStorage to prevent spamming
                        const seenId = localStorage.getItem('nodus_seen_announcement');
                        if (seenId !== active.id) {
                            setAnnouncement(active);
                            setTimeout(() => setIsOpen(true), 1200);
                        }
                    }
                }
            } catch (error) {
                console.warn('[Announcement] Could not check for announcements:', error);
            }
        };

        checkAnnouncement();
    }, [profile?.id]);

    // Automatic Carousel Logic
    useEffect(() => {
        if (!isOpen || !announcement || !announcement.imageUrls || announcement.imageUrls.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % announcement.imageUrls!.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [isOpen, announcement]);

    const handleClose = async () => {
        setIsOpen(false);
        if (announcement) {
            localStorage.setItem('nodus_seen_announcement', announcement.id);
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-fit max-w-[90vw] max-h-[90vh] bg-white border-2 border-black rounded-xl shadow-[0_12px_0_0_#000] overflow-hidden flex flex-col mx-auto"
                    >
                        {/* Status Bar */}
                        <div className="bg-[#ffdf00] border-b-2 border-black flex items-center px-6 py-2.5 gap-3">
                            <Megaphone size={16} strokeWidth={3} />
                            <span className="font-black uppercase tracking-[0.2em] text-[9px]">Anúncio Oficial Nodus</span>
                            <div className="flex-1" />
                            <button 
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black rounded hover:bg-red-400 hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                            >
                                <X size={14} strokeWidth={4} />
                            </button>
                        </div>

                        {/* Main Body with Image Carousel and Text Overlay */}
                        <div className="relative w-fit bg-slate-100 overflow-hidden group min-h-[100px]">
                            {urls.length > 0 ? (
                                <div className="relative overflow-hidden flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.img 
                                            key={currentImageIndex}
                                            src={urls[currentImageIndex]} 
                                            alt={announcement.title}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="h-auto w-auto max-w-full max-h-[75vh] block object-contain"
                                        />
                                    </AnimatePresence>
                                    
                                    {/* Indicators */}
                                    {urls.length > 1 && (
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                                            {urls.map((_, i) => (
                                                <div 
                                                    key={i}
                                                    className={`h-1.5 transition-all duration-300 border border-black/20 ${i === currentImageIndex ? 'w-8 bg-[#ffdf00]' : 'w-2 bg-white/40'}`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Gradient Overlay for Text Legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none" />
                                </div>
                            ) : (
                                <div className="w-full h-[400px] flex items-center justify-center bg-slate-900 z-10">
                                    <Megaphone size={64} className="text-white/10" />
                                </div>
                            )}

                            {/* Badge */}
                            <div className="absolute top-6 left-6 z-20 bg-[#ffdf00] border-2 border-black px-4 py-1.5 shadow-[3px_3px_0_0_#000]">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2">
                                    <Sparkles size={12} /> Destaque Oficial
                                </span>
                            </div>

                            {/* Overlaid Text Content */}
                            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-12 pb-16">
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-6 max-w-2xl"
                                >
                                    <div className="space-y-3">
                                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] italic text-white drop-shadow-2xl">
                                            {announcement.title}
                                        </h3>
                                        <div className="w-24 h-2 bg-[#ffdf00] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]" />
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <p className="text-lg md:text-xl font-bold text-white/95 leading-tight whitespace-pre-line drop-shadow-xl flex-1">
                                            {announcement.content}
                                        </p>

                                        {announcement.blogPostSlug && (
                                            <a 
                                                href={`/blog/${announcement.blogPostSlug}`}
                                                className="bg-white text-black border-2 border-black rounded-lg px-6 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-y-[2px] active:shadow-none transition-all text-center"
                                            >
                                                Ver Detalhes
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Decorative corner */}
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#ffdf00] border-4 border-black rounded-full opacity-20 blur-xl pointer-events-none" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
