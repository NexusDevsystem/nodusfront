import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Link as LinkIcon, Layout, ShoppingBag,
    MessageSquare, Instagram, Youtube, MessageCircle,
    ChevronRight, Plus, DollarSign, Store, Share2,
    Smartphone, Mail, Type, Hash, Send as SendIcon, Zap, CreditCard,
    Tag, Grid, Calendar, BarChart3, Lock, Video, Phone
} from 'lucide-react';
import { SiSpotify, SiTiktok, SiPaypal, SiWhatsapp, SiDiscord, SiThreads } from 'react-icons/si';
import { SOCIAL_NETWORKS } from '../constants';

interface AddLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLink: (url?: string) => void;
    onAddCollection: (name: string, url?: string, layout?: 'list' | 'carousel') => void;
    onAddProduct: (collectionName: string) => void;
    onAddIncentive: (type: 'pix' | 'paypal', key: string) => void;
    onAddSocial: (platform: string) => void;
    onAddHeader: () => void;
    onAddAgenda: () => void;
    onAddMap: () => void;
    onAddMediaKit: () => void;
    planType?: 'free' | 'monthly' | 'annual';
}




const FacebookIcon = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const TwitchIcon = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-2 13h-4l-3 3v-3H5V4h14v11z" />
        <path d="M16 7h-2v4h2V7zm-4 0h-2v4h2V7z" />
    </svg>
);

const PixIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        className={className}
        fill="currentColor"
    >
        <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z" /><path d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z" />
    </svg>
);

const AddLinkModal: React.FC<AddLinkModalProps> = ({
    isOpen,
    onClose,
    onAddLink,
    onAddCollection,
    onAddProduct,
    onAddIncentive,
    onAddSocial,
    onAddHeader,
    onAddAgenda,
    onAddMap,
    onAddMediaKit,
    planType = 'free'
}) => {
    const isPro = planType === 'monthly' || planType === 'annual';
    const { t } = useTranslation();
    const [url, setUrl] = useState('');


    const [detectedInfo, setDetectedInfo] = useState<{ platform: string, icon: React.ReactNode, type: 'social' | 'link' } | null>(null);
    const [showShopCollectionStep, setShowShopCollectionStep] = useState(false);
    const [shopCollectionName, setShopCollectionName] = useState('');
    const [showCollectionStep, setShowCollectionStep] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const [collectionLayout, setCollectionLayout] = useState<'list' | 'carousel'>('list');
    const [showIncentiveStep, setShowIncentiveStep] = useState(false);
    const [incentiveType, setIncentiveType] = useState<'pix' | 'paypal'>('pix');
    const [incentiveKey, setIncentiveKey] = useState('');

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-detect link type
    useEffect(() => {
        const detectLink = () => {
            if (!url.trim() || !url.includes('.')) {
                setDetectedInfo(null);
                return;
            }

            const lowerUrl = url.toLowerCase();

            // Social Networks detection
            const detectedSocial = SOCIAL_NETWORKS.find(platform => {
                if (platform.id === 'custom') return false;
                return lowerUrl.includes(platform.id.toLowerCase()) ||
                    lowerUrl.includes(platform.name.toLowerCase());
            });

            if (detectedSocial) {
                const Icon = detectedSocial.icon;
                setDetectedInfo({
                    platform: detectedSocial.name,
                    icon: <Icon size={16} />,
                    type: 'social'
                });
                return;
            }

            // Other common platforms
            if (lowerUrl.includes('spotify.com')) {
                setDetectedInfo({ platform: 'Spotify', icon: <SiSpotify size={16} />, type: 'link' });
            } else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
                setDetectedInfo({ platform: 'YouTube', icon: <Youtube size={16} />, type: 'link' });
            } else if (lowerUrl.includes('tiktok.com')) {
                setDetectedInfo({ platform: 'TikTok', icon: <SiTiktok size={14} />, type: 'link' });
            } else if (lowerUrl.includes('livepix.gg') || lowerUrl.includes('livepix.')) {
                setDetectedInfo({ platform: 'livepix', icon: <PixIcon size={16} />, type: 'link' });
            } else {
                setDetectedInfo({ platform: t('links.unknownLink'), icon: <LinkIcon size={16} />, type: 'link' });
            }
        };

        const timer = setTimeout(detectLink, 300);
        return () => clearTimeout(timer);
    }, [url]);

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onAddLink(url);
            onClose();
            setUrl('');
        }
    };

    const renderContent = () => {
        if (showCollectionStep) {
            return (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-400">
                    <div className="flex items-center gap-4 mb-2">
                        <button
                            onClick={() => setShowCollectionStep(false)}
                            className="p-2 text-black hover:bg-[#ffdf00] hover:text-black border-2 border-black transition-all rounded-lg shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[3px]"
                        >
                            <ChevronRight size={16} strokeWidth={3} className="rotate-180" />
                        </button>
                        <h4 className="text-lg font-black text-black uppercase tracking-tighter">{t('links.createCollection')}</h4>
                    </div>

                    <div className="space-y-6 bg-slate-50 p-6 border-2 border-black rounded-3xl">
                        <p className="text-[9px] font-black text-black/50 leading-relaxed uppercase tracking-[0.2em] px-1">
                            {t('links.collectionDesc', { extra: url.trim() ? t('links.collectionUrlHint') : "" })}
                        </p>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-1">{t('links.collectionNameLabel')}</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder={t('links.collectionNamePlaceholder')}
                                className="w-full bg-white border-2 border-black rounded-xl py-3 px-4 text-sm font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[0_4px_0_0_#1a1a1a] transition-all uppercase tracking-widest"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && collectionName.trim()) {
                                        onAddCollection(collectionName, url, collectionLayout);
                                        onClose();
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-1">{t('links.layoutLabel')}</label>
                            <div className="grid grid-cols-2 gap-5">
                                {[
                                    {
                                        id: 'list',
                                        label: t('links.layoutList') || 'Lista',
                                        icon: (
                                            <svg viewBox="0 0 100 80" className="w-14 h-auto">
                                                <rect x="10" y="10" width="80" height="24" fill="white" stroke="black" strokeWidth="6" rx="6" />
                                                <rect x="23" y="19.5" width="30" height="5" fill="black" rx="1.5" />
                                                <rect x="10" y="44" width="80" height="24" fill="white" stroke="black" strokeWidth="6" rx="6" />
                                                <rect x="23" y="53.5" width="30" height="5" fill="black" rx="1.5" />
                                            </svg>
                                        )
                                    },
                                    {
                                        id: 'carousel',
                                        label: t('links.layoutCarousel') || 'Carrossel',
                                        icon: (
                                            <svg viewBox="0 0 100 80" className="w-14 h-auto overflow-visible">
                                                <rect x="0" y="10" width="40" height="60" fill="white" stroke="black" strokeWidth="8" rx="6" />
                                                <rect x="55" y="10" width="40" height="60" fill="white" stroke="black" strokeWidth="8" opacity="0.6" rx="6" />
                                                <rect x="110" y="10" width="40" height="60" fill="white" stroke="black" strokeWidth="8" opacity="0.3" rx="6" />
                                            </svg>
                                        )
                                    },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setCollectionLayout(opt.id as any)}
                                        className={`group relative flex flex-col items-center gap-3 p-4 border-2 rounded-2xl transition-all duration-300 ${collectionLayout === opt.id ? 'border-black bg-[#ffdf00] shadow-none translate-y-[3px]' : 'border-black/5 bg-white hover:border-black hover:translate-y-[1px] hover:shadow-[0_1px_0_0_#1a1a1a] shadow-[0_2px_0_0_#1a1a1a]'}`}
                                    >
                                        <div className="flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                            {opt.icon}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${collectionLayout === opt.id ? 'text-black' : 'text-black/40'}`}>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={!collectionName.trim()}
                            onClick={() => {
                                onAddCollection(collectionName, url, collectionLayout);
                                onClose();
                            }}
                            className="w-full py-4 bg-[#97cd7a] text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[4px] active:translate-y-[2px] transition-all flex items-center justify-center gap-3"
                        >
                            <Plus size={18} strokeWidth={4} />
                            <span>{t('links.createCollectionButton')}</span>
                        </button>
                    </div>
                </div>
            );
        }

        if (showShopCollectionStep) {
            return (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-400">
                    <div className="flex items-center gap-4 mb-2">
                        <button
                            onClick={() => setShowShopCollectionStep(false)}
                            className="p-2 text-black hover:bg-[#ffdf00] hover:text-black border-2 border-black transition-all rounded-lg shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-0.5"
                        >
                            <ChevronRight size={16} strokeWidth={3} className="rotate-180" />
                        </button>
                        <h4 className="text-lg font-black text-black uppercase tracking-tighter">{t('links.createProductCollection')}</h4>
                    </div>

                    <div className="space-y-6 bg-slate-50 p-6 border-2 border-black rounded-3xl">
                        <p className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em] leading-relaxed">
                            {t('links.commerceCollectionDesc') || 'Agrupe seus produtos em uma vitrine visual irresistível'}
                        </p>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-1">{t('links.categoryNameLabel')}</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder={t('links.categoryPlaceholder') || 'Ex: Meus Favoritos, Nova Coleção...'}
                                className="w-full bg-white border-2 border-black rounded-xl py-3 px-4 text-sm font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[0_4px_0_0_#1a1a1a] transition-all uppercase tracking-widest"
                                value={shopCollectionName}
                                onChange={(e) => setShopCollectionName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && shopCollectionName.trim()) {
                                        onAddProduct(shopCollectionName);
                                        onClose();
                                    }
                                }}
                            />
                        </div>

                        <div className="p-6 bg-cyan-400/10 border-2 border-black/10 rounded-3xl flex items-start gap-4">
                            <Zap size={24} className="text-cyan-500 shrink-0" />
                            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest leading-relaxed">
                                {t('links.shopCollectionTip') || 'Dica: Coleções de produtos convertem 40% mais quando têm nomes diretos e curtos.'}
                            </p>
                        </div>

                        <button
                            disabled={!shopCollectionName.trim()}
                            onClick={() => {
                                onAddProduct(shopCollectionName);
                                onClose();
                            }}
                            className="w-full py-4 bg-cyan-400 text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[4px] active:translate-y-[2px] transition-all flex items-center justify-center gap-3"
                        >
                            <Plus size={18} strokeWidth={4} />
                            <span>{t('links.createCollectionButton')}</span>
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Section: Essentials */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-[#ffdf00] border-2 border-black shadow-[0_2px_0_0_#1a1a1a] rounded-full mr-1"></div>
                        <h4 className="text-sm font-black text-black uppercase tracking-widest">{t('links.suggested')}</h4>
                        <div className="h-0.5 flex-1 bg-black/5 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { id: 'link', icon: <LinkIcon size={isMobile ? 20 : 24} strokeWidth={3} />, label: isMobile ? t('links.linkLabel') : t('links.externalLink'), desc: t('links.insertAnyUrl'), color: 'bg-white', accent: 'bg-[#ffdf00]', action: () => { onAddLink(); onClose(); } },
                            { id: 'collection', icon: <Layout size={isMobile ? 20 : 24} strokeWidth={3} />, label: t('links.collectionLabel'), desc: t('links.collectionDescShort'), color: 'bg-white', accent: 'bg-[#97cd7a]', action: () => { setShowCollectionStep(true); } },
                            { id: 'product', icon: <ShoppingBag size={isMobile ? 20 : 24} strokeWidth={3} />, label: isMobile ? t('links.productLabel') : t('links.newProduct'), desc: t('links.productDescShort'), color: 'bg-white', accent: 'bg-cyan-400', action: () => { setShowShopCollectionStep(true); } },
                            { id: 'agenda', icon: <Calendar size={isMobile ? 20 : 24} strokeWidth={3} />, label: t('agenda.title') || 'Agenda', desc: t('agenda.descShort') || 'Liste seus eventos e shows', color: 'bg-white', accent: 'bg-[#ffdf00]', action: () => { onAddAgenda(); onClose(); } },
                            { id: 'map', icon: <Store size={isMobile ? 20 : 24} strokeWidth={3} />, label: t('links.mapLabel') || 'Endereço', desc: t('links.mapDesc') || 'Destaque a localização do seu negócio', color: 'bg-white', accent: 'bg-[#97cd7a]', action: () => { onAddMap(); onClose(); } },
                            { id: 'mediakit', icon: isPro ? <BarChart3 size={isMobile ? 20 : 24} strokeWidth={3} /> : <Lock size={isMobile ? 20 : 24} strokeWidth={3} className="text-black/30" />, label: t('mediakit.title') || 'Mídia Kit (PRO)', desc: t('mediakit.descShort') || 'Mostre seus números p/ marcas', color: 'bg-white', accent: isPro ? 'bg-[#97cd7a]' : 'bg-slate-100', action: isPro ? () => { onAddMediaKit(); onClose(); } : () => { /* Bloqueado */ } },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={item.action}
                                className={`
                                    group relative flex flex-col items-start p-4 md:p-5 border-2 border-black text-left transition-all duration-300
                                    ${item.color} rounded-xl md:rounded-2xl shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[4px] overflow-hidden
                                `}
                            >
                                <div className={`
                                    mb-3 md:mb-4 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border-2 border-black ${item.accent} 
                                    shadow-[0_3px_0_0_#1a1a1a] rounded-lg md:rounded-xl group-hover:scale-110 transition-transform
                                `}>
                                    <div className="text-black group-hover:rotate-6 transition-transform">
                                        {item.icon}
                                    </div>
                                </div>
                                <h5 className="text-[10px] md:text-[11px] font-black text-black uppercase tracking-wider mb-1 leading-none">{item.label}</h5>
                                {!isMobile && <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest leading-none truncate w-full">{item.desc}</p>}

                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-20 transition-opacity">
                                    <Plus size={12} strokeWidth={4} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section: Popular Links */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-[#97cd7a] border-2 border-black shadow-[0_2px_0_0_#1a1a1a] rounded-full mr-1"></div>
                        <h4 className="text-sm font-black text-black uppercase tracking-widest">{t('links.popularLinks')}</h4>
                        <div className="h-0.5 flex-1 bg-black/5 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { id: 'instagram', icon: <Instagram size={18} strokeWidth={3} className="text-black" />, title: 'Instagram', desc: t('links.postsReels'), color: 'bg-white', action: () => onAddSocial('instagram') },
                            { id: 'tiktok', icon: <SiTiktok size={16} className="text-black" />, title: 'TikTok', desc: t('links.shortVideos'), color: 'bg-white', action: () => onAddSocial('tiktok') },
                            { id: 'youtube', icon: <Youtube size={18} strokeWidth={3} className="text-black" />, title: 'YouTube', desc: t('links.channelOrVideos'), color: 'bg-white', action: () => onAddSocial('youtube') },
                            { id: 'spotify', icon: <SiSpotify size={16} className="text-black" />, title: 'Spotify', desc: t('links.musicPlaylists'), color: 'bg-white', action: () => onAddSocial('spotify') },
                            { id: 'whatsapp', icon: <SiWhatsapp size={18} className="text-black" />, title: 'WhatsApp', desc: t('links.directChat'), color: 'bg-white', action: () => onAddSocial('whatsapp') },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { item.action(); onClose(); }}
                                className="w-full flex items-center gap-3 p-3 bg-white border-2 border-black hover:bg-slate-50 transition-all shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[4px] rounded-xl group"
                            >
                                <div className={`w-9 h-9 flex items-center justify-center shrink-0 border-2 border-black bg-slate-50 shadow-[0_2px_0_0_#1a1a1a] rounded-lg group-hover:scale-105 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-[10px] font-black uppercase text-black leading-none mb-1">{item.title}</div>
                                    <div className="text-[8px] text-black/40 font-bold uppercase tracking-widest truncate">{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section: Monetization */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-cyan-400 border-2 border-black shadow-[0_2px_0_0_#1a1a1a] rounded-full mr-1"></div>
                        <h4 className="text-sm font-black text-black uppercase tracking-widest">{t('links.commerce')}</h4>
                        <div className="h-0.5 flex-1 bg-black/5 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 'product', icon: <ShoppingBag size={24} strokeWidth={2.5} />, title: t('links.productStore'), desc: t('links.physicalOrDigital'), accent: 'bg-cyan-400', action: () => setShowShopCollectionStep(true) },
                            { id: 'incentive', icon: <DollarSign size={24} strokeWidth={2.5} />, title: t('links.incentives'), desc: t('links.receiveSupportDirectly'), accent: 'bg-[#97cd7a]', action: () => setShowIncentiveStep(true) },
                            { id: 'affiliate', icon: <Store size={24} strokeWidth={2.5} />, title: t('links.affiliateLink'), desc: t('links.affiliateDesc'), accent: 'bg-[#ffdf00]', action: () => { } },
                            { id: 'subscription', icon: <Lock size={24} strokeWidth={2.5} />, title: t('links.subscription') || 'Assinatura', desc: t('links.subscriptionDesc') || 'Conteúdo exclusivo p/ assinantes', accent: 'bg-indigo-400', action: () => { } },
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.action}
                                className="group flex items-center gap-5 p-5 bg-white border-2 border-black hover:bg-slate-50 transition-all shadow-[0_5px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[5px] rounded-2xl text-left"
                            >
                                <div className={`w-12 h-12 flex items-center justify-center border-2 border-black shrink-0 ${item.accent} shadow-[0_4px_0_0_#1a1a1a] rounded-xl group-hover:rotate-6 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-black text-black uppercase tracking-widest leading-none mb-1.5">{item.title}</div>
                                    <div className="text-[9px] text-black/40 font-bold uppercase tracking-widest leading-tight">{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section: Media & Integrations */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-red-400 border-2 border-black shadow-[0_2px_0_0_#1a1a1a] rounded-full mr-1"></div>
                        <h4 className="text-sm font-black text-black uppercase tracking-widest">{t('links.media')}</h4>
                        <div className="h-0.5 flex-1 bg-black/5 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 'youtube', icon: <Youtube size={24} strokeWidth={2.5} />, title: 'YouTube', desc: t('links.videosOrShorts'), accent: 'bg-red-400' },
                            { id: 'spotify', icon: <SiSpotify size={22} />, title: 'Spotify', desc: t('links.musicOrPlaylists'), accent: 'bg-green-400' },
                            { id: 'tiktok', icon: <SiTiktok size={22} />, title: 'TikTok', desc: t('links.viralVideos'), accent: 'bg-white' },
                            { id: 'twitch', icon: <TwitchIcon size={24} strokeWidth={2.5} />, title: 'Twitch', desc: t('links.yourLiveStream'), accent: 'bg-purple-400' },
                            { id: 'soundcloud', icon: <Share2 size={24} strokeWidth={2.5} />, title: 'SoundCloud', desc: 'Sua música e podcasts', accent: 'bg-orange-400' },
                            { id: 'vimeo', icon: <Video size={24} strokeWidth={2.5} />, title: 'Vimeo', desc: 'Vídeos em alta qualidade', accent: 'bg-sky-400' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { onAddLink(); onClose(); }}
                                className="group flex items-center gap-5 p-5 bg-white border-2 border-black hover:bg-slate-50 transition-all shadow-[0_5px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[5px] rounded-2xl text-left"
                            >
                                <div className={`w-12 h-12 flex items-center justify-center border-2 border-black shrink-0 ${item.accent} shadow-[0_3px_0_0_#1a1a1a] rounded-xl group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-black text-black uppercase tracking-widest leading-none mb-1.5">{item.title}</div>
                                    <div className="text-[9px] text-black/40 font-bold uppercase tracking-widest leading-none truncate">{item.desc}</div>
                                </div>
                                <Plus size={16} strokeWidth={4} className="text-black/10 group-hover:text-black group-hover:rotate-90 transition-all px-1" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section: Contact */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-[#ffdf00] border-2 border-black shadow-[0_2px_0_0_#1a1a1a] rounded-full mr-1"></div>
                        <h4 className="text-sm font-black text-black uppercase tracking-widest">{t('links.contact')}</h4>
                        <div className="h-0.5 flex-1 bg-black/5 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 'whatsapp', icon: <SiWhatsapp size={24} />, title: 'WhatsApp', desc: 'Conversa direta e rápida', accent: 'bg-green-400', action: () => onAddSocial('whatsapp') },
                            { id: 'email', icon: <Share2 size={24} strokeWidth={2.5} />, title: 'E-mail', desc: 'Contato profissional oficial', accent: 'bg-[#ffdf00]', action: () => onAddSocial('email') },
                            { id: 'phone', icon: <Phone size={24} strokeWidth={2.5} />, title: 'Telefone', desc: 'Chamada direta via voz', accent: 'bg-cyan-400', action: () => onAddSocial('phone') },
                            { id: 'location', icon: <Store size={24} strokeWidth={2.5} />, title: 'Localização', desc: 'Endereço físico no mapa', accent: 'bg-indigo-400', action: () => onAddMap() },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { item.action(); onClose(); }}
                                className="group flex items-center gap-4 p-4 bg-white border-2 border-black hover:bg-slate-50 transition-all shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[4px] rounded-2xl text-left"
                            >
                                <div className={`w-11 h-11 flex items-center justify-center border-2 border-black shrink-0 ${item.accent} shadow-[0_3px_0_0_#1a1a1a] rounded-xl group-hover:rotate-6 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-black text-black uppercase tracking-widest leading-none mb-1.5">{item.title}</div>
                                    <div className="text-[9px] text-black/40 font-bold uppercase tracking-widest leading-none truncate">{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section: Social Profiles */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-indigo-400 border-2 border-black shadow-[0_2px_0_0_#1a1a1a] rounded-full mr-1"></div>
                        <h4 className="text-sm font-black text-black uppercase tracking-widest">{t('links.social')}</h4>
                        <div className="h-0.5 flex-1 bg-black/5 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'instagram', icon: <Instagram size={22} strokeWidth={3} />, title: 'Instagram', accent: 'bg-[#ffdf00]' },
                            { id: 'tiktok', icon: <SiTiktok size={20} />, title: 'TikTok', accent: 'bg-white' },
                            { id: 'twitter', icon: <Hash size={22} strokeWidth={3} />, title: 'X (Twitter)', accent: 'bg-slate-100' },
                            { id: 'linkedin', icon: <Share2 size={22} strokeWidth={3} />, title: 'LinkedIn', accent: 'bg-blue-100' },
                            { id: 'facebook', icon: <FacebookIcon size={22} />, title: 'Facebook', accent: 'bg-cyan-50' },
                            { id: 'youtube', icon: <Youtube size={22} strokeWidth={3} />, title: 'YouTube', accent: 'bg-red-50' },
                            { id: 'threads', icon: <SiThreads size={22} />, title: 'Threads', accent: 'bg-slate-50' },
                            { id: 'discord', icon: <SiDiscord size={22} />, title: 'Discord', accent: 'bg-indigo-100' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { onAddSocial(item.id); onClose(); }}
                                className="group flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-black hover:bg-slate-50 transition-all shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[4px] rounded-2xl"
                            >
                                <div className={`w-12 h-12 flex items-center justify-center border-2 border-black ${item.accent} shadow-[0_3px_0_0_#1a1a1a] rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                                    {item.icon}
                                </div>
                                <span className="text-[9px] font-black text-black uppercase tracking-widest leading-none">{item.title}</span>
                            </button>
                        ))}
                    </div>


                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                className="relative bg-white flex flex-col border-2 border-black md:rounded-2xl shadow-none w-full md:max-w-[800px] h-[92vh] md:h-auto md:max-h-[85vh] rounded-t-[32px] md:rounded-2xl overflow-hidden"
            >

                {/* Header Section - Refined Design */}
                <div className="flex items-center justify-between px-6 pt-10 pb-6 md:px-10 md:pt-10 md:pb-8 shrink-0">
                    <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-[#97cd7a] border-2 border-black shadow-[0_2px_0_0_#1a1a1a] rounded-full"></div>
                        <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight leading-none">
                            {t('links.addElement')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                         className="w-10 h-10 flex items-center justify-center text-black bg-white border-2 border-black transition-all active:translate-y-[2px] active:shadow-none shadow-[0_4px_0_0_#1a1a1a] rounded-xl"
                    >
                        <X size={20} strokeWidth={4} />
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Integrated URL Input Component */}
                    <div className={`px-6 md:px-8 pb-6 md:pb-8 shrink-0`}>
                        <form onSubmit={handleUrlSubmit} className="relative group max-w-2xl">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                                <LinkIcon size={18} strokeWidth={2.5} className="text-black/20 group-focus-within:text-black transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder={t('links.pasteUrlHint')}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className={`
                                     w-full bg-slate-50 border-2 border-black rounded-xl py-3 md:py-3.5 pl-10 pr-20 text-xs font-bold text-black
                                     focus:outline-none focus:ring-0 focus:bg-white focus:shadow-[0_4px_0_0_#1a1a1a] transition-all
                                    placeholder:text-black/20 placeholder:font-bold uppercase tracking-[0.05em]
                                `}
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center">
                                <AnimatePresence mode="wait">
                                    {detectedInfo ? (
                                        <motion.button
                                            key="detected"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            type="submit"
                                             className="flex items-center gap-2 px-3 py-1.5 bg-[#ffdf00] border-2 border-black shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-0.5 transition-all rounded-lg"
                                        >
                                            <span className="text-black">{detectedInfo.icon}</span>
                                            <Plus size={16} strokeWidth={4} className="text-black" />
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="waiting"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.3 }}
                                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/5 border border-dashed border-black/20 rounded-lg"
                                        >
                                            <Zap size={12} className="text-black" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{t('common.waiting')}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </form>
                    </div>



                    {/* Main Scrollable Area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-8 py-4">
                        <div className="max-w-4xl mx-auto w-full pb-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={showCollectionStep ? 'collection' : showShopCollectionStep ? 'shop' : showIncentiveStep ? 'incentive' : 'main'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>


            </motion.div>
        </div>
    );
};

export default AddLinkModal;
