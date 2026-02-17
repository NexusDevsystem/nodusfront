import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkItem } from '../types';
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
    ExternalLink
} from 'lucide-react';
import { SiSpotify } from 'react-icons/si';
import { SOCIAL_NETWORKS } from '../constants';

interface SocialLinksEditorProps {
    links: LinkItem[];
    onChange: (links: LinkItem[] | ((prev: LinkItem[]) => LinkItem[])) => void;
}

export default function SocialLinksEditor({ links, onChange }: SocialLinksEditorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [configuringPlatform, setConfiguringPlatform] = useState<string | null>(null);
    const [tempUrl, setTempUrl] = useState('');

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const socialLinks = links.filter(link => link.layout === 'social' && link.type !== 'collection');

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSearchTerm('');
        setConfiguringPlatform(null);
        setTempUrl('');
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
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Redes Sociais</h3>
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

                {socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-4 md:gap-5 py-1">
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
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={handleCloseModal}
                            />
                            <div
                                className="relative bg-white w-full max-w-lg max-h-[80vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
                            >
                                <div className="p-6 flex items-center justify-between shrink-0 relative">
                                    <button
                                        onClick={() => configuringPlatform ? setConfiguringPlatform(null) : handleCloseModal()}
                                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <h3 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-900 truncate max-w-[240px]">
                                        {configuringPlatform
                                            ? (links.some(l => l.layout === 'social' && (l.platform === configuringPlatform || (configuringPlatform !== 'site' && configuringPlatform !== 'custom' && l.url.includes(configuringPlatform)))) ? `Editar ${activeConfigPlatform?.name}` : `Adicionar ${activeConfigPlatform?.name}`)
                                            : 'Adicionar ícone social'}
                                    </h3>

                                    <button
                                        onClick={handleCloseModal}
                                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
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
                                                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
                                            <div className="space-y-1">
                                                {SOCIAL_NETWORKS.filter(p =>
                                                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).map(platform => {
                                                    const isSelected = !!links.find(l => l.layout === 'social' && (l.platform === platform.id || (platform.id !== 'site' && platform.id !== 'custom' && l.url.includes(platform.id))));
                                                    const Icon = platform.icon;

                                                    return (
                                                        <button
                                                            key={platform.id}
                                                            onClick={() => toggleSocialLink(platform.id)}
                                                            className={`
                                                                w-full flex items-center justify-between p-4 rounded-2xl group
                                                                ${isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-slate-900">
                                                                    <Icon size={24} />
                                                                </div>
                                                                <span className="text-base font-bold text-slate-900 tracking-tight">
                                                                    {platform.name}
                                                                </span>
                                                            </div>

                                                            <div className="text-slate-400">
                                                                {isSelected ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="bg-[#32a800] w-2 h-2 rounded-full" />
                                                                        <button
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
                                                        </button>
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
                                            <div className="space-y-3">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={tempUrl}
                                                    onChange={(e) => setTempUrl(e.target.value)}
                                                    placeholder={`Inserir ${activeConfigPlatform?.id === 'email' || activeConfigPlatform?.id === 'spotify' ? 'Link' : 'Usuário'} do ${activeConfigPlatform?.name}*`}
                                                    onKeyDown={(e) => e.key === 'Enter' && confirmPlatform()}
                                                    className="w-full bg-slate-50/80 border-none focus:bg-slate-50 rounded-2xl px-5 py-5 text-slate-900 font-medium outline-none placeholder:text-slate-500"
                                                />
                                                <p className="text-sm text-slate-400 px-1">
                                                    Exemplo: @{activeConfigPlatform?.placeholder || 'usuario'}
                                                </p>
                                            </div>


                                            <button
                                                onClick={confirmPlatform}
                                                disabled={!tempUrl}
                                                className={`
                                                    w-full py-5 rounded-[24px] font-bold text-base
                                                    ${tempUrl
                                                        ? 'bg-[#32a800] text-white shadow-lg shadow-[#32a800]/20'
                                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                {links.some(l => l.layout === 'social' && (l.platform === configuringPlatform || (configuringPlatform !== 'site' && configuringPlatform !== 'custom' && l.url.includes(configuringPlatform)))) ? 'Salvar' : 'Adicionar'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
