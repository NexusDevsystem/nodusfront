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
    const isAuthorized = profile?.username === 'noduscc' || profile?.username === 'nexus';

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
        <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 mb-6 group transition-all overflow-hidden">
            <div className="p-6 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-lg md:text-xl font-medium text-slate-900 tracking-tight">Redes Sociais</h3>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">Ícones rápidos exibidos no topo do seu perfil</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#32a800] hover:text-[#32a800]/80 transition-all active:scale-90 shrink-0"
                        title="Gerenciar Redes Sociais"
                    >
                        <Plus size={20} className="md:w-6 md:h-6" />
                    </button>
                </div>

                {(socialLinks.length > 0 || isInstagramConnected) && (
                    <div className="flex flex-wrap gap-4 md:gap-5 py-1">
                        {/* Auto-render Instagram if connected but not explicitly added as link */}
                        {isInstagramConnected && !socialLinks.some(l => l.platform === 'instagram') && (
                            <button
                                onClick={() => toggleSocialLink('instagram')}
                                className="text-slate-900 transition-all hover:scale-110 active:scale-90 p-1 relative"
                            >
                                <Instagram size={28} className="md:w-8 md:h-8" />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#32a800] rounded-full border-2 border-white" />
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
                                    className="text-slate-900 transition-all hover:scale-110 active:scale-90 p-1"
                                >
                                    <Icon size={28} className="md:w-8 md:h-8" />
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
                                    relative bg-white shadow-2xl flex flex-col overflow-hidden
                                    ${isMobile ? 'w-full h-[90vh] rounded-t-[2.5rem] touch-none' : 'w-full max-w-lg max-h-[80vh] rounded-[32px]'}
                                `}
                            >
                                {/* Drag Handle for Mobile */}
                                {isMobile && (
                                    <div className="flex justify-center p-3 pt-4 shrink-0">
                                        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                                    </div>
                                )}

                                <div className="p-6 flex items-center justify-between shrink-0 relative">
                                    <button
                                        onClick={() => configuringPlatform ? setConfiguringPlatform(null) : handleCloseModal()}
                                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <h3 className={`absolute left-1/2 -translate-x-1/2 font-medium text-slate-900 truncate max-w-[240px] ${isMobile ? 'text-base' : 'text-lg'}`}>
                                        {configuringPlatform
                                            ? (links.some(l => l.layout === 'social' && (l.platform === configuringPlatform || (configuringPlatform !== 'site' && configuringPlatform !== 'custom' && l.url.includes(configuringPlatform)))) ? `Editar ${activeConfigPlatform?.name}` : `Adicionar ${activeConfigPlatform?.name}`)
                                            : 'Adicionar ícone social'}
                                    </h3>

                                    {!isMobile && (
                                        <button
                                            onClick={handleCloseModal}
                                            className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                                        >
                                            <X size={24} />
                                        </button>
                                    )}
                                    {isMobile && <div className="w-10" />}
                                </div>

                                {!configuringPlatform ? (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="px-6 pb-4">
                                            <div className="relative">
                                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Buscar"
                                                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-normal outline-none focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
                                            <div className="space-y-1">
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
                                                                w-full flex items-center justify-between p-4 rounded-2xl group cursor-pointer
                                                                ${isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}
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
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-slate-900">
                                                                    <Icon size={24} />
                                                                </div>
                                                                <span className="text-base font-medium text-slate-900 tracking-tight">
                                                                    {platform.name}
                                                                </span>
                                                                {isConnected && (
                                                                    <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-[#32a800] text-[9px] font-bold uppercase rounded-md tracking-widest">
                                                                        Conectado
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="text-slate-400">
                                                                {isSelected ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="bg-[#32a800] w-2 h-2 rounded-full" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onChange(links.filter(l => !(l.layout === 'social' && (l.platform === platform.id || (platform.id !== 'site' && platform.id !== 'custom' && l.url.includes(platform.id))))));
                                                                            }}
                                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-slate-100 rounded-xl transition-colors"
                                                                            title="Remover"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <ChevronRight size={20} />
                                                                )}
                                                            </div>
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
                                            {/* Normal Input Section - Hidden for Instagram if connected */}
                                            {!(configuringPlatform === 'instagram' && isInstagramConnected) && (
                                                <div className="space-y-3">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={tempUrl}
                                                        onChange={(e) => setTempUrl(e.target.value)}
                                                        placeholder={`Inserir ${activeConfigPlatform?.id === 'email' || activeConfigPlatform?.id === 'spotify' ? 'Link' : 'Usuário'} do ${activeConfigPlatform?.name}*`}
                                                        onKeyDown={(e) => e.key === 'Enter' && confirmPlatform()}
                                                        className="w-full bg-slate-50/80 border-none focus:bg-slate-50 rounded-2xl px-5 py-5 text-slate-900 font-normal outline-none placeholder:text-slate-500"
                                                    />
                                                    <p className="text-sm text-slate-400 px-1">
                                                        Exemplo: @{activeConfigPlatform?.placeholder || 'usuario'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Instagram Rich Profile Card */}
                                            {configuringPlatform === 'instagram' && isInstagramConnected && (
                                                <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="relative mb-4">
                                                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                                                            <img
                                                                src={instagramIntegration.profile_data?.avatar_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
                                                                alt={instagramIntegration.profile_data?.username}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 bg-[#32a800] p-1.5 rounded-full border-2 border-white text-white">
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                    </div>

                                                    <h4 className="text-lg font-medium text-slate-900 tracking-tight flex items-center gap-1.5">
                                                        @{instagramIntegration.profile_data?.username}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs font-normal text-slate-500 flex items-center gap-1">
                                                            <Instagram size={12} className="text-[#dc2743]" />
                                                            Instagram Business
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <span className="text-xs font-medium text-[#32a800]">
                                                            {instagramIntegration.profile_data?.follower_count?.toLocaleString()} seguidores
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-px bg-slate-200/60 my-6" />

                                                    <div className="w-full space-y-3">
                                                        <button
                                                            onClick={() => setShowDisconnectConfirm(!showDisconnectConfirm)}
                                                            disabled={isConnectingInstagram}
                                                            className={`w-full py-3.5 px-6 rounded-xl transition-all font-medium text-xs flex items-center justify-center gap-2 active:scale-[0.98] ${showDisconnectConfirm
                                                                ? 'bg-slate-100 text-slate-500'
                                                                : 'bg-white border border-red-100 text-red-500 hover:bg-red-50'
                                                                }`}
                                                        >
                                                            {isConnectingInstagram ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={14} />
                                                            )}
                                                            {showDisconnectConfirm ? 'Voltar' : 'Desconectar Conta'}
                                                        </button>

                                                        <AnimatePresence>
                                                            {showDisconnectConfirm && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden bg-red-50 rounded-xl border border-red-100"
                                                                >
                                                                    <div className="p-4 space-y-4">
                                                                        <div className="text-left">
                                                                            <p className="text-xs font-medium text-red-900 leading-tight">
                                                                                Confirmar desconexão?
                                                                            </p>
                                                                            <p className="text-[10px] text-red-600 mt-1 leading-relaxed">
                                                                                Isso removerá o card do seu perfil e o acesso aos posts.
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
                                                                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-sm shadow-red-200 transition-colors disabled:opacity-50"
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
                                                        className={`w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all py-4 px-6 rounded-2xl flex items-center justify-between group/ig ${isConnectingInstagram ? 'opacity-70 cursor-wait' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isConnectingInstagram ? (
                                                                <Loader2 size={20} className="animate-spin text-[#dc2743]" />
                                                            ) : (
                                                                <Instagram size={20} className="text-[#dc2743]" />
                                                            )}
                                                            <div className="text-left">
                                                                <span className="block text-sm font-medium text-slate-800">
                                                                    {isConnectingInstagram ? 'Iniciando...' : 'Conectar Conta Profissional'}
                                                                </span>
                                                                <span className="block text-[10px] text-slate-500">Seguidores e posts em tempo real</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-slate-400 group-hover/ig:translate-x-0.5 transition-transform" />
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
                                                    className={`w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all py-4 px-6 rounded-2xl flex items-center justify-between group/tt ${isConnectingTikTok ? 'opacity-70 cursor-wait' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isConnectingTikTok ? (
                                                            <Loader2 size={18} className="animate-spin text-black" />
                                                        ) : (
                                                            <SiTiktok size={18} className="text-[#000000]" />
                                                        )}
                                                        <div className="text-left">
                                                            <span className="block text-sm font-medium text-slate-800">
                                                                {isConnectingTikTok ? 'Iniciando...' : 'Conectar TikTok'}
                                                            </span>
                                                            <span className="block text-[10px] text-slate-500">Sincronizar seguidores e verificação</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-400 group-hover/tt:translate-x-0.5 transition-transform" />
                                                </button>
                                            )}

                                            {/* Action Button - Hidden for Instagram if connected */}
                                            {!(configuringPlatform === 'instagram' && isInstagramConnected) && (
                                                <button
                                                    onClick={confirmPlatform}
                                                    disabled={!tempUrl}
                                                    className={`
                                                        w-full py-5 rounded-[24px] font-medium text-base transition-all
                                                        ${tempUrl
                                                            ? 'bg-[#32a800] text-white shadow-lg shadow-[#32a800]/20 active:scale-[0.98]'
                                                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
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
