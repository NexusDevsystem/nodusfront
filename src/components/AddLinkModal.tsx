import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Link as LinkIcon, Layout, ShoppingBag,
    MessageSquare, Instagram, Youtube, MessageCircle,
    ChevronRight, Plus, DollarSign, Store, Share2,
    Smartphone, Mail, Type, Hash, Send as SendIcon, Zap, CreditCard,
    Tag, Grid
} from 'lucide-react';
import { SiSpotify, SiTiktok, SiPaypal, SiWhatsapp } from 'react-icons/si';
import { SOCIAL_NETWORKS } from '../constants';

interface AddLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLink: (url?: string) => void;
    onAddCollection: (name: string, url?: string) => void;
    onAddProduct: (collectionName: string) => void;
    onAddIncentive: (type: 'pix' | 'paypal', key: string) => void;
    onAddSocial: (platform: string) => void;
    onAddHeader: () => void;
}

const CATEGORIES = [
    { id: 'suggested', label: 'Sugeridos', icon: <Plus size={16} strokeWidth={1.5} /> },
    { id: 'commerce', label: 'Comércio', icon: <ShoppingBag size={16} strokeWidth={1.5} /> },
    { id: 'social', label: 'Social', icon: <Share2 size={16} strokeWidth={1.5} /> },
    { id: 'media', label: 'Mídia', icon: <Youtube size={16} strokeWidth={1.5} /> },
    { id: 'contact', label: 'Contato', icon: <Smartphone size={16} strokeWidth={1.5} /> },
];

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
    onAddHeader
}) => {
    const [url, setUrl] = useState('');
    const [activeCategory, setActiveCategory] = useState('suggested');
    const [detectedInfo, setDetectedInfo] = useState<{ platform: string, icon: React.ReactNode, type: 'social' | 'link' } | null>(null);
    const [showShopCollectionStep, setShowShopCollectionStep] = useState(false);
    const [shopCollectionName, setShopCollectionName] = useState('');
    const [showCollectionStep, setShowCollectionStep] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const [showIncentiveStep, setShowIncentiveStep] = useState(false);
    const [incentiveType, setIncentiveType] = useState<'pix' | 'paypal'>('pix');
    const [incentiveKey, setIncentiveKey] = useState('');

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
                setDetectedInfo({ platform: 'Link Direto', icon: <LinkIcon size={16} />, type: 'link' });
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
                        <h4 className="font-medium text-slate-900 text-sm">Criar Coleção de Links</h4>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-bold text-black/70 leading-relaxed uppercase tracking-widest">
                            Dê um nome para este grupo de links. {url.trim() ? "O link que você colou será adicionado automaticamente dentro dela." : ""}
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-black px-1">Nome da Coleção</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Ex: Meus Cursos, Redes Sociais..."
                                className="w-full bg-white border border-black rounded-none py-2 px-3 text-sm font-bold text-black focus:outline-none focus:ring-0 focus:border-black transition-all placeholder:text-black/30"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && collectionName.trim()) {
                                        onAddCollection(collectionName, url);
                                        onClose();
                                    }
                                }}
                            />
                        </div>

                        <button
                            disabled={!collectionName.trim()}
                            onClick={() => {
                                onAddCollection(collectionName, url);
                                onClose();
                            }}
                            className="w-full py-3 bg-[#97cd7a] text-black border-[1.5px] border-black rounded-none text-xs font-black uppercase tracking-widest hover:bg-[#ffdf00] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none flex items-center justify-center gap-2"
                        >
                            <span>Criar Coleção</span>
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
                        <h4 className="font-medium text-slate-900 text-sm">Criar Coleção de Produtos</h4>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-bold text-black/70 leading-relaxed uppercase tracking-widest">
                            Digite o nome da categoria para seus produtos (ex: "E-books", "Cursos", "Lançamentos").
                            Você será levado à aba Loja para finalizar a configuração.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-black px-1">Nome da Categoria</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Ex: Minha Coleção"
                                className="w-full bg-white border border-black rounded-none py-2 px-3 text-sm font-bold text-black focus:outline-none focus:ring-0 focus:border-black transition-all placeholder:text-black/30"
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
                            className="w-full py-3 bg-[#ffdf00] text-black border-[1.5px] border-black rounded-none text-xs font-black uppercase tracking-widest hover:bg-[#97cd7a] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none flex items-center justify-center gap-2"
                        >
                            <span>Continuar para Loja</span>
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
                                    { id: 'link', icon: <LinkIcon size={24} strokeWidth={3} />, label: 'Link', color: 'text-black', action: () => { onAddLink(); onClose(); } },
                                    { id: 'collection', icon: <Layout size={24} strokeWidth={3} />, label: 'Coleção', color: 'text-black', action: () => { setShowCollectionStep(true); setActiveCategory('suggested'); } },
                                    { id: 'product', icon: <ShoppingBag size={24} strokeWidth={3} />, label: 'Produto', color: 'text-black', action: () => { setShowShopCollectionStep(true); setActiveCategory('commerce'); } },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={item.action}
                                        className="flex flex-col items-center gap-3 active:translate-x-[1px] active:translate-y-[1px]"
                                    >
                                        <div className={`w-full aspect-square flex items-center justify-center bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none`}>
                                            <div className={item.color}>
                                                {item.icon}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-black uppercase tracking-widest leading-none">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] px-1 border-b-2 border-black pb-1 inline-block">Links Populares</h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'instagram', icon: <Instagram size={20} className="text-black" strokeWidth={3} />, title: 'Instagram', desc: 'Posts e Reels', action: () => onAddSocial('instagram') },
                                        { id: 'tiktok', icon: <SiTiktok size={18} />, title: 'TikTok', desc: 'Vídeos curtos', action: () => onAddSocial('tiktok') },
                                        { id: 'youtube', icon: <Youtube size={20} className="text-black" strokeWidth={3} />, title: 'YouTube', desc: 'Canal ou vídeos', action: () => onAddSocial('youtube') },
                                        { id: 'spotify', icon: <SiSpotify size={18} className="text-black" />, title: 'Spotify', desc: 'Músicas e playlists', action: () => onAddSocial('spotify') },
                                        { id: 'whatsapp', icon: <SiWhatsapp size={20} className="text-black" />, title: 'WhatsApp', desc: 'Chat direto', action: () => onAddSocial('whatsapp') },
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
                                                <div className="text-[13px] font-black text-black uppercase tracking-widest leading-none mb-1">{item.title}</div>
                                                <div className="text-[9px] text-black/50 font-black uppercase tracking-widest">{item.desc}</div>
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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
                        {/* Desktop Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'link', icon: <LinkIcon size={24} strokeWidth={3} />, label: 'Link', color: 'text-black', hoverBg: 'hover:bg-[#ffdf00]', action: () => { onAddLink(); onClose(); } },
                                { id: 'collection', icon: <Layout size={24} strokeWidth={3} />, label: 'Coleção', color: 'text-black', hoverBg: 'hover:bg-[#97cd7a]', action: () => { setShowCollectionStep(true); setActiveCategory('suggested'); } },
                                { id: 'product', icon: <ShoppingBag size={24} strokeWidth={3} />, label: 'Produto', color: 'text-black', hoverBg: 'hover:bg-cyan-400', action: () => { setShowShopCollectionStep(true); setActiveCategory('commerce'); } },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={item.action}
                                    className={`flex flex-col items-center justify-center p-4 bg-white border-[1.5px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none ${item.hoverBg} transition-all group`}
                                >
                                    <div className={`mb-2 ${item.color} group-hover:scale-105 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-black text-black uppercase tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] px-1 border-b-[3px] border-black pb-1.5 inline-block">Links Populares</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'instagram', icon: <Instagram size={18} strokeWidth={3} className="text-[#dc2743]" />, title: 'Instagram', desc: 'Posts e Reels', action: () => onAddSocial('instagram') },
                                    { id: 'tiktok', icon: <SiTiktok size={16} />, title: 'TikTok', desc: 'Vídeos curtos', action: () => onAddSocial('tiktok') },
                                    { id: 'youtube', icon: <Youtube size={18} strokeWidth={3} className="text-[#ff0000]" />, title: 'YouTube', desc: 'Canal ou vídeos', action: () => onAddSocial('youtube') },
                                    { id: 'spotify', icon: <SiSpotify size={16} className="text-[#1db954]" />, title: 'Spotify', desc: 'Músicas e playlists', action: () => onAddSocial('spotify') },
                                    { id: 'whatsapp', icon: <SiWhatsapp size={18} className="text-[#25d366]" />, title: 'WhatsApp', desc: 'Chat direto', action: () => onAddSocial('whatsapp') },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { item.action(); onClose(); }}
                                        className="w-full flex items-center gap-3 p-3 bg-white border border-black hover:bg-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all group"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="text-xs font-black uppercase text-black leading-none mb-0.5">{item.title}</div>
                                            <div className="text-[9px] text-black/70 font-bold uppercase tracking-widest truncate">{item.desc}</div>
                                        </div>
                                        <ChevronRight size={14} strokeWidth={3} className="text-black group-hover:translate-x-0.5 transition-all" />
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
                                <h4 className="font-medium text-slate-900 text-sm">Configurar Incentivos</h4>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2 block">Escolha o Método</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setIncentiveType('pix')}
                                            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border transition-all ${incentiveType === 'pix' ? 'bg-[#32bcad]/10 border-[#32bcad] text-[#32bcad]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <PixIcon size={18} />
                                            <span className="text-xs font-bold leading-none">PIX</span>
                                        </button>
                                        <button
                                            onClick={() => setIncentiveType('paypal')}
                                            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border transition-all ${incentiveType === 'paypal' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <SiPaypal size={16} />
                                            <span className="text-xs font-bold leading-none">PAYPAL</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                                        {incentiveType === 'pix' ? 'Chave Pix (CPF, Email ou Aleatória)' : 'Link PayPal (paypal.me/usuario)'}
                                    </label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder={incentiveType === 'pix' ? 'ex: seu@email.com' : 'ex: paypal.me/seunome'}
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
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black disabled:opacity-30 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <span>Salvar e Ir para Monetização</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <div className="p-4 border-[1.5px] border-black bg-[#ffdf00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                            <h4 className="font-black text-black text-lg uppercase tracking-widest leading-none">Monetize seu perfil</h4>
                            <p className="text-[10px] font-bold text-black/70 mt-2 uppercase tracking-widest">Venda produtos e receba incentivos direto no Nodus.</p>
                        </div>
                        {[
                            { id: 'product', icon: <ShoppingBag size={18} strokeWidth={3} />, title: 'Produto / Loja', desc: 'Físicos ou digitais', action: () => setShowShopCollectionStep(true) },
                            { id: 'incentive', icon: <DollarSign size={18} strokeWidth={3} />, title: 'Incentivos', desc: 'Receba apoios direto', action: () => setShowIncentiveStep(true) },
                            { id: 'affiliate', icon: <Store size={18} strokeWidth={3} />, title: 'Link de Afiliado', desc: 'Amazon, Shopee, etc', action: () => { } },
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
                                    <div className="text-xs font-black text-black uppercase tracking-wider">{item.title}</div>
                                    <div className="text-[10px] text-black/70 font-bold uppercase tracking-widest truncate">{item.desc}</div>
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
                            <h4 className="font-black text-black text-lg uppercase tracking-widest leading-none">Integrações de Mídia</h4>
                            <p className="text-[10px] font-bold text-black/70 mt-2 uppercase tracking-widest">Adicione vídeos, músicas e muito mais diretamente no seu perfil.</p>
                        </div>
                        {[
                            { id: 'youtube', icon: <Youtube size={18} strokeWidth={3} />, title: 'YouTube', desc: 'Vídeos ou Shorts', color: 'text-red-500' },
                            { id: 'spotify', icon: <SiSpotify size={18} />, title: 'Spotify', desc: 'Músicas ou Playlists', color: 'text-emerald-500' },
                            { id: 'tiktok', icon: <SiTiktok size={18} />, title: 'TikTok', desc: 'Vídeos virais', color: 'text-black' },
                            { id: 'twitch', icon: <TwitchIcon size={18} />, title: 'Twitch', desc: 'Sua stream ao vivo', color: 'text-purple-500' },
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
                                    <div className="text-xs font-black text-black uppercase tracking-wider">{item.title}</div>
                                    <div className="text-[10px] text-black/70 font-bold uppercase tracking-widest truncate">{item.desc}</div>
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
                                <span className="text-xs font-black text-black uppercase tracking-wider leading-none">{item.title}</span>
                            </button>
                        ))}
                    </div>
                );

            default:
                return <div className="p-10 text-center text-slate-400 text-xs font-medium">Coming soon 🚀</div>;
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
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
                    relative bg-white flex flex-col border-4 border-black overflow-hidden
                    ${isMobile ? 'w-full h-[65vh] shadow-none' : 'w-[850px] h-[620px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]'}
                `}
            >
                {/* Global Header for Desktop (Unified across sidebar and content) */}
                {!isMobile && (
                    <div className="flex items-center justify-between p-8 shrink-0 border-b-4 border-black bg-white">
                        <div>
                            <h2 className="text-3xl font-black text-black uppercase tracking-tighter leading-none">Adicionar Elemento</h2>
                            <div className="h-1.5 w-16 bg-[#97cd7a] mt-2"></div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-black hover:bg-black hover:text-[#ffdf00] border-2 border-transparent hover:border-black transition-all active:translate-x-[2px] active:translate-y-[2px]"
                        >
                            <X size={32} strokeWidth={4} />
                        </button>
                    </div>
                )}

                {/* Drag Handle for Mobile - Brutalist */}
                {isMobile && (
                    <div className="flex justify-center p-4 pt-5 shrink-0">
                        <div className="w-12 h-1.5 bg-black" />
                    </div>
                )}

                <div className={`flex flex-1 overflow-hidden ${isMobile ? 'flex-col' : 'flex-row'}`}>
                    {/* Sidebar (Desktop only) */}
                    {!isMobile && (
                        <div className="w-56 bg-white border-r-[1.5px] border-black flex flex-col overflow-y-auto shrink-0 custom-scrollbar">
                            <div className="flex flex-col">
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
                                            flex items-center gap-4 px-6 py-6 transition-all relative border-b-2 border-black
                                            ${activeCategory === cat.id
                                                ? 'bg-black text-[#97cd7a]'
                                                : 'bg-white text-black/40 hover:bg-slate-50'}
                                        `}
                                    >
                                        <span className={`shrink-0 ${activeCategory === cat.id ? 'scale-105 text-black' : ''}`}>
                                            {cat.icon}
                                        </span>
                                        <span className={`text-xs uppercase tracking-widest whitespace-nowrap leading-none`}>
                                            {cat.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
                        {/* Header for Mobile (Removed Close Button as requested) */}
                        {isMobile && (
                            <div className="flex items-center justify-between px-6 pt-2 shrink-0">
                                <div className="w-8" /> {/* spacer */}
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest hidden">Adicionar</h2>
                                <div className="w-8" /> {/* spacer replacing the close button */}
                            </div>
                        )}

                        {/* Search / Top Bar */}
                        <div className={`${isMobile ? 'px-6 py-4' : 'px-6 py-6 pb-0'} shrink-0`}>
                            <form onSubmit={handleUrlSubmit} className="relative group">
                                <div className={`absolute inset-y-0 ${isMobile ? 'left-5' : 'left-3.5'} flex items-center pointer-events-none`}>
                                    <Search size={18} strokeWidth={3} className={`transition-colors text-black`} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={isMobile ? " COLE OU BUSQUE UM LINK..." : "Cole um link do Spotify, Instagram, YouTube..."}
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className={`
                                        w-full bg-white border-4 border-black rounded-none py-4 pr-24 text-[11px] font-black text-black
                                        focus:outline-none focus:ring-0 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all
                                        placeholder:text-black/20 uppercase tracking-[0.1em]
                                        ${isMobile ? 'pl-12 pr-10' : 'pl-12'}
                                    `}
                                />
                                {!isMobile && (
                                    <div className="absolute inset-y-0 right-4 flex items-center gap-3">
                                        <AnimatePresence>
                                            {detectedInfo && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    className="hidden sm:flex items-center gap-2 px-2 py-1 bg-white rounded-md border border-slate-200 shadow-sm"
                                                >
                                                    <span className="text-slate-500">{detectedInfo.icon}</span>
                                                    <span className="text-[10px] font-medium text-slate-600 uppercase tracking-tight">{detectedInfo.platform}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <span className="hidden sm:inline text-[9px] font-medium text-slate-300 uppercase tracking-tight">Enter</span>
                                    </div>
                                )}
                                {isMobile && url && (
                                    <button
                                        type="button"
                                        onClick={() => setUrl('')}
                                        className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Scrollable Area */}
                        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? 'px-6 pb-12' : 'p-8 pt-6'}`}>
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddLinkModal;
