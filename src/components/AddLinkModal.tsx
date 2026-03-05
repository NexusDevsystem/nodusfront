import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Link as LinkIcon, Layout, ShoppingBag,
    MessageSquare, Instagram, Youtube, MessageCircle,
    ChevronRight, Plus, DollarSign, Store, Share2,
    Smartphone, Mail, Type, Hash, Send as SendIcon, Zap, CreditCard,
    Tag, Grid, Calendar
} from 'lucide-react';
import { SiSpotify, SiTiktok, SiPaypal, SiWhatsapp } from 'react-icons/si';
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
    onAddMap
}) => {
    const { t } = useTranslation();
    const [url, setUrl] = useState('');

    const CATEGORIES = useMemo(() => [
        { id: 'suggested', label: t('links.suggested'), icon: <Plus size={16} strokeWidth={1.5} /> },
        { id: 'commerce', label: t('links.commerce'), icon: <ShoppingBag size={16} strokeWidth={1.5} /> },
        { id: 'social', label: t('links.social'), icon: <Share2 size={16} strokeWidth={1.5} /> },
        { id: 'media', label: t('links.media'), icon: <Youtube size={16} strokeWidth={1.5} /> },
        { id: 'contact', label: t('links.contact'), icon: <Smartphone size={16} strokeWidth={1.5} /> },
    ], [t]);

    const [activeCategory, setActiveCategory] = useState('suggested');
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

        // Tour integration: Close modal when requested by the tour
        const handleTourClose = () => {
            onClose();
            setShowCollectionStep(false);
            setShowShopCollectionStep(false);
            setShowIncentiveStep(false);
        };

        // Tour integration: Open modal
        const handleTourOpen = () => {
            // Trigger the parent's logic to open it (usually via isOpen prop, 
            // but here we might need to simulate the click or use a custom hook)
            // Since this component is managed by parent isOpen, we use the event to tell 
            // the parent to open us, but the state is already in parent.
            // Wait, EditorPage has the state. Let's see if we can trigger it there.
        };

        window.addEventListener('tour-close-all-modals', handleTourClose);
        window.addEventListener('tour-open-add-link-modal', handleTourOpen);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('tour-close-all-modals', handleTourClose);
            window.removeEventListener('tour-open-add-link-modal', handleTourOpen);
        };
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
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => setShowCollectionStep(false)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ChevronRight size={18} className="rotate-180" />
                        </button>
                        <h4 className="font-medium text-slate-900 text-sm">{t('links.createCollection')}</h4>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-normal text-black/70 leading-relaxed uppercase tracking-widest">
                            {t('links.collectionDesc', { extra: url.trim() ? t('links.collectionUrlHint') : "" })}
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-widest text-black px-1">{t('links.collectionNameLabel')}</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder={t('links.collectionNamePlaceholder')}
                                className="w-full bg-white border border-black rounded-none py-2 px-3 text-sm font-normal text-black focus:outline-none focus:ring-0 focus:border-black transition-all placeholder:text-black/30"
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

                        <div className="space-y-4">
                            <label className="text-xs font-medium uppercase tracking-widest text-black px-1">{t('links.layoutLabel')}</label>
                            <div className="grid grid-cols-2 gap-4 md:max-w-[340px]">
                                {[
                                    {
                                        id: 'list',
                                        label: t('links.layoutList') || 'Lista',
                                        icon: (
                                            <svg viewBox="0 0 100 80" className="w-10 h-auto">
                                                <rect x="10" y="10" width="80" height="24" fill="white" stroke="black" strokeWidth="6" />
                                                <rect x="23" y="20" width="30" height="4" fill="black" />
                                                <rect x="10" y="44" width="80" height="24" fill="white" stroke="black" strokeWidth="6" />
                                                <rect x="23" y="54" width="30" height="4" fill="black" />
                                            </svg>
                                        )
                                    },
                                    {
                                        id: 'carousel',
                                        label: t('links.layoutCarousel') || 'Carrossel',
                                        icon: (
                                            <svg viewBox="0 0 100 80" className="w-10 h-auto overflow-visible">
                                                <rect x="0" y="10" width="40" height="60" fill="white" stroke="black" strokeWidth="6" />
                                                <rect x="50" y="10" width="40" height="60" fill="white" stroke="black" strokeWidth="6" opacity="0.6" />
                                                <rect x="100" y="10" width="40" height="60" fill="white" stroke="black" strokeWidth="6" opacity="0.3" />
                                            </svg>
                                        )
                                    },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setCollectionLayout(opt.id as any)}
                                        className={`flex flex-col items-center gap-3 p-3 md:p-4 border-2 transition-all ${collectionLayout === opt.id ? 'border-black bg-[#ffdf00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1' : 'border-black/5 bg-slate-50 hover:border-black'}`}
                                    >
                                        <div className="flex items-center justify-center p-1">
                                            {opt.icon}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
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
                            className="w-full py-3 bg-[#97cd7a] text-black border-[1.5px] border-black rounded-none text-xs font-medium uppercase tracking-widest hover:bg-[#ffdf00] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none flex items-center justify-center gap-2"
                        >
                            <span>{t('links.createCollectionButton')}</span>
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            );
        }

        if (showShopCollectionStep) {
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => setShowShopCollectionStep(false)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ChevronRight size={18} className="rotate-180" />
                        </button>
                        <h4 className="font-medium text-slate-900 text-sm">{t('links.createProductCollection')}</h4>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-normal text-black/70 leading-relaxed uppercase tracking-widest">
                            {t('links.commerceCollectionDesc')}
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-widest text-black px-1">{t('links.categoryNameLabel')}</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder={t('links.categoryPlaceholder')}
                                className="w-full bg-white border border-black rounded-none py-2 px-3 text-sm font-normal text-black focus:outline-none focus:ring-0 focus:border-black transition-all placeholder:text-black/30"
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

                        <button
                            disabled={!shopCollectionName.trim()}
                            onClick={() => {
                                onAddProduct(shopCollectionName);
                                onClose();
                            }}
                            className="w-full py-3 bg-[#ffdf00] text-black border-[1.5px] border-black rounded-none text-xs font-medium uppercase tracking-widest hover:bg-[#97cd7a] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none flex items-center justify-center gap-2"
                        >
                            <span>{t('common.continueTo')} {t('sidebar.shop')}</span>
                            <ChevronRight size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            );
        }

        switch (activeCategory) {
            case 'suggested':
                if (isMobile) {
                    return (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-300">
                            {/* Mobile Grid - Brutalist style */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'link', icon: <LinkIcon size={24} strokeWidth={2} />, label: t('links.linkLabel'), color: 'text-black', action: () => { onAddLink(); onClose(); } },
                                    { id: 'collection', icon: <Layout size={24} strokeWidth={2} />, label: t('links.collectionLabel'), color: 'text-black', action: () => { setShowCollectionStep(true); setActiveCategory('suggested'); } },
                                    { id: 'product', icon: <ShoppingBag size={24} strokeWidth={2} />, label: t('links.productLabel'), color: 'text-black', action: () => { setShowShopCollectionStep(true); setActiveCategory('commerce'); } },
                                    { id: 'agenda', icon: <Calendar size={24} strokeWidth={2} />, label: t('agenda.title') || 'Agenda', color: 'text-black', action: () => { onAddAgenda(); onClose(); } },
                                    { id: 'map', icon: <Store size={24} strokeWidth={2} />, label: t('links.mapLabelMobile') || 'Mapa', color: 'text-black', action: () => { onAddMap(); onClose(); } },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        data-tour={`add-link-type-${item.id}`}
                                        onClick={item.action}
                                        className="flex flex-col items-center gap-3 active:translate-x-[1px] active:translate-y-[1px]"
                                    >
                                        <div className={`w-full aspect-square flex items-center justify-center bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none`}>
                                            <div className={item.color}>
                                                {item.icon}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium text-black uppercase tracking-widest leading-none">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-medium text-black uppercase tracking-[0.2em] px-1 border-b-2 border-black pb-1 inline-block">{t('links.popularLinks')}</h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'instagram', icon: <Instagram size={20} className="text-black" strokeWidth={3} />, title: 'Instagram', desc: t('links.postsReels'), action: () => onAddSocial('instagram') },
                                        { id: 'tiktok', icon: <SiTiktok size={18} />, title: 'TikTok', desc: t('links.shortVideos'), action: () => onAddSocial('tiktok') },
                                        { id: 'youtube', icon: <Youtube size={20} className="text-black" strokeWidth={3} />, title: 'YouTube', desc: t('links.channelOrVideos'), action: () => onAddSocial('youtube') },
                                        { id: 'spotify', icon: <SiSpotify size={18} className="text-black" />, title: 'Spotify', desc: t('links.musicPlaylists'), action: () => onAddSocial('spotify') },
                                        { id: 'whatsapp', icon: <SiWhatsapp size={20} className="text-black" />, title: 'WhatsApp', desc: t('links.directChat'), action: () => onAddSocial('whatsapp') },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { item.action(); onClose(); }}
                                            className="w-full flex items-center gap-4 p-3.5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffdf00] transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px] group"
                                        >
                                            <div className="w-11 h-11 flex items-center justify-center border-2 border-black shrink-0 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="text-[13px] font-medium text-black uppercase tracking-widest leading-none mb-1">{item.title}</div>
                                                <div className="text-[9px] text-black/50 font-normal uppercase tracking-widest">{item.desc}</div>
                                            </div>
                                            <ChevronRight size={18} strokeWidth={3} className="text-black group-active:translate-x-0.5 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Desktop Grid - Premium Brutalist */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'link', icon: <LinkIcon size={32} strokeWidth={1.5} />, label: t('links.externalLink'), desc: t('links.insertAnyUrl'), color: 'text-black', hoverBg: 'hover:bg-[#ffdf00]', action: () => { onAddLink(); onClose(); } },
                                { id: 'collection', icon: <Layout size={32} strokeWidth={1.5} />, label: t('links.collectionLabel'), desc: t('links.collectionDescShort'), color: 'text-black', hoverBg: 'hover:bg-[#97cd7a]', action: () => { setShowCollectionStep(true); setActiveCategory('suggested'); } },
                                { id: 'product', icon: <ShoppingBag size={32} strokeWidth={1.5} />, label: t('links.newProduct'), desc: t('links.productDescShort'), color: 'text-black', hoverBg: 'hover:bg-cyan-400', action: () => { setShowShopCollectionStep(true); setActiveCategory('commerce'); } },
                                { id: 'agenda', icon: <Calendar size={32} strokeWidth={1.5} />, label: t('agenda.title') || 'Agenda', desc: t('agenda.descShort') || 'Liste seus eventos e shows', color: 'text-black', hoverBg: 'hover:bg-[#ffdf00]', action: () => { onAddAgenda(); onClose(); } },
                                { id: 'map', icon: <Store size={32} strokeWidth={1.5} />, label: t('links.mapLabel') || 'Endereço', desc: t('links.mapDesc') || 'Destaque a localização do seu negócio', color: 'text-black', hoverBg: 'hover:bg-[#97cd7a]', action: () => { onAddMap(); onClose(); } },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    data-tour={`add-link-type-${item.id}`}
                                    onClick={item.action}
                                    className={`flex flex-col items-center text-center p-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${item.hoverBg} transition-all group`}
                                >
                                    <div className={`mb-4 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-medium text-black uppercase tracking-widest mb-1">{item.label}</span>
                                    <span className="text-[10px] font-normal text-black/50 uppercase tracking-tighter leading-tight">{item.desc}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[11px] font-medium text-black uppercase tracking-[0.2em] whitespace-nowrap">{t('links.popularLinks')}</h4>
                                <div className="h-[2px] flex-1 bg-black/10"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'instagram', icon: <Instagram size={22} strokeWidth={3} className="text-black" />, title: 'Instagram', desc: t('links.postsReels'), color: 'bg-[#ffdf00]', action: () => onAddSocial('instagram') },
                                    { id: 'tiktok', icon: <SiTiktok size={20} className="text-black" />, title: 'TikTok', desc: t('links.shortVideos'), color: 'bg-[#97cd7a]', action: () => onAddSocial('tiktok') },
                                    { id: 'youtube', icon: <Youtube size={22} strokeWidth={3} className="text-black" />, title: 'YouTube', desc: t('links.channelOrVideos'), color: 'bg-red-400', action: () => onAddSocial('youtube') },
                                    { id: 'spotify', icon: <SiSpotify size={20} className="text-black" />, title: 'Spotify', desc: t('links.musicPlaylists'), color: 'bg-green-400', action: () => onAddSocial('spotify') },
                                    { id: 'whatsapp', icon: <SiWhatsapp size={22} className="text-black" />, title: 'WhatsApp', desc: t('links.directChat'), color: 'bg-cyan-300', action: () => onAddSocial('whatsapp') },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { item.action(); onClose(); }}
                                        className="w-full flex items-center gap-4 p-4 bg-white border-2 border-black hover:bg-black group transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                    >
                                        <div className={`w-12 h-12 flex items-center justify-center shrink-0 border-2 border-black ${item.color} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="text-[11px] font-medium uppercase text-black group-hover:text-white leading-none mb-1.5">{item.title}</div>
                                            <div className="text-[9px] text-black/50 group-hover:text-white/50 font-normal uppercase tracking-widest truncate">{item.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'commerce':
                if (showIncentiveStep) {
                    return (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => setShowIncentiveStep(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <ChevronRight size={18} className="rotate-180" />
                                </button>
                                <h4 className="font-medium text-slate-900 text-sm">{t('links.setupDonations')}</h4>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest px-1 mb-2 block">{t('links.chooseMethod')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setIncentiveType('pix')}
                                            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border transition-all ${incentiveType === 'pix' ? 'bg-[#32bcad]/10 border-[#32bcad] text-[#32bcad]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <PixIcon size={18} />
                                            <span className="text-xs font-normal leading-none">PIX</span>
                                        </button>
                                        <button
                                            onClick={() => setIncentiveType('paypal')}
                                            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border transition-all ${incentiveType === 'paypal' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <SiPaypal size={16} />
                                            <span className="text-xs font-normal leading-none">PAYPAL</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-normal uppercase tracking-widest text-slate-400 px-1">
                                        {incentiveType === 'pix' ? t('links.pixKeyLabel') : t('links.paypalLinkLabel')}
                                    </label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder={incentiveType === 'pix' ? t('links.pixPlaceholder') : t('links.paypalPlaceholder')}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#32a800]/10 focus:bg-white transition-all font-medium"
                                        value={incentiveKey}
                                        onChange={(e) => setIncentiveKey(e.target.value)}
                                    />
                                </div>

                                <button
                                    disabled={!incentiveKey.trim()}
                                    onClick={() => {
                                        onAddIncentive(incentiveType, incentiveKey);
                                        onClose();
                                    }}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-normal uppercase tracking-widest hover:bg-black disabled:opacity-30 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <span>{t('links.saveAndContinue')}</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <div className="p-4 border-[1.5px] border-black bg-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                            <h4 className="font-medium text-black text-lg uppercase tracking-widest leading-none">{t('links.monetizeProfile')}</h4>
                            <p className="text-[10px] font-normal text-black/70 mt-2 uppercase tracking-widest">{t('links.monetizeProfileDesc')}</p>
                        </div>
                        {[
                            { id: 'product', icon: <ShoppingBag size={18} strokeWidth={2} />, title: t('links.productStore'), desc: t('links.physicalOrDigital'), action: () => setShowShopCollectionStep(true) },
                            { id: 'incentive', icon: <DollarSign size={18} strokeWidth={2} />, title: t('links.incentives'), desc: t('links.receiveSupportDirectly'), action: () => setShowIncentiveStep(true) },
                            { id: 'affiliate', icon: <Store size={18} strokeWidth={2} />, title: t('links.affiliateLink'), desc: t('links.affiliateDesc'), action: () => { } },
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.action}
                                className="w-full flex items-center gap-3 p-3 bg-white border-[1.5px] border-black hover:bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all group"
                            >
                                <div className="w-10 h-10 flex items-center justify-center shrink-0 border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-black">
                                    {item.icon}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-xs font-medium text-black uppercase tracking-wider">{item.title}</div>
                                    <div className="text-[10px] text-black/70 font-normal uppercase tracking-widest truncate">{item.desc}</div>
                                </div>
                                <Plus size={18} strokeWidth={3} className="text-black group-hover:rotate-90 transition-transform" />
                            </button>
                        ))}
                    </div>
                );

            case 'media':
                return (
                    <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <div className="p-4 border-[1.5px] border-black bg-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                            <h4 className="font-medium text-black text-lg uppercase tracking-widest leading-none">{t('links.mediaIntegrations')}</h4>
                            <p className="text-[10px] font-normal text-black/70 mt-2 uppercase tracking-widest">{t('links.mediaIntegrationsDesc')}</p>
                        </div>
                        {[
                            { id: 'youtube', icon: <Youtube size={18} strokeWidth={2} />, title: 'YouTube', desc: t('links.videosOrShorts'), color: 'text-red-500' },
                            { id: 'spotify', icon: <SiSpotify size={18} />, title: 'Spotify', desc: t('links.musicOrPlaylists'), color: 'text-emerald-500' },
                            { id: 'tiktok', icon: <SiTiktok size={18} />, title: 'TikTok', desc: t('links.viralVideos'), color: 'text-black' },
                            { id: 'twitch', icon: <TwitchIcon size={18} />, title: 'Twitch', desc: t('links.yourLiveStream'), color: 'text-purple-500' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { onAddLink(); onClose(); }}
                                className="w-full flex items-center gap-3 p-3 bg-white border-[1.5px] border-black hover:bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all group"
                            >
                                <div className={`w-10 h-10 flex items-center justify-center shrink-0 border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${item.color}`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-xs font-medium text-black uppercase tracking-wider">{item.title}</div>
                                    <div className="text-[10px] text-black/70 font-normal uppercase tracking-widest truncate">{item.desc}</div>
                                </div>
                                <Plus size={18} strokeWidth={3} className="text-black group-hover:rotate-90 transition-transform" />
                            </button>
                        ))}
                    </div>
                );

            case 'social':
                return (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
                        {[
                            { id: 'instagram', icon: <Instagram size={18} strokeWidth={3} />, title: 'Instagram' },
                            { id: 'tiktok', icon: <SiTiktok size={18} />, title: 'TikTok' },
                            { id: 'twitter', icon: <Hash size={18} strokeWidth={3} />, title: 'X (Twitter)' },
                            { id: 'linkedin', icon: <Share2 size={18} strokeWidth={3} />, title: 'LinkedIn' },
                            { id: 'facebook', icon: <FacebookIcon size={18} />, title: 'Facebook' },
                            { id: 'youtube', icon: <Youtube size={18} strokeWidth={3} />, title: 'YouTube' },
                            { id: 'twitch', icon: <TwitchIcon size={18} />, title: 'Twitch' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { onAddSocial(item.id); onClose(); }}
                                className="flex items-center gap-3 p-3 bg-white border-[1.5px] border-black hover:bg-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all group"
                            >
                                <div className="w-8 h-8 flex items-center justify-center text-black shrink-0 border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                    {item.icon}
                                </div>
                                <span className="text-xs font-medium text-black uppercase tracking-wider leading-none">{item.title}</span>
                            </button>
                        ))}
                    </div>
                );

            default:
                return <div className="p-10 text-center text-slate-400 text-xs font-medium">{t('common.comingSoon')} 🚀</div>;
        }
    };

    return (
        <div className={`fixed inset-0 z-[10000] flex ${isMobile ? 'items-end' : 'items-end md:items-center'} justify-center`}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 md:bg-slate-900/40 md:backdrop-blur-[2px]"
            />

            <motion.div
                initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.98, y: 10 }}
                animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.98, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                drag={isMobile ? "y" : false}
                dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
                dragElastic={isMobile ? 0.8 : 1}
                onDragEnd={(_, info) => {
                    if (isMobile && info.offset.y > 100) {
                        onClose();
                    }
                }}
                className={`
                    relative bg-white flex flex-col border-2 border-black overflow-hidden tour-add-element-modal
                    ${isMobile ? 'w-full h-[65dvh] h-[65svh] h-[65vh] rounded-none border-b-0 shadow-none touch-none' : 'w-[820px] h-[580px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'}
                `}
            >
                {/* Global Header for Desktop (Unified across sidebar and content) */}
                {!isMobile && (
                    <div className="flex items-center justify-between p-6 shrink-0 border-b-2 border-black bg-white">
                        <div>
                            <h2 className="text-2xl font-medium text-black uppercase tracking-tighter leading-none">{t('links.addElement')}</h2>
                            <div className="h-1 w-12 bg-[#97cd7a] mt-2"></div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-black hover:bg-black hover:text-[#ffdf00] border-2 border-transparent hover:border-black transition-all active:translate-x-[1px] active:translate-y-[1px]"
                        >
                            <X size={24} strokeWidth={1.5} />
                        </button>
                    </div>
                )}

                {/* Drag Handle for Mobile - Brutalist */}
                {isMobile && (
                    <div className="flex justify-center p-4 pt-5 shrink-0 cursor-grab active:cursor-grabbing">
                        <div className="w-12 h-1.5 bg-black" />
                    </div>
                )}

                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Category Tabs - The "Command Bar" */}
                    {!isMobile && (
                        <div className="flex bg-black border-b-2 border-black shrink-0 overflow-x-auto no-scrollbar">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setShowShopCollectionStep(false);
                                        setShowIncentiveStep(false);
                                        setShowCollectionStep(false);
                                    }}
                                    className={`
                                        flex-1 min-w-[120px] flex items-center justify-center gap-3 py-3.5 px-4 transition-all relative border-r-2 border-black
                                        ${activeCategory === cat.id
                                            ? 'bg-[#ffdf00] text-black'
                                            : 'bg-white text-black/50 hover:bg-[#97cd7a] hover:text-black'}
                                    `}
                                >
                                    <span className={`shrink-0 flex items-center justify-center ${activeCategory === cat.id ? 'scale-110 text-black' : ''}`}>
                                        {cat.icon}
                                    </span>
                                    <span className="text-[9px] font-medium uppercase tracking-[0.2em] leading-none text-black/70">
                                        {cat.label}
                                    </span>
                                    {activeCategory === cat.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Workbench Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden relative">
                        {/* URL Terminal Input */}
                        <div className={`${isMobile ? 'px-6 py-4' : 'px-8 py-5 border-b-2 border-black'} shrink-0 bg-slate-50`}>
                            <div className="mb-2 flex items-center gap-2">
                                <div className="w-1 h-3 bg-[#97cd7a]"></div>
                                <span className="text-[9px] font-normal uppercase tracking-[0.3em] text-black/40">{t('links.linkInputLabel')}</span>
                            </div>
                            <form onSubmit={handleUrlSubmit} className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10 transition-transform group-focus-within:scale-110">
                                    <LinkIcon size={18} strokeWidth={1.5} className="text-black/30 group-focus-within:text-black transition-colors" />
                                </div>
                                <input
                                    data-tour="add-link-input"
                                    type="text"
                                    placeholder={isMobile ? t('links.pasteUrlPlaceholder') : t('links.pasteUrlHint')}
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className={`
                                        w-full bg-white border-2 border-black rounded-none py-4 pr-24 text-xs font-medium text-black
                                        focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
                                        placeholder:text-black/20 placeholder:font-normal uppercase tracking-[0.1em]
                                        ${isMobile ? 'pl-11 pr-10' : 'pl-11'}
                                    `}
                                />
                                {!isMobile && (
                                    <div className="absolute inset-y-0 right-5 flex items-center">
                                        <AnimatePresence>
                                            {detectedInfo ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#97cd7a] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                >
                                                    <span className="text-black">{detectedInfo.icon}</span>
                                                    <span className="text-[9px] font-medium text-black uppercase tracking-widest">{detectedInfo.platform} {t('common.ready')}</span>
                                                </motion.div>
                                            ) : (
                                                <div className="px-3 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                    <span className="text-[9px] font-medium text-black/30 uppercase tracking-widest">{t('common.waiting')}...</span>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Scrollable Content Modules */}
                        <div
                            className={`flex-1 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain ${isMobile ? 'px-6 pb-[calc(5rem+env(safe-area-inset-bottom))]' : 'px-8 py-6'}`}
                            onPointerDown={(e) => isMobile && e.stopPropagation()}
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            <div className="max-w-3xl mx-auto w-full">
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddLinkModal;
