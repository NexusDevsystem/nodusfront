import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Megaphone, Sparkles } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface Announcement {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
}

export default function AnnouncementModal() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check for active announcement
        const checkAnnouncement = async () => {
            try {
                const active = await apiClient.getActiveAnnouncement();
                if (active && active.id) {
                    // Backend already filters out seen announcements for logged-in users.
                    // For guests, we still check localStorage.
                    const seenId = localStorage.getItem('nodus_seen_announcement');
                    if (seenId !== active.id) {
                        setAnnouncement(active);
                        // Delay opening for better UX - reduced to 1s
                        setTimeout(() => setIsOpen(true), 1200);
                    }
                }
            } catch (error) {
                console.warn('[Announcement] Could not check for announcements:', error);
            }
        };

        checkAnnouncement();
    }, []);

    const handleClose = async () => {
        setIsOpen(false);
        if (announcement) {
            // Persist to localStorage for fallback
            localStorage.setItem('nodus_seen_announcement', announcement.id);
            // Sync with backend database
            try {
                await apiClient.dismissAnnouncement(announcement.id);
            } catch (e) {
                // Ignore errors if guest
            }
        }
    };

    if (!announcement) return null;

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

                        {/* Main Body with Image and Text Overlay */}
                        <div className="relative w-fit bg-slate-100 overflow-hidden group min-h-[100px]">
                            {announcement.imageUrl ? (
                                <>
                                    <img 
                                        src={announcement.imageUrl} 
                                        alt={announcement.title}
                                        className="h-auto w-auto max-w-full max-h-[75vh] block object-contain"
                                    />
                                    {/* Gradient Overlay for Text Legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
                                </>
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
                            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-12 pb-12">
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

                                    <p className="text-lg md:text-xl font-bold text-white/95 leading-tight whitespace-pre-line drop-shadow-xl">
                                        {announcement.content}
                                    </p>
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
