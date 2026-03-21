import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Copy, Share, Loader2, Check, MessageCircle, Facebook, Linkedin, Twitter, MessageSquare, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';
import verifiedBadge from '../assets/verified-badge.png';
import { SiWhatsapp, SiX, SiMessenger, SiSnapchat } from 'react-icons/si';
import BackgroundLayer from './BackgroundLayer';
import { THEMES } from '../constants';

interface ShareImageModalProps {
    profile: UserProfile;
    onClose: () => void;
    onDownload: () => void;
    onSyncShareCard?: () => void;
    isGenerating: boolean;
}

export default function ShareImageModal({ profile, onClose, onDownload, onSyncShareCard, isGenerating }: ShareImageModalProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    
    // Auto-sync the share card in background when the modal opens
    // This ensures bots have a fresh image to scrape
    useEffect(() => {
        if (onSyncShareCard) {
            onSyncShareCard();
        }
    }, []);
    // Helper to determine text color based on background
    const getBrightness = (hex: string) => {
        const cleanHex = hex.replace('#', '');
        if (cleanHex.length !== 6) return 0;
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    };

    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const profileUrl = `${window.location.origin}/${profile.username}`;
    
    // We use the clean profileUrl. Vercel's rewrite rule in vercel.json 
    // will detect bots and point them to the OG generator automatically.
    const shareUrl = profileUrl;

    const handleCopy = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        { name: 'Copiar', icon: copied ? Check : Copy, onClick: handleCopy, color: 'bg-white text-black' },
        { name: 'WhatsApp', icon: SiWhatsapp, url: `https://wa.me/?text=Confira meu perfil no Nodus: ${shareUrl}`, color: 'bg-[#25D366] text-white' },
        { name: 'Twitter', icon: SiX, url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=Confira meu perfil no Nodus!`, color: 'bg-black text-white' },
        { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, color: 'bg-[#1877F2] text-white' },
        { name: 'Messenger', icon: SiMessenger, url: `https://www.facebook.com/dialog/send?app_id=123456789&link=${shareUrl}&redirect_uri=${shareUrl}`, color: 'bg-[#00B2FF] text-white' },
        { name: 'Snapchat', icon: SiSnapchat, url: `https://www.snapchat.com/scan?attachmentUrl=${shareUrl}`, color: 'bg-[#FFFC00] text-black' },
        { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, color: 'bg-[#0A66C2] text-white' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 md:bg-black/60 md:backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
            <div className="bg-white border-4 border-[#1a1a1a] shadow-[0_12px_0_0_#1a1a1a] p-6 sm:p-8 w-full max-w-[500px] relative animate-in zoom-in-95 duration-200 my-auto rounded-[2rem]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-black leading-none">Compartilhar</h3>
                        <div className="h-1.5 w-16 bg-[#ffdf00] mt-1 border border-black"></div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-black hover:bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] transition-all p-1 hover:translate-y-[2px] hover:shadow-none rounded-lg"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                <div className="flex flex-col">
                    {/* Visual Preview of the Card (Solid Minimalist - Outline Fixed) */}
                    <div className="relative group mb-10 w-full cursor-pointer" onClick={onDownload}>
                        <div 
                            className="w-full aspect-[1200/630] rounded-[2rem] overflow-hidden relative border-4 border-b-[12px] border-[#1a1a1a] flex flex-col items-center justify-center p-4 bg-[#1a1a1a]"
                            style={{ fontFamily: profile.fontFamily || 'Inter, sans-serif' }}
                        >
                            {/* Background Layer inside Preview: Slightly inset to guarantee no edges show */}
                            <div className="absolute inset-[-1px]">
                                <BackgroundLayer profile={profile} currentTheme={currentTheme} isStatic={true} />
                            </div>
                            
                            {/* Solid very subtle dark overly, NO gradient */}
                            <div className="absolute inset-0 bg-black/10 z-[1]" />

                            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-2 sm:gap-4 py-2">
                                {/* Avatar: Clean borders */}
                                <div className="relative">
                                    <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[2px] sm:border-[5px] border-[#1a1a1a] bg-white relative">
                                        <img 
                                            src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {profile.isVerified && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center p-0.5 border-[1.5px] sm:border-[2px] border-[#1a1a1a]">
                                             <img src={verifiedBadge} alt="Verified" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                </div>

                                {/* Identity: Flat design */}
                                <div className="flex flex-col items-center text-center gap-1.5 sm:gap-3">
                                    <h2 
                                        className="text-lg sm:text-[32px] font-black tracking-tight leading-none uppercase px-4"
                                        style={{ color: currentTheme.textHex || '#ffffff' }}
                                    >
                                        {profile.name}
                                    </h2>
                                    
                                    {/* Handle Pill: Continuous solid border */}
                                    <div 
                                        className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border-[1.5px] sm:border-[2px] border-[#1a1a1a]"
                                        style={{ backgroundColor: currentTheme.buttonHex || '#ffffff' }}
                                    >
                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full bg-[#1a1a1a] shrink-0">
                                            <svg viewBox="0 0 24 24" fill={currentTheme.buttonHex || '#ffffff'} className="w-2 h-2 sm:w-2.5 sm:h-2.5">
                                                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                                            </svg>
                                        </div>
                                        <span 
                                            className="text-[8px] sm:text-xs font-bold tracking-tight truncate"
                                            style={{ color: currentTheme.textHex || '#1a1a1a' }}
                                        >
                                             nodus.my/{profile.username}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Social Share Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 mb-10 px-2">
                        {shareLinks.map((link, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => {
                                        if (link.onClick) {
                                            e.preventDefault();
                                            link.onClick();
                                        }
                                    }}
                                    className={`${link.color} w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#1a1a1a] flex items-center justify-center transition-all shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none cursor-pointer rounded-full overflow-hidden`}
                                >
                                    <link.icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1} />
                                </a>
                                <span className="text-[9px] font-black uppercase tracking-tighter text-[#1a1a1a] text-center">{link.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Separator */}
                    <div className="w-full h-1 bg-[#1a1a1a]/10 mb-8"></div>

                    {/* CTA Section */}
                    <div className="flex flex-col items-center text-center px-2">
                        <h4 className="text-sm font-black text-black mb-2 uppercase tracking-tight">
                            Junte-se a {profile.name} no Nodus
                        </h4>
                        <p className="text-[11px] font-medium text-black/60 mb-8 leading-tight max-w-[300px]">
                            Crie seu próprio cartão de visitas digital e atraia mais olhares para o seu projeto.
                        </p>
                        
                        <div className="flex flex-col w-full gap-3">
                            <a
                                href="https://nodus.my/login"
                                className="w-full py-4 bg-[#ffdf00] text-black border-2 border-[#1a1a1a] font-black uppercase tracking-widest text-xs shadow-[0_6px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 rounded-xl"
                            >
                                <Share size={16} strokeWidth={2} />
                                Criar conta gratuitamente
                            </a>
                            <button
                                onClick={onDownload}
                                disabled={isGenerating}
                                className="w-full py-4 bg-white text-black border-2 border-[#1a1a1a] font-black uppercase tracking-widest text-xs shadow-[0_6px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 rounded-xl"
                            >
                                {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Download size={16} strokeWidth={3} />}
                                {isGenerating ? 'Trabalhando...' : 'Baixar Cartão PNG'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
