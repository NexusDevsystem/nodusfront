import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { LinkItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus,
    Trash2,
    Instagram,
    Twitter,
    Linkedin,
    Github,
    Youtube,
    Facebook,
    Info,
    X,
    MessageCircle,
    Hash,
    Send,
    Cloud,
    Twitch,
    Music,
    Chrome,
    Phone,
    Mail as MailIcon,
    ShoppingBag,
    Search,
    ChevronLeft,
    ChevronRight,
    Zap,
    ExternalLink,
    Loader2,
    Check
} from 'lucide-react';
import { SiSpotify, SiTiktok } from 'react-icons/si';
import { SOCIAL_NETWORKS } from '../constants';

interface SocialLinksEditorProps {
    links: LinkItem[];
    onChange: (links: LinkItem[] | ((prev: LinkItem[]) => LinkItem[])) => void;
    profile?: any;
    setProfile?: (profile: any) => void;
}

export default function SocialLinksEditor({ links, onChange, profile: propProfile, setProfile: propSetProfile }: SocialLinksEditorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [configuringPlatform, setConfiguringPlatform] = useState<string | null>(null);
    const [tempUrl, setTempUrl] = useState('');
    const { profile: authProfile, setProfile: authSetProfile } = useAuth();
    const profile = propProfile || authProfile;
    const setProfile = propSetProfile || authSetProfile;

    const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
    const [isConnectingTikTok, setIsConnectingTikTok] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const isAuthorized = profile?.username === 'nodus' || profile?.username === 'nexus';

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const socialLinks = links.filter(link => link.layout === 'social' && link.type !== 'collection');
    const instagramIntegration = profile?.integrations?.find((i: any) => i.provider === 'instagram');
    const isInstagramConnected = !!instagramIntegration;

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSearchTerm('');
        setConfiguringPlatform(null);
        setTempUrl('');
        setShowDisconnectConfirm(false);
    };

    const toggleSocialLink = (platformId: string) => {
        const existing = links.find(l => l.layout === 'social' && (l.platform === platformId || (platformId !== 'site' && platformId !== 'custom' && l.url.includes(platformId))));
        const platform = SOCIAL_NETWORKS.find(p => p.id === platformId);

        if (existing && platform) {
            setConfiguringPlatform(platformId);
            if (existing.url.startsWith(platform.baseUrl)) {
                setTempUrl(existing.url.replace(platform.baseUrl, ''));
            } else {
                setTempUrl(existing.url);
            }
        } else {
            setConfiguringPlatform(platformId);
            setTempUrl('');
        }
        setIsModalOpen(true);
    };

    const confirmPlatform = () => {
        if (!configuringPlatform) return;

        const platform = SOCIAL_NETWORKS.find(p => p.id === configuringPlatform);
        if (!platform) return;

        let finalUrl = tempUrl.trim();

        if (!finalUrl.startsWith('http') && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:')) {
            const cleanUser = finalUrl.startsWith('@') ? finalUrl.substring(1) : finalUrl;
            finalUrl = `${platform.baseUrl}${cleanUser}`;
        }

        const platformLinks = links.filter(l => l.platform === configuringPlatform);

        if (platformLinks.length > 0) {
            onChange(links.map(l => l.platform === configuringPlatform ? { ...l, url: finalUrl } : l));
        } else {
            const now = Date.now();
            const newSocialLink: LinkItem = {
                id: now.toString(),
                type: 'link',
                platform: configuringPlatform,
                title: platform.name,
                url: finalUrl,
                isActive: true,
                clicks: 0,
                layout: 'social'
            };

            onChange([...links, newSocialLink]);
        }

        handleCloseModal();
    };



    const filteredPlatforms = SOCIAL_NETWORKS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeConfigPlatform = SOCIAL_NETWORKS.find(p => p.id === configuringPlatform);

    return (
        <div className="bg-white border-2 border-black mb-4 group transition-all overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-4 md:p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-xs md:text-sm font-medium text-black uppercase tracking-widest leading-none">Redes Sociais</h3>
                        <p className="text-[9px] md:text-[10px] text-black font-normal uppercase tracking-wider mt-1 opacity-60 leading-none">Ícones rápidos exibidos no topo do seu perfil</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-black bg-white border-2 border-black hover:bg-[#ffdf00] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shrink-0"
                        title="Gerenciar Redes Sociais"
                    >
                        <Plus size={16} className="md:w-5 md:h-5" strokeWidth={3} />
                    </button>
                </div>

                {(socialLinks.length > 0 || isInstagramConnected) && (
                    <div className="flex flex-wrap gap-4 md:gap-5 py-1">
                        {/* Auto-render Instagram if connected but not explicitly added as link */}
                        {isInstagramConnected && !socialLinks.some(l => l.platform === 'instagram') && (
                            <button
                                onClick={() => toggleSocialLink('instagram')}
                                className="text-black transition-all hover:scale-110 active:scale-90 p-0.5 relative"
                            >
                                <Instagram size={22} className="md:w-6 md:h-6" />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#32a800] rounded-full border border-white" />
                            </button>
                        )}

                        {socialLinks.map(link => {
                            const network = SOCIAL_NETWORKS.find(n => n.id === link.platform) ||
                                SOCIAL_NETWORKS.find(n => n.id !== 'custom' && link.url.toLowerCase().includes(n.id)) ||
                                SOCIAL_NETWORKS.find(n => n.id === 'site' || n.id === 'custom') ||
                                SOCIAL_NETWORKS[0];
                            const Icon = network.icon;

                            return (
                                <button
                                    key={link.id}
                                    onClick={() => toggleSocialLink(link.platform!)}
                                    className="text-black transition-all hover:scale-110 active:scale-90 p-0.5"
                                >
                                    <Icon size={22} className="md:w-6 md:h-6" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={handleCloseModal}
                            />
                            <motion.div
                                initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                                animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                                exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                drag={isMobile ? "y" : false}
                                dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
                                dragElastic={isMobile ? 0.8 : 1}
                                onDragEnd={(_, info) => {
                                    if (isMobile && info.offset.y > 100) {
                                        handleCloseModal();
                                    }
                                }}
                                className={`
                                    relative bg-white flex flex-col overflow-hidden border-t-4 border-l-4 border-r-4 md:border-b-4 border-black
                                    ${isMobile ? 'w-full h-[65vh] shadow-none' : 'w-full max-w-sm max-h-[70vh] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}
                                `}
                            >
                                {/* Drag Handle for Mobile */}
                                {isMobile && (
                                    <div className="flex justify-center p-2 pt-3 shrink-0">
                                        <div className="w-8 h-1 bg-black" />
                                    </div>
                                )}

                                <div className="p-4 flex items-center justify-between shrink-0 relative border-b-2 border-dashed border-black">
                                    <button
                                        onClick={() => configuringPlatform ? setConfiguringPlatform(null) : handleCloseModal()}
                                        className="p-1.5 text-black border-2 border-transparent hover:border-black hover:bg-[#ffdf00] transition-colors"
                                    >
                                        <ChevronLeft size={20} strokeWidth={3} />
                                    </button>

                                    <h3 className={`absolute left-1/2 -translate-x-1/2 font-medium uppercase tracking-widest text-black truncate max-w-[200px] ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                                        {configuringPlatform
                                            ? (links.some(l => l.layout === 'social' && (l.platform === configuringPlatform || (configuringPlatform !== 'site' && configuringPlatform !== 'custom' && l.url.includes(configuringPlatform)))) ? `Editar ${activeConfigPlatform?.name}` : `Adicionar ${activeConfigPlatform?.name}`)
                                            : 'Ícones Sociais'}
                                    </h3>

                                    {!isMobile && (
                                        <button
                                            onClick={handleCloseModal}
                                            className="p-1.5 text-black border-2 border-transparent hover:border-black hover:bg-[#ffdf00] transition-colors"
                                        >
                                            <X size={20} strokeWidth={3} />
                                        </button>
                                    )}
                                    {isMobile && <div className="w-8" />}
                                </div>

                                {!configuringPlatform ? (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="p-4 pb-3">
                                            <div className="relative">
                                                <Search size={14} strokeWidth={3} className="absolute left-3 top-1/2 -translate-y-1/2 text-black opacity-40" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="BUSCAR..."
                                                    className="w-full bg-white border border-black py-2 pl-9 pr-4 text-[10px] font-medium uppercase tracking-widest text-black outline-none focus:bg-[#ffdf00] placeholder:text-black/30 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={`flex-1 overflow-y-auto px-6 pb-6 ${isMobile ? 'scrollbar-hide' : 'custom-scrollbar'}`}
                                            style={isMobile ? {
                                                msOverflowStyle: 'none',
                                                scrollbarWidth: 'none'
                                            } : {}}
                                        >
                                            <div className="grid grid-cols-2 gap-3 px-1">
                                                {SOCIAL_NETWORKS.filter(p =>
                                                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).map(platform => {
                                                    const isSelected = !!links.find(l => l.layout === 'social' && (l.platform === platform.id || (platform.id !== 'site' && platform.id !== 'custom' && l.url.includes(platform.id))));
                                                    const isConnected = !!profile?.integrations?.find((i: any) => i.provider === platform.id);
                                                    const Icon = platform.icon;

                                                    return (
                                                        <div
                                                            key={platform.id}
                                                            onClick={() => toggleSocialLink(platform.id)}
                                                            className={`
                                                                relative flex flex-col items-center justify-center p-5 group cursor-pointer border transition-all
                                                                ${isSelected ? 'bg-[#97cd7a] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-[#ffdf00]'}
                                                            `}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    toggleSocialLink(platform.id);
                                                                }
                                                            }}
                                                        >
                                                            <div className="text-black mb-1 flex items-center justify-center h-8">
                                                                <Icon size={24} />
                                                            </div>
                                                            <span className="text-[9px] font-medium text-black uppercase tracking-widest text-center truncate w-full leading-none">
                                                                {platform.name}
                                                            </span>

                                                            {isConnected && (
                                                                <div className="absolute top-1 left-1 px-1 py-0.5 bg-black text-[#97cd7a] text-[6px] font-medium uppercase tracking-widest border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-0.5">
                                                                    <div className="w-1 h-1 bg-[#97cd7a] rounded-full animate-pulse"></div>
                                                                    SYNC
                                                                </div>
                                                            )}

                                                            {isSelected && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onChange(links.filter(l => !(l.layout === 'social' && (l.platform === platform.id || (platform.id !== 'site' && platform.id !== 'custom' && l.url.includes(platform.id))))));
                                                                    }}
                                                                    className="absolute top-1.5 right-1.5 p-1 text-black border-2 border-transparent hover:border-black hover:bg-red-500 hover:text-white transition-colors"
                                                                    title="Remover"
                                                                >
                                                                    <Trash2 size={14} strokeWidth={3} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {filteredPlatforms.length === 0 && (
                                                <div className="py-10 text-center text-slate-400 font-medium">
                                                    Nenhum ícone encontrado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col flex-1 px-8 pb-10">
                                        <div className="mt-4 space-y-6">
                                            {!(configuringPlatform === 'instagram' && isInstagramConnected) && (
                                                <div className="space-y-2">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={tempUrl}
                                                        onChange={(e) => setTempUrl(e.target.value)}
                                                        placeholder={`INSERIR ${activeConfigPlatform?.id === 'email' || activeConfigPlatform?.id === 'spotify' ? 'LINK' : 'USUÁRIO'}...`}
                                                        onKeyDown={(e) => e.key === 'Enter' && confirmPlatform()}
                                                        className="w-full bg-white border border-black px-4 py-3 text-black text-[10px] font-medium uppercase tracking-widest outline-none focus:bg-[#ffdf00] placeholder:text-black/30 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
                                                    />
                                                    <p className="text-[8px] font-normal text-black uppercase tracking-widest px-1 opacity-50 italic">
                                                        EX: @{activeConfigPlatform?.placeholder || 'USUARIO'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Instagram Rich Profile Card */}
                                            {configuringPlatform === 'instagram' && isInstagramConnected && (
                                                <div className="bg-white p-6 border-2 border-black flex flex-col items-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="relative mb-4">
                                                        <div className="w-20 h-20 overflow-hidden border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white">
                                                            <img
                                                                src={instagramIntegration.profile_data?.avatar_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
                                                                alt={instagramIntegration.profile_data?.username}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 bg-[#97cd7a] p-1.5 border-2 border-black text-black">
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                    </div>

                                                    <h4 className="text-xl font-medium text-black uppercase tracking-tighter">
                                                        @{instagramIntegration.profile_data?.username}
                                                    </h4>
                                                    <div className="flex flex-col items-center gap-1.5 mt-2">
                                                        <span className="text-[10px] font-medium text-black/50 uppercase tracking-widest flex items-center justify-center gap-1 bg-black/5 px-2 py-0.5">
                                                            <Instagram size={10} className="text-black" />
                                                            Instagram Business
                                                        </span>
                                                        <span className="text-[12px] font-medium text-[#32a800] uppercase tracking-widest">
                                                            {instagramIntegration.profile_data?.follower_count?.toLocaleString()} seguidores
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-0.5 bg-black/10 my-6" />

                                                    <div className="w-full space-y-4">
                                                        <button
                                                            onClick={() => setShowDisconnectConfirm(!showDisconnectConfirm)}
                                                            disabled={isConnectingInstagram}
                                                            className={`w-full py-4 px-6 border-2 border-black transition-all font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${showDisconnectConfirm
                                                                ? 'bg-black text-white'
                                                                : 'bg-white text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:bg-[#fff0f0]'
                                                                }`}
                                                        >
                                                            {isConnectingInstagram ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={14} strokeWidth={3} />
                                                            )}
                                                            {showDisconnectConfirm ? 'CANCELAR' : 'DESCONECTAR CONTA'}
                                                        </button>

                                                        <AnimatePresence>
                                                            {showDisconnectConfirm && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden bg-[#fff0f0] border-2 border-black"
                                                                >
                                                                    <div className="p-4 space-y-4">
                                                                        <div className="text-left">
                                                                            <p className="text-[10px] font-medium text-red-900 uppercase tracking-widest leading-tight">
                                                                                CONFIRMAR DESCONEXÃO?
                                                                            </p>
                                                                            <p className="text-[9px] font-normal text-red-600 mt-2 uppercase tracking-tighter leading-relaxed">
                                                                                ISSO REMOVERÁ O CARD DO SEU PERFIL E O ACESSO AOS POSTS DO INSTAGRAM.
                                                                            </p>
                                                                        </div>

                                                                        <button
                                                                            onClick={async () => {
                                                                                try {
                                                                                    setConnectionError(null);
                                                                                    setIsConnectingInstagram(true);
                                                                                    await apiClient.disconnectIntegration('instagram');

                                                                                    if (profile) {
                                                                                        const updatedIntegrations = profile.integrations?.filter((i: any) => i.provider !== 'instagram') || [];
                                                                                        setProfile({ ...profile, integrations: updatedIntegrations });
                                                                                    }

                                                                                    setShowDisconnectConfirm(false);
                                                                                    setIsConnectingInstagram(false);
                                                                                } catch (err: any) {
                                                                                    console.error('Failed to disconnect Instagram:', err);
                                                                                    setConnectionError(err.message || 'Erro ao desconectar Instagram');
                                                                                    setIsConnectingInstagram(false);
                                                                                }
                                                                            }}
                                                                            disabled={isConnectingInstagram}
                                                                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-[10px] uppercase tracking-widest rounded-lg shadow-sm shadow-red-200 transition-colors disabled:opacity-50"
                                                                        >
                                                                            {isConnectingInstagram ? 'Desconectando...' : 'Sim, Desconectar agora'}
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Instagram Connect Button (Only if NOT connected and authorized) */}
                                            {configuringPlatform === 'instagram' && !isInstagramConnected && isAuthorized && (
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setConnectionError(null);
                                                                setIsConnectingInstagram(true);
                                                                const userId = profile?.id || '';
                                                                if (!userId) throw new Error('Usuário não identificado.');
                                                                const { url } = await apiClient.getInstagramAuthUrl(userId, window.location.origin);
                                                                window.location.href = url;
                                                            } catch (err: any) {
                                                                setConnectionError(err.message || 'Erro ao iniciar conexão');
                                                                setIsConnectingInstagram(false);
                                                            }
                                                        }}
                                                        disabled={isConnectingInstagram}
                                                        className={`w-full bg-white hover:bg-[#ffdf00] border-2 border-black transition-all py-4 px-6 flex items-center justify-between group/ig shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${isConnectingInstagram ? 'opacity-70 cursor-wait' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isConnectingInstagram ? (
                                                                <Loader2 size={20} className="animate-spin text-black" />
                                                            ) : (
                                                                <Instagram size={20} className="text-black" />
                                                            )}
                                                            <div className="text-left leading-none space-y-1">
                                                                <span className="block text-xs font-medium uppercase tracking-widest text-black">
                                                                    {isConnectingInstagram ? 'INICIANDO...' : 'CONECTAR CONTA PROFISSIONAL'}
                                                                </span>
                                                                <span className="block text-[9px] font-normal uppercase tracking-wider text-black/70">Seguidores e posts em tempo real</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} strokeWidth={3} className="text-black group-hover/ig:translate-x-0.5 transition-transform" />
                                                    </button>
                                                    {connectionError && (
                                                        <p className="text-[10px] text-red-500 font-medium px-1 italic">{connectionError}</p>
                                                    )}
                                                </div>
                                            )}

                                            {configuringPlatform === 'tiktok' && isAuthorized && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            setConnectionError(null);
                                                            setIsConnectingTikTok(true);
                                                            const userId = profile?.id || '';
                                                            if (!userId) throw new Error('Usuário não identificado.');
                                                            const { url } = await apiClient.getTikTokAuthUrl(userId, window.location.origin);
                                                            window.location.href = url;
                                                        } catch (err: any) {
                                                            setConnectionError(err.message || 'Erro ao iniciar conexão');
                                                            setIsConnectingTikTok(false);
                                                        }
                                                    }}
                                                    disabled={isConnectingTikTok}
                                                    className={`w-full bg-white hover:bg-[#ffdf00] border-2 border-black transition-all py-4 px-6 flex items-center justify-between group/tt shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${isConnectingTikTok ? 'opacity-70 cursor-wait' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isConnectingTikTok ? (
                                                            <Loader2 size={18} className="animate-spin text-black" />
                                                        ) : (
                                                            <SiTiktok size={18} className="text-black" />
                                                        )}
                                                        <div className="text-left leading-none space-y-1">
                                                            <span className="block text-xs font-medium uppercase tracking-widest text-black">
                                                                {isConnectingTikTok ? 'INICIANDO...' : 'CONECTAR TIKTOK'}
                                                            </span>
                                                            <span className="block text-[9px] font-normal uppercase tracking-wider text-black/70">Sincronizar seguidores e verificação</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} strokeWidth={3} className="text-black group-hover/tt:translate-x-0.5 transition-transform" />
                                                </button>
                                            )}

                                            {/* Action Button - Hidden for Instagram if connected */}
                                            {!(configuringPlatform === 'instagram' && isInstagramConnected) && (
                                                <button
                                                    onClick={confirmPlatform}
                                                    disabled={!tempUrl}
                                                    className={`
                                                        w-full mt-2 py-3 font-medium text-[10px] uppercase tracking-widest transition-all border border-black
                                                        ${tempUrl
                                                            ? 'bg-[#97cd7a] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
                                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                        }
                                                    `}
                                                >
                                                    {links.some(l => l.layout === 'social' && (l.platform === configuringPlatform || (configuringPlatform !== 'site' && configuringPlatform !== 'custom' && l.url.includes(configuringPlatform)))) ? 'Salvar' : 'Adicionar'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
