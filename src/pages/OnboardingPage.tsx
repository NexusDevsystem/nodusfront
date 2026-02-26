import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, AlertCircle, Globe, Link as LinkIcon, X, ArrowLeft, Camera, UserCircle, Layout, User, Plus, Trash2, ChevronLeft, Search, Image as ImageIcon, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiWhatsapp, SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiThreads, SiFacebook, SiX, SiSoundcloud, SiSnapchat, SiPinterest } from 'react-icons/si';
import ProfileRenderer from '../components/ProfileRenderer';
import { compressImage } from '../utils/imageUtils';
import { UserProfile, LinkItem } from '../types';

const SOCIAL_PLATFORMS = [
    { id: 'instagram', icon: SiInstagram, label: 'Instagram', color: 'text-pink-600', placeholder: 'seu.perfil', baseUrl: 'https://instagram.com/', handlePrefix: '@' },
    { id: 'whatsapp', icon: SiWhatsapp, label: 'WhatsApp', color: 'text-green-500', placeholder: '5511999999999', baseUrl: 'https://wa.me/', handlePrefix: '' },
    { id: 'tiktok', icon: SiTiktok, label: 'TikTok', color: 'text-black', placeholder: 'seu.perfil', baseUrl: 'https://tiktok.com/@', handlePrefix: '@' },
    { id: 'youtube', icon: SiYoutube, label: 'YouTube', color: 'text-red-500', placeholder: 'seu.canal', baseUrl: 'https://youtube.com/@', handlePrefix: '@' },
    { id: 'website', icon: Globe, label: 'Site Pessoal', color: 'text-slate-800', placeholder: 'seusite.com', baseUrl: '', handlePrefix: '' },
    { id: 'spotify', icon: SiSpotify, label: 'Spotify', color: 'text-green-500', placeholder: 'link da playlist/artista', baseUrl: '', handlePrefix: '' },
    { id: 'threads', icon: SiThreads, label: 'Threads', color: 'text-black', placeholder: 'seu.perfil', baseUrl: 'https://threads.net/@', handlePrefix: '@' },
    { id: 'facebook', icon: SiFacebook, label: 'Facebook', color: 'text-blue-600', placeholder: 'seu.perfil', baseUrl: 'https://facebook.com/', handlePrefix: '' },
    { id: 'x', icon: SiX, label: 'X', color: 'text-black', placeholder: 'seu.perfil', baseUrl: 'https://x.com/', handlePrefix: '@' },
    { id: 'soundcloud', icon: SiSoundcloud, label: 'SoundCloud', color: 'text-orange-500', placeholder: 'seu.perfil', baseUrl: 'https://soundcloud.com/', handlePrefix: '' },
    { id: 'snapchat', icon: SiSnapchat, label: 'Snapchat', color: 'text-yellow-400', placeholder: 'seu.perfil', baseUrl: 'https://snapchat.com/add/', handlePrefix: '' },
    { id: 'pinterest', icon: SiPinterest, label: 'Pinterest', color: 'text-red-600', placeholder: 'seu.perfil', baseUrl: 'https://pinterest.com/', handlePrefix: '' },
];

// Safe localStorage setter that handles quota errors
const safeSetItem = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, clearing snapshots...');
            localStorage.removeItem('nodus_profile_snapshot');
            localStorage.removeItem('nodus_links_snapshot');
            localStorage.removeItem('nodus_products_snapshot');
            try {
                localStorage.setItem(key, value);
            } catch (retryError) {
                console.error('Failed to save even after cleanup:', retryError);
            }
        }
    }
};

/**
 * OnboardingPage v2.1.2 - Color consistency and icon fix
 */
export default function OnboardingPage() {
    const { user, setProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [userCategory, setUserCategory] = useState<'creator' | 'personal' | 'business' | null>(null);
    const [referralSource, setReferralSource] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState('');

    // Quick Edit Session States (Steps 4 to 6)
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [headerLayout, setHeaderLayout] = useState<'classic' | 'compact' | 'banner'>('classic');
    const [quickLinks, setQuickLinks] = useState<{ id: string, title: string, url: string, provider?: string, layout: 'social' | 'classic', type: 'social' | 'link' }[]>([]);

    // New Modal States
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [configuringSocialPlatform, setConfiguringSocialPlatform] = useState<string | null>(null);
    const [tempSocialUrl, setTempSocialUrl] = useState('');
    const [socialSearchTerm, setSocialSearchTerm] = useState('');

    const navigate = useNavigate();
    const avatarInputRef = React.useRef<HTMLInputElement>(null);


    // Check availability as user types
    useEffect(() => {
        if (username.length < 3) {
            setAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setChecking(true);
            try {
                const { available: isAvailable } = await apiClient.checkUsername(username.toLowerCase());
                setAvailable(isAvailable);
            } catch (err) {
                console.error('Availability check failed:', err);
                setAvailable(false); // Assume unavailable on error as a safety measure
            } finally {
                setChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username]);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1 && !available) return;
        if (step === 2 && !userCategory) return;
        if (step === 3 && !referralSource) return;
        if (step === 4 && !name) return; // Name is required in step 4
        setStep(step + 1);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressed = await compressImage(e.target.files[0], 500, 0.8);
                setAvatarUrl(compressed);
            } catch (error) {
                console.error('Error processing image:', error);
            }
        }
    };

    const handleAddSocialClick = (platformId: string) => {
        setConfiguringSocialPlatform(platformId);
        setTempSocialUrl('');
        setSocialSearchTerm('');
        setIsSocialModalOpen(true);
    };

    const confirmSocialPlatform = () => {
        if (!configuringSocialPlatform) return;
        const platform = SOCIAL_PLATFORMS.find(p => p.id === configuringSocialPlatform);
        if (!platform) return;

        const existingIndex = quickLinks.findIndex(l => l.provider === configuringSocialPlatform && l.layout === 'social');

        if (existingIndex >= 0) {
            const newLinks = [...quickLinks];
            newLinks[existingIndex].url = tempSocialUrl;
            setQuickLinks(newLinks);
        } else {
            setQuickLinks([...quickLinks, {
                id: `temp-${Date.now()}`,
                title: platform.label,
                url: tempSocialUrl,
                provider: configuringSocialPlatform,
                layout: 'social',
                type: 'social'
            }]);
        }

        setIsSocialModalOpen(false);
        setConfiguringSocialPlatform(null);
        setTempSocialUrl('');
    };

    const removeQuickLink = (id: string) => {
        setQuickLinks(quickLinks.filter(l => l.id !== id));
    };

    const handleAddGeneralLink = () => {
        setQuickLinks([...quickLinks, {
            id: `temp-${Date.now()}`,
            title: 'Novo Link',
            url: '',
            layout: 'classic',
            type: 'link'
        }]);
    };

    const updateGeneralLink = (id: string, field: 'title' | 'url', value: string) => {
        setQuickLinks(quickLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!available || !user?.email || !userCategory) return;

        setLoading(true);
        setError('');

        try {
            // 1. Update Profile with all onboarding data via Backend
            const updatedProfile = await apiClient.updateProfile({
                username: username.toLowerCase(),
                onboardingCompleted: true,
                userCategory: userCategory,
                referralSource: referralSource || 'Não informado',
                name: name || username,
                bio: bio,
                avatarUrl: avatarUrl,
                headerLayout: headerLayout
            });

            // 2. Process and Save links (AutoComplete Logic)
            const validLinks = quickLinks.filter(l => l.url || l.title !== 'Novo Link'); // Allow saving if it has some content
            if (validLinks.length > 0) {
                try {
                    const currentLinks = await apiClient.getMyLinks();
                    const processedLinks: LinkItem[] = validLinks.map((link, index) => {
                        let finalUrl = link.url;

                        if (link.type === 'social') {
                            const platform = SOCIAL_PLATFORMS.find(p => p.id === link.provider);
                            if (platform && platform.baseUrl && !link.url.startsWith('http')) {
                                const cleanHandle = link.url.replace(/^@/, '');
                                finalUrl = `${platform.baseUrl}${cleanHandle}`;
                            }
                        } else {
                            // General URL parsing
                            if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:')) {
                                finalUrl = `https://${finalUrl}`;
                            }
                        }

                        return {
                            id: link.id,
                            clientId: crypto.randomUUID(),
                            title: link.title,
                            url: finalUrl,
                            isActive: true,
                            layout: link.layout,
                            type: link.type,
                            platform: link.provider,
                            clicks: 0
                        };
                    });
                    await apiClient.replaceAllLinks([...currentLinks, ...processedLinks]);
                } catch (linkErr) {
                    console.error('Failed to add links during onboarding:', linkErr);
                }
            }

            // 3. Update Global Context
            setProfile(updatedProfile);

            // 4. Navigate to admin
            navigate('/admin');

        } catch (err: any) {
            console.error('Finalization error:', err);
            setError(err.message || 'Ocorreu um erro ao finalizar seu perfil.');
        } finally {
            setLoading(false);
        }
    };

    // Config do profile mockado para o Preview
    const previewProfile: UserProfile = {
        name: name || username || 'Seu Nome',
        bio: bio || 'Breve descrição sobre você...',
        avatarUrl: avatarUrl || '',
        themeId: 'brutalist-yellow',
        fontFamily: "'Inter', sans-serif",
        headerLayout: headerLayout,
        buttonRoundness: 'square',
        customBackground: null
    };

    // Quick links array mapped para LinkItem
    const previewLinks: LinkItem[] = quickLinks.filter(l => l.url || l.title !== 'Novo Link').map((link, i) => ({
        id: link.id,
        clientId: crypto.randomUUID(),
        title: link.title,
        url: link.url,
        isActive: true,
        layout: link.layout,
        type: link.type,
        platform: link.provider
    }));

    return (
        <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans overflow-hidden">


            {/* Left Side: Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 relative border-b-2 lg:border-b-0 lg:border-r-2 border-black z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-16">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 font-bold text-sm uppercase hover:text-[#97cd7a] transition-colors"
                    >
                        <div className="w-8 h-8 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
                            <ArrowLeft size={16} />
                        </div>
                        Voltar
                    </button>
                    <div className="font-black text-2xl tracking-tighter uppercase">NODUS</div>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="mb-12">
                        {step === 1 && (
                            <h1 className="text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-6">
                                Escolha seu <br /> Link Único.
                            </h1>
                        )}
                        {step === 2 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                Como você <br /> vai usar?
                            </h1>
                        )}
                        {step === 3 && (
                            <h1 className="text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-6">
                                Quase <br /> lá.
                            </h1>
                        )}
                        {step === 4 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                Detalhes <br /> Básicos.
                            </h1>
                        )}
                        {step === 5 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                Adicione <br /> Links.
                            </h1>
                        )}
                        {step === 6 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                Estilo <br /> Visual.
                            </h1>
                        )}
                        <p className="font-medium text-lg text-black/70 border-l-4 border-[#ffdf00] pl-4">
                            {step === 1 && "Você poderá alterá-lo depois se precisar."}
                            {step === 2 && "Isso nos ajuda a personalizar sua experiência."}
                            {step === 3 && "Por onde nos conheceu?"}
                            {step === 4 && "Adicione uma foto e uma biografia."}
                            {step === 5 && "Onde seus seguidores te encontram?"}
                            {step === 6 && "Escolha o layout inicial do seu perfil."}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleNextStep} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">Reserve seu nome de usuário</label>
                                <div className="group relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                                        className={`
                                            w-full bg-white border-2 border-black py-6 pl-[135px] pr-12 text-xl font-black
                                            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                            focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] 
                                            transition-all duration-200
                                            ${available === true ? 'border-[#97cd7a]' :
                                                available === false ? 'border-red-500' :
                                                    'border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                                        `}
                                        placeholder="seu-nome"
                                        required
                                    />
                                    <div className="absolute left-5 inset-y-0 flex items-center gap-1 text-black font-black text-xl select-none pointer-events-none z-10 
                                        group-focus-within:text-[#97cd7a] group-focus-within:translate-x-[2px] group-focus-within:translate-y-[2px]
                                        group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                                        transition-all duration-200">
                                        nodus.my<span className="opacity-30">/</span>
                                    </div>
                                    <div className="absolute right-5 inset-y-0 flex items-center gap-3 bg-white pl-2 z-10
                                        group-focus-within:translate-x-[2px] group-focus-within:translate-y-[2px]
                                        group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                                        transition-all duration-200">
                                        {checking && <Loader2 className="animate-spin text-black" size={24} />}
                                        {!checking && available === true && <Check className="text-[#97cd7a]" size={24} strokeWidth={4} />}
                                        {!checking && available === false && <X className="text-red-500" size={24} strokeWidth={4} />}
                                    </div>
                                </div>
                                <div className="h-6 mt-2">
                                    {available === true && (
                                        <div className="bg-[#97cd7a]/10 border-2 border-[#97cd7a] text-[#5b8c41] px-3 py-1 text-[10px] font-black uppercase tracking-tight inline-block shadow-[2px_2px_0px_0px_#97cd7a]">
                                            Link disponível!
                                        </div>
                                    )}
                                    {available === false && username && !checking && (
                                        <div className="bg-red-50 border-2 border-red-500 text-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-tight inline-block shadow-[2px_2px_0px_0px_#ef4444]">
                                            Indisponível :(
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!available || loading || checking}
                                className={`
                                    w-full h-20 border-2 border-black font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300
                                    ${available && !loading && !checking
                                        ? 'bg-[#ffdf00] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {checking ? <Loader2 className="animate-spin" size={24} /> : 'Continuar'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {[
                                { id: 'creator', label: 'Criador de Conteúdo', description: 'Influenciadores, YouTubers e Criadores.' },
                                { id: 'business', label: 'Corporativo', description: 'Para minha empresa e negócios.' },
                                { id: 'personal', label: 'Uso Pessoal', description: 'Agrupar links e projetos pessoais.' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setUserCategory(cat.id as any)}
                                    className={`
                                        w-full p-6 border-2 text-left transition-all duration-200 relative group
                                        ${userCategory === cat.id
                                            ? 'border-black bg-[#97cd7a] translate-x-[2px] translate-y-[2px] shadow-none'
                                            : 'border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                                    `}
                                >
                                    <h3 className={`font-black uppercase text-xl ${userCategory === cat.id ? 'text-black' : 'text-black'}`}>{cat.label}</h3>
                                    <p className={`text-sm font-bold ${userCategory === cat.id ? 'text-black/60' : 'text-black/40'}`}>{cat.description}</p>
                                    {userCategory === cat.id && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-black flex items-center justify-center">
                                            <Check className="text-black" size={18} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => setStep(3)}
                                disabled={!userCategory}
                                className={`
                                    w-full h-20 border-2 border-black font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 mt-6
                                    ${userCategory
                                        ? 'bg-[#ffdf00] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                Continuar
                            </button>
                            <button onClick={() => setStep(1)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">Voltar</button>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleFinalize} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">Sua resposta</label>
                                <input
                                    type="text"
                                    value={referralSource}
                                    onChange={(e) => setReferralSource(e.target.value)}
                                    className="w-full bg-white border-2 border-black py-6 px-6 text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all duration-200"
                                    placeholder="Ex: Instagram, Amigo, Google..."
                                    required
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(4)}
                                disabled={!referralSource}
                                className={`
                                    w-full h-20 border-2 border-black font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300
                                    ${referralSource
                                        ? 'bg-[#ffdf00] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                Continuar
                            </button>
                            <button type="button" onClick={() => setStep(2)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">Voltar</button>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-slate-100 flex flex-col items-center justify-center relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Camera size={32} className="text-black/30 mb-2" />
                                                <span className="text-[10px] uppercase font-black tracking-widest text-black/40">FOTO</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">Nome de Exibição</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white border-2 border-black py-4 px-4 text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all duration-200"
                                    placeholder="Como quer ser chamado?"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">Sua Bio (Opcional)</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white border-2 border-black py-4 px-4 text-base font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all duration-200 resize-none"
                                    placeholder="Breve descrição sobre você..."
                                />
                            </div>

                            <button
                                onClick={() => setStep(5)}
                                disabled={!name}
                                className={`
                                    w-full h-16 border-2 border-black font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 mt-4
                                    ${name
                                        ? 'bg-[#ffdf00] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                Continuar
                            </button>
                            <button type="button" onClick={() => setStep(3)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">Voltar</button>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8">
                            <p className="font-bold text-slate-500 text-sm">Adicione suas redes sociais e principais links. Você poderá personalizar tudo no Studio.</p>

                            {/* Redes Sociais */}
                            <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-black text-lg uppercase tracking-tight">Redes Sociais</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ícones no topo</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setConfiguringSocialPlatform(null); setSocialSearchTerm(''); setIsSocialModalOpen(true); }}
                                        className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-[#ffdf00] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:bg-black active:text-white"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {quickLinks.filter(l => l.layout === 'social').length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {quickLinks.filter(l => l.layout === 'social').map(link => {
                                            const platform = SOCIAL_PLATFORMS.find(p => p.id === link.provider);
                                            const Icon = platform?.icon || LinkIcon;
                                            return (
                                                <button
                                                    key={link.id}
                                                    type="button"
                                                    onClick={() => handleAddSocialClick(link.provider!)}
                                                    className={`w-12 h-12 flex items-center justify-center border-2 border-black bg-slate-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${platform?.color}`}
                                                >
                                                    <Icon size={24} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                        <Globe size={24} className="mb-2 opacity-50" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Nenhuma rede</span>
                                    </div>
                                )}
                            </div>

                            {/* Meus Links */}
                            <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-black text-lg uppercase tracking-tight">Meus Links</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Botões principais</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddGeneralLink}
                                        className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-[#97cd7a] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:bg-black active:text-white"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {quickLinks.filter(l => l.layout === 'classic').length > 0 ? (
                                        quickLinks.filter(l => l.layout === 'classic').map(link => (
                                            <div key={link.id} className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative group">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 border-2 border-black bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                                                        <LinkIcon size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={link.title}
                                                            onChange={(e) => updateGeneralLink(link.id, 'title', e.target.value)}
                                                            className="w-full text-sm font-bold border-none p-0 focus:ring-0 placeholder:text-slate-300"
                                                            placeholder="Título do Link"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={link.url}
                                                            onChange={(e) => updateGeneralLink(link.id, 'url', e.target.value)}
                                                            className="w-full text-xs font-medium text-slate-600 border-none p-0 focus:ring-0 placeholder:text-slate-300"
                                                            placeholder="https://exemplo.com"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuickLink(link.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                            <LinkIcon size={24} className="mb-2 opacity-50" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Nenhum botão configurado</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(6)}
                                className="w-full h-16 bg-[#ffdf00] border-2 border-black font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none mt-8"
                            >
                                Continuar
                            </button>
                            <button type="button" onClick={() => setStep(4)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">Voltar</button>
                        </div>
                    )}

                    {step === 6 && (
                        <form onSubmit={handleFinalize} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                                {[
                                    { id: 'classic', label: 'Clássico', icon: UserCircle },
                                    { id: 'compact', label: 'Perfil', icon: User },
                                    { id: 'banner', label: 'Banner', icon: Layout }
                                ].map((layout) => {
                                    const Icon = layout.icon;
                                    return (
                                        <button
                                            key={layout.id}
                                            type="button"
                                            onClick={() => setHeaderLayout(layout.id as any)}
                                            className={`
                                                p-4 border-2 flex flex-col items-center gap-2 transition-all duration-200 relative group
                                                ${headerLayout === layout.id
                                                    ? 'border-black bg-[#97cd7a] translate-x-[2px] translate-y-[2px] shadow-none'
                                                    : 'border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                                            `}
                                        >
                                            <Icon size={24} className={headerLayout === layout.id ? 'text-black' : 'text-slate-500 group-hover:text-black'} />
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${headerLayout === layout.id ? 'text-black' : 'text-slate-500 group-hover:text-black'}`}>{layout.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    w-full h-20 border-2 border-black font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300
                                    ${!loading
                                        ? 'bg-[#97cd7a] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : 'Entrar no Studio'}
                            </button>
                            <button type="button" onClick={() => setStep(5)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">Voltar</button>
                        </form>
                    )}

                    {error && <p className="mt-4 text-red-500 text-sm font-medium text-center">{error}</p>}
                </div>


            </div>

            {/* Right Side: Visual Banner or Live Preview */}
            <div className={`hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12 ${step >= 4 ? 'bg-slate-100' : 'bg-[#ffdf00]'}`}>
                {step < 4 ? (
                    <>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
                        </div>

                        {/* Big Visual Element */}
                        <div className="relative w-full max-w-lg aspect-square">
                            {/* Circle Background */}
                            <div className="absolute inset-0 bg-white rounded-full border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"></div>

                            {/* Center Logo instead of Mockup */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 p-12 overflow-hidden rounded-full">
                                <div className="relative w-full h-full flex items-center justify-center transition-transform hover:scale-[1.05] duration-500 animate-float">
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-[92%] h-[92%] object-contain"
                                    >
                                        <source src="/icons/Anime_mascot_fixed_white_background_delpmaspu_.mp4" type="video/mp4" />
                                    </video>
                                </div>
                            </div>

                            {/* Brutalist Floating elements */}
                            {/* 1. Status */}
                            <div className="absolute top-0 left-0 bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transform -rotate-3 z-20 animate-float">
                                <div className="w-8 h-8 bg-[#97cd7a] border-2 border-black rounded-full flex items-center justify-center">
                                    <Check className="text-black" size={16} strokeWidth={4} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-black/40 font-black uppercase tracking-widest leading-none">Status</span>
                                    <span className="font-black text-black text-xs uppercase">Perfil Ativo</span>
                                </div>
                            </div>

                            {/* 2. Analytics */}
                            <div className="absolute top-[20%] -right-8 bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-2 transform rotate-6 z-20 animate-float-delayed w-36">
                                <div className="flex justify-between items-center">
                                    <div className="w-6 h-6 border-2 border-black bg-blue-400 flex items-center justify-center">
                                        <LinkIcon size={12} className="text-white" />
                                    </div>
                                    <span className="text-[10px] font-black bg-[#97cd7a] text-black px-1.5 border-2 border-black">+12%</span>
                                </div>
                                <div className="text-2xl font-black text-black">2.840</div>
                                <div className="text-[9px] font-black text-black/30 uppercase tracking-tighter">Cliques Totais</div>
                            </div>

                            {/* 3. Theme */}
                            <div className="absolute bottom-[10%] -left-8 bg-black text-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_#ffdf00] flex items-center gap-3 transform rotate-2 z-20 animate-float">
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="w-2 h-2 bg-[#97cd7a] border-[1px] border-white/20"></div>
                                    <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                                    <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                                    <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-white/40 font-black uppercase tracking-widest leading-none mb-1">Tema</span>
                                    <span className="font-black text-white text-[10px] uppercase">Brutalismo</span>
                                </div>
                            </div>

                            {/* 4. Realtime Badge */}
                            <div className="absolute -bottom-4 right-10 bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-[10px] font-black uppercase flex items-center gap-2 z-20">
                                <div className="w-3 h-3 bg-red-500 border-2 border-black animate-pulse"></div>
                                Preview ao Vivo
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full max-w-[360px] h-[720px] bg-white rounded-[3rem] border-8 border-slate-800 overflow-hidden shadow-2xl relative animate-fade-in">
                        {/* Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl w-32 mx-auto z-50"></div>
                        {/* Preview Profile */}
                        <div className="w-full h-full overflow-y-auto no-scrollbar pointer-events-none pb-20">
                            <ProfileRenderer
                                profile={previewProfile}
                                links={previewLinks}
                                products={[]}
                                isPreview={true}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Social Links Modal */}
            <AnimatePresence>
                {isSocialModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => { setIsSocialModalOpen(false); setConfiguringSocialPlatform(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-5 border-b-2 border-black flex items-center justify-between bg-[#ffdf00] shrink-0">
                                {configuringSocialPlatform ? (
                                    <button onClick={() => setConfiguringSocialPlatform(null)} className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors">
                                        <ChevronLeft size={24} />
                                    </button>
                                ) : <div className="w-8" />}
                                <h3 className="font-black text-lg uppercase tracking-tight">
                                    {configuringSocialPlatform ? `Configurar ${SOCIAL_PLATFORMS.find(p => p.id === configuringSocialPlatform)?.label}` : 'Adicionar Rede Social'}
                                </h3>
                                <button onClick={() => { setIsSocialModalOpen(false); setConfiguringSocialPlatform(null); }} className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {!configuringSocialPlatform ? (
                                <div className="flex flex-col flex-1 min-h-0 bg-white">
                                    <div className="p-5 border-b-2 border-black shrink-0 bg-[#ffdf00]/20">
                                        <div className="relative">
                                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                autoFocus
                                                type="text"
                                                value={socialSearchTerm}
                                                onChange={(e) => setSocialSearchTerm(e.target.value)}
                                                placeholder="Buscar plataforma..."
                                                className="w-full bg-white border-2 border-black py-3 pl-12 pr-4 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all placeholder:font-normal"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                                        {SOCIAL_PLATFORMS.filter(p => p.label.toLowerCase().includes(socialSearchTerm.toLowerCase())).map(platform => {
                                            const isSelected = quickLinks.some(l => l.provider === platform.id && l.layout === 'social');
                                            const Icon = platform.icon;
                                            return (
                                                <div
                                                    key={platform.id}
                                                    onClick={() => {
                                                        if (!isSelected) {
                                                            setConfiguringSocialPlatform(platform.id);
                                                            setTempSocialUrl('');
                                                        } else {
                                                            const existing = quickLinks.find(l => l.provider === platform.id && l.layout === 'social');
                                                            if (existing) {
                                                                setConfiguringSocialPlatform(platform.id);
                                                                setTempSocialUrl(existing.url);
                                                            }
                                                        }
                                                    }}
                                                    className={`
                                                        w-full flex items-center justify-between p-4 border-2 transition-all cursor-pointer group
                                                        ${isSelected
                                                            ? 'border-black bg-[#97cd7a]/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                            : 'border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-slate-50'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Icon size={24} className={platform.color} />
                                                        <span className="font-bold text-sm uppercase tracking-wider">{platform.label}</span>
                                                    </div>
                                                    {isSelected ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#97cd7a]" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setQuickLinks(quickLinks.filter(l => !(l.provider === platform.id && l.layout === 'social')));
                                                                }}
                                                                className="p-2 border-2 border-transparent hover:border-black hover:bg-black hover:text-white transition-colors text-slate-400 group-hover:text-white"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Plus size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                        {SOCIAL_PLATFORMS.filter(p => p.label.toLowerCase().includes(socialSearchTerm.toLowerCase())).length === 0 && (
                                            <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                Nenhuma plataforma encontrada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-white flex flex-col items-center">
                                    <div className={`w-24 h-24 flex items-center justify-center border-4 border-black bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 ${SOCIAL_PLATFORMS.find(p => p.id === configuringSocialPlatform)?.color}`}>
                                        {SOCIAL_PLATFORMS.find(p => p.id === configuringSocialPlatform)?.icon({ size: 48 })}
                                    </div>

                                    <div className="w-full space-y-3 mb-10">
                                        <label className="text-xs font-black uppercase tracking-widest text-black">Insira seu usuário / handle</label>
                                        <div className="flex items-stretch border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                            {SOCIAL_PLATFORMS.find(p => p.id === configuringSocialPlatform)?.baseUrl && (
                                                <div className="px-4 border-r-2 border-black py-4 bg-slate-50 text-sm font-bold text-slate-500 whitespace-nowrap flex items-center">
                                                    {SOCIAL_PLATFORMS.find(p => p.id === configuringSocialPlatform)?.baseUrl?.replace('https://', '')}
                                                </div>
                                            )}
                                            <input
                                                autoFocus
                                                type="text"
                                                value={tempSocialUrl}
                                                onChange={(e) => setTempSocialUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && confirmSocialPlatform()}
                                                placeholder={SOCIAL_PLATFORMS.find(p => p.id === configuringSocialPlatform)?.placeholder}
                                                className="w-full py-4 px-4 font-bold text-base border-none focus:outline-none focus:ring-0 placeholder:font-normal placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={confirmSocialPlatform}
                                        disabled={!tempSocialUrl}
                                        className={`
                                            w-full h-16 border-2 border-black font-black uppercase tracking-wider text-lg transition-all flex items-center justify-center gap-3
                                            ${tempSocialUrl ? 'bg-[#97cd7a] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 shadow-none'}
                                        `}
                                    >
                                        <Check size={24} strokeWidth={3} /> Salvar Link
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
