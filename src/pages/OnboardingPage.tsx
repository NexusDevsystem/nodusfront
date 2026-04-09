import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, AlertCircle, Globe, Link as LinkIcon, X, ArrowLeft, Camera, UserCircle, Layout, User, Plus, Trash2, ChevronLeft, Search, Image as ImageIcon, Pencil, Zap } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { SiWhatsapp, SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiThreads, SiFacebook, SiX, SiSoundcloud, SiSnapchat, SiPinterest } from 'react-icons/si';
import ProfileRenderer from '../components/ProfileRenderer';
import { compressImage } from '../utils/imageUtils';
import { UserProfile, LinkItem, EventItem } from '../types';
import { useTranslation } from 'react-i18next';
import AddLinkModal from '../components/AddLinkModal';
import SortableLinkItem from '../components/link-editor/SortableLinkItem';
import { SOCIAL_NETWORKS, THEMES } from '../constants';

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
};


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
    const { t } = useTranslation();



    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [userCategory, setUserCategory] = useState<'creator' | 'personal' | 'business' | null>(null);
    const [referralSource, setReferralSource] = useState('');

    // Load reserved username or current user's username
    useEffect(() => {
        if (user?.username && !user.username.startsWith('user_')) {
            setUsername(user.username);
            setAvailable(true); // It's their own, so it's "available" for them to keep
        } else {
            const reserved = localStorage.getItem('nodus_reserved_username');
            if (reserved) {
                setUsername(reserved);
            }
        }
    }, [user]);

    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState('');

    // Quick Edit Session States (Steps 4 to 6)
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [headerLayout, setHeaderLayout] = useState<'classic' | 'compact' | 'banner'>('classic');
    const [themeId, setThemeId] = useState('brutalist-bauhaus');
    const [quickLinks, setQuickLinks] = useState<LinkItem[]>([]);

    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [modalView, setModalView] = useState<'all' | 'social' | 'links'>('all');
    const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
    const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});

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
                const compressed = await compressImage(e.target.files[0], 400, 0.7);
                setAvatarUrl(compressed);
            } catch (err) {
                console.error('Error uploading avatar:', err);
                const dataUrl = await fileToDataURL(e.target.files[0]);
                setAvatarUrl(dataUrl);
            }
            e.target.value = '';
        }
    };

    const handleAddLink = (url?: string) => {
        const newLink: any = {
            id: `temp-${Date.now()}`,
            title: url ? (t('links.newLink') || 'Novo Link') : t('onboarding.linkTitlePlaceholder'),
            url: url || '',
            layout: 'classic',
            type: 'link',
            isActive: true,
            clicks: 0
        };
        setQuickLinks([...quickLinks, newLink]);
    };

    const handleAddSocial = (platform: string) => {
        const platformInfo = SOCIAL_NETWORKS.find(p => p.id === platform);
        const newLink: any = {
            id: `temp-${Date.now()}`,
            title: platformInfo?.name || platform,
            url: platformInfo?.baseUrl || '',
            layout: 'classic',
            type: 'social',
            platform: platform,
            isActive: true,
            clicks: 0
        };
        setQuickLinks([...quickLinks, newLink]);
    };

    const handleAddCollection = (name: string, url?: string, layout?: 'list' | 'carousel') => {
        const newLink: any = {
            id: `temp-${Date.now()}`,
            title: name,
            url: url || '',
            layout: layout || 'list',
            type: 'collection',
            isActive: true,
            clicks: 0,
            children: []
        };
        setQuickLinks([...quickLinks, newLink]);
    };

    const updateLink = (id: string, field: string, value: any) => {
        setQuickLinks(quickLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const updateLinkFields = (id: string, updates: Partial<LinkItem>) => {
        setQuickLinks(quickLinks.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const removeLink = (id: string) => {
        setQuickLinks(quickLinks.filter(l => l.id !== id));
    };

    const toggleLink = (id: string) => {
        setQuickLinks(quickLinks.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
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
                userCategory: userCategory,
                referralSource: referralSource || t('common.notProvided'),
                name: name || username,
                bio: bio,
                avatarUrl: avatarUrl,
                headerLayout: headerLayout,
                themeId: themeId,
                onboardingCompleted: true
            });

            // 2. Process and Save links (AutoComplete Logic)
            const validLinks = quickLinks.filter(l => l.url || l.title !== t('onboarding.newLink')); // Allow saving if it has some content
            if (validLinks.length > 0) {
                try {
                    const currentLinks = await apiClient.getMyLinks();
                    const processedLinks: LinkItem[] = validLinks.map((link, index) => {
                        let finalUrl = link.url;

                        if (link.type === 'social') {
                            const platform = SOCIAL_NETWORKS.find(p => p.id === link.platform);
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
                            platform: link.platform,
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
            localStorage.removeItem('nodus_reserved_username');
            navigate('/editor');

        } catch (err: any) {
            console.error('Finalization error:', err);
            setError(err.message || t('common.errorTryAgain'));
        } finally {
            setLoading(false);
        }
    };

    // Config do profile mockado para o Preview
    const previewProfile: UserProfile = {
        name: name || username || t('onboarding.yourName'),
        bio: bio || t('onboarding.bioPlaceholder'),
        avatarUrl: avatarUrl || '',
        themeId: themeId,
        fontFamily: "'Inter', sans-serif",
        headerLayout: headerLayout,
        buttonRoundness: 'square',
        customBackground: null
    };

    // Quick links array mapped para LinkItem
    const previewLinks: LinkItem[] = quickLinks.filter(l => l.url || l.title !== t('onboarding.newLink')).map((link, i) => ({
        id: link.id,
        clientId: crypto.randomUUID(),
        title: link.title,
        url: link.url,
        isActive: true,
        layout: link.layout,
        type: link.type,
        platform: link.platform
    }));

    return (
        <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans overflow-hidden">


            {/* Left Side: Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 relative border-b-2 lg:border-b-0 lg:border-r-2 border-[#1a1a1a] z-10 flex-1">
                {/* Header */}
                <div className="flex justify-between items-center mb-16">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 font-bold text-sm uppercase hover:text-[#97cd7a] transition-colors"
                    >
                        <div className="w-8 h-8 border-2 border-[#1a1a1a] flex items-center justify-center bg-white shadow-[0_2px_0_0_#1a1a1a] group-hover:translate-y-[2px] group-hover:shadow-none transition-all rounded-lg">
                            <ArrowLeft size={16} />
                        </div>
                        {t('onboarding.back')}
                    </button>
                    <div className="font-black text-2xl tracking-tighter uppercase">NODUS</div>
                </div>

                <div className={`flex-1 flex flex-col justify-center ${(step === 5 || step === 6) ? 'max-w-xl lg:max-w-2xl' : 'max-w-md'} mx-auto w-full transition-all duration-500`}>
                    <div className="mb-12">
                        {step === 1 && (
                            <h1 className="text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-6">
                                {t('onboarding.step1Title')}
                            </h1>
                        )}
                        {step === 2 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                {t('onboarding.step2Title')}
                            </h1>
                        )}
                        {step === 3 && (
                            <h1 className="text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-6">
                                {t('onboarding.step3Title')}
                            </h1>
                        )}
                        {step === 4 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                {t('onboarding.step4Title')}
                            </h1>
                        )}
                        {step === 5 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                {t('onboarding.step5Title')}
                            </h1>
                        )}
                        {step === 6 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                {t('onboarding.step6Title')}
                            </h1>
                        )}
                        <p className="font-medium text-lg text-black/70 border-l-4 border-[#ffdf00] pl-4">
                            {step === 1 && t('onboarding.step1Desc')}
                            {step === 2 && t('onboarding.step2Desc')}
                            {step === 3 && t('onboarding.step3Desc')}
                            {step === 4 && t('onboarding.step4Desc')}
                            {step === 5 && t('onboarding.step5Desc')}
                            {step === 6 && t('onboarding.step6Desc')}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleNextStep} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">{t('onboarding.reserveUsername')}</label>
                                <div className="group relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                                        className={`
                                            w-full bg-white border-2 border-[#1a1a1a] py-6 pl-[135px] pr-12 text-xl font-black rounded-2xl
                                            shadow-[0_4px_0_0_#1a1a1a]
                                            focus:outline-none focus:shadow-none focus:translate-y-[4px] 
                                            transition-all duration-200
                                            ${available === true ? 'border-[#97cd7a]' :
                                                available === false ? 'border-red-500' :
                                                    'border-[#1a1a1a] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#1a1a1a]'}
                                        `}
                                        placeholder="seu-nome"
                                        required
                                    />
                                    <div className="absolute left-5 inset-y-0 flex items-center gap-1 text-black font-black text-xl select-none pointer-events-none z-10 
                                        group-focus-within:text-[#97cd7a] group-focus-within:translate-y-[4px]
                                        group-hover:translate-y-[2px]
                                        transition-all duration-200">
                                        nodus.my<span className="opacity-30">/</span>
                                    </div>
                                    <div className="absolute right-5 inset-y-0 flex items-center gap-3 bg-white pl-2 z-10
                                        group-focus-within:translate-y-[4px]
                                        group-hover:translate-y-[2px]
                                        transition-all duration-200">
                                        {checking && <Loader2 className="animate-spin text-black" size={24} />}
                                        {!checking && available === true && <Check className="text-[#97cd7a]" size={24} strokeWidth={4} />}
                                        {!checking && available === false && <X className="text-red-500" size={24} strokeWidth={4} />}
                                    </div>
                                </div>
                                <div className="h-6 mt-2">
                                    {available === true && (
                                        <div className="bg-[#97cd7a]/10 border-2 border-[#97cd7a] text-[#5b8c41] px-3 py-1 text-[10px] font-black uppercase tracking-tight inline-block shadow-[0_2px_0_0_#97cd7a] rounded-lg">
                                            {t('onboarding.usernameAvailable')}
                                        </div>
                                    )}
                                    {available === false && username && !checking && (
                                        <div className="bg-red-50 border-2 border-red-500 text-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-tight inline-block shadow-[0_2px_0_0_#ef4444] rounded-lg">
                                            {t('onboarding.usernameUnavailable')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!available || loading || checking}
                                className={`
                                    w-full h-20 border-2 border-[#1a1a1a] font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 rounded-2xl
                                    ${available && !loading && !checking
                                        ? 'bg-[#ffdf00] text-black shadow-[0_8px_0_0_#1a1a1a] hover:translate-y-[4px] hover:shadow-[0_4px_0_0_#1a1a1a] active:translate-y-[8px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {checking ? <Loader2 className="animate-spin" size={24} /> : t('onboarding.continue')}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {[
                                { id: 'creator', label: t('onboarding.creator'), description: t('onboarding.creatorDesc') },
                                { id: 'business', label: t('onboarding.business'), description: t('onboarding.businessDesc') },
                                { id: 'personal', label: t('onboarding.personal'), description: t('onboarding.personalDesc') }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setUserCategory(cat.id as any)}
                                    className={`
                                        w-full p-6 border-2 text-left transition-all duration-200 relative group rounded-2xl
                                        ${userCategory === cat.id
                                            ? 'border-[#1a1a1a] bg-[#97cd7a] translate-y-[4px] shadow-none'
                                            : 'border-[#1a1a1a] bg-white shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#1a1a1a]'}
                                    `}
                                >
                                    <h3 className={`font-black uppercase text-xl ${userCategory === cat.id ? 'text-black' : 'text-black'}`}>{cat.label}</h3>
                                    <p className={`text-sm font-bold ${userCategory === cat.id ? 'text-black/60' : 'text-black/40'}`}>{cat.description}</p>
                                    {userCategory === cat.id && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-[#1a1a1a] flex items-center justify-center">
                                            <Check className="text-black" size={18} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => setStep(3)}
                                disabled={!userCategory}
                                className={`
                                    w-full h-20 border-2 border-[#1a1a1a] font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 mt-6 rounded-2xl
                                    ${userCategory
                                        ? 'bg-[#ffdf00] text-black shadow-[0_8px_0_0_#1a1a1a] hover:translate-y-[4px] hover:shadow-[0_4px_0_0_#1a1a1a] active:translate-y-[8px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {t('onboarding.continue')}
                            </button>
                            <button onClick={() => setStep(1)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">{t('onboarding.back')}</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'instagram', label: 'Instagram' },
                                    { id: 'tiktok', label: 'TikTok' },
                                    { id: 'youtube', label: 'YouTube' },
                                    { id: 'friend', label: t('onboarding.referralFriend', 'Amigo / Indicação') },
                                    { id: 'google', label: 'Google / Busca' },
                                    { id: 'other', label: t('onboarding.referralOther', 'Outro') }
                                ].map((opt) => (
                                    <div key={opt.id} className="space-y-3">
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                if (opt.id === 'other') {
                                                    setReferralSource('Outro');
                                                } else {
                                                    setReferralSource(opt.label);
                                                }
                                            }}
                                            className={`
                                                w-full p-6 border-2 text-left transition-all duration-200 relative group rounded-2xl
                                                ${(referralSource === opt.label || (opt.id === 'other' && referralSource.startsWith('Outro')))
                                                    ? 'border-[#1a1a1a] bg-[#97cd7a] translate-y-[4px] shadow-none'
                                                    : 'border-[#1a1a1a] bg-white shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#1a1a1a]'}
                                            `}
                                        >
                                            <span className="font-black uppercase text-lg text-black">{opt.label}</span>
                                            {(referralSource === opt.label || (opt.id === 'other' && referralSource.startsWith('Outro'))) && (
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-[#1a1a1a] flex items-center justify-center">
                                                    <Check className="text-black" size={18} strokeWidth={4} />
                                                </div>
                                            )}
                                        </button>
                                        
                                        {/* Conditional Input for 'Other' */}
                                        {opt.id === 'other' && referralSource.startsWith('Outro') && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="px-2"
                                            >
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder={t('onboarding.referralOtherPlaceholder', 'Escreva aqui...')}
                                                    value={referralSource === 'Outro' ? '' : referralSource.replace('Outro: ', '')}
                                                    onChange={(e) => setReferralSource(`Outro: ${e.target.value}`)}
                                                    className="w-full bg-white border-2 border-[#1a1a1a] py-4 px-5 text-sm font-bold rounded-xl shadow-[0_4px_0_0_#1a1a1a] focus:outline-none focus:shadow-none focus:translate-y-[4px] transition-all"
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(4)}
                                disabled={!referralSource || (referralSource.startsWith('Outro') && referralSource === 'Outro')}
                                className={`
                                    w-full h-20 border-2 border-[#1a1a1a] font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 mt-6 rounded-2xl
                                    ${(referralSource && (!referralSource.startsWith('Outro') || referralSource !== 'Outro'))
                                        ? 'bg-[#ffdf00] text-black shadow-[0_8px_0_0_#1a1a1a] hover:translate-y-[4px] hover:shadow-[0_4px_0_0_#1a1a1a] active:translate-y-[8px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {t('onboarding.continue')}
                            </button>
                            <button type="button" onClick={() => setStep(2)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">{t('onboarding.back')}</button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full border-4 border-[#1a1a1a] overflow-hidden bg-slate-100 flex flex-col items-center justify-center relative shadow-[0_4px_0_0_#1a1a1a] transition-all hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#1a1a1a]">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Camera size={32} className="text-black/30 mb-2" />
                                                <span className="text-[10px] uppercase font-black tracking-widest text-black/40">{t('onboarding.photo')}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                    {!avatarUrl && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -15 }}
                                            animate={{ scale: 1, rotate: -5 }}
                                            className="absolute -top-2 -right-4 bg-[#ef4444] text-white text-[10px] font-black uppercase px-3 py-1 border-2 border-[#1a1a1a] shadow-[3px_3px_0_0_#1a1a1a] rounded-lg z-20"
                                        >
                                            {t('common.required', 'Obrigatório')}
                                        </motion.div>
                                    )}
                                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">{t('onboarding.displayName')}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white border-2 border-[#1a1a1a] py-4 px-4 text-lg font-bold rounded-2xl shadow-[0_4px_0_0_#1a1a1a] focus:outline-none focus:shadow-none focus:translate-y-[4px] transition-all duration-200"
                                    placeholder={t('onboarding.namePlaceholder')}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">{t('onboarding.bio')}</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white border-2 border-[#1a1a1a] py-4 px-4 text-base font-medium rounded-2xl shadow-[0_4px_0_0_#1a1a1a] focus:outline-none focus:shadow-none focus:translate-y-[4px] transition-all duration-200 resize-none"
                                    placeholder={t('onboarding.bioPlaceholder')}
                                />
                            </div>

                            <button
                                onClick={() => setStep(5)}
                                disabled={!name || !avatarUrl}
                                className={`
                                    w-full h-16 border-2 border-[#1a1a1a] font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 mt-4 rounded-2xl
                                    ${name && avatarUrl
                                        ? 'bg-[#ffdf00] text-black shadow-[0_6px_0_0_#1a1a1a] hover:translate-y-[3px] hover:shadow-[0_3px_0_0_#1a1a1a] active:translate-y-[6px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {t('onboarding.continue')}
                            </button>
                            <button type="button" onClick={() => setStep(3)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">{t('onboarding.back')}</button>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8">
                            <p className="font-bold text-slate-500 text-sm">{t('onboarding.addSocialsAndLinks')}</p>
                            <div className="bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-3xl overflow-hidden flex flex-col">
                                <div className="p-5 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-black text-lg uppercase tracking-tight">{t('onboarding.socialNetworks')}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('onboarding.topIconsDesc', 'Ícones no topo do perfil')}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setModalView('social'); setIsAddLinkModalOpen(true); }}
                                            className="w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center hover:bg-[#ffdf00] transition-colors shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none active:translate-y-[4px] active:shadow-none rounded-xl"
                                        >
                                            <Plus size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-5 pb-5 w-full">
                                    {quickLinks.filter(l => l.type === 'social').length > 0 ? (
                                        <div className="flex flex-wrap gap-4 w-full">
                                            {quickLinks.filter(l => l.type === 'social').map(link => {
                                                const platformInfo = SOCIAL_NETWORKS.find(p => p.id === link.platform);
                                                const Icon = platformInfo?.icon || LinkIcon;
                                                return (
                                                    <button
                                                        key={link.id}
                                                        type="button"
                                                        onClick={() => { setModalView('social'); setIsAddLinkModalOpen(true); }}
                                                        className="w-14 h-14 flex items-center justify-center border-2 border-[#1a1a1a] rounded-xl bg-slate-50 transition-all shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none"
                                                    >
                                                        <Icon size={28} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="w-full py-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 rounded-xl">
                                            <Globe size={24} className="mb-2 opacity-50" />
                                            <span className="text-xs font-bold uppercase tracking-widest">{t('onboarding.noSocials', 'Nenhuma rede social')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-3xl overflow-hidden flex flex-col">
                                <div className="p-5 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-lg uppercase tracking-tight">{t('onboarding.myLinks')}</h3>
                                                {quickLinks.filter(l => l.type !== 'social').length === 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="bg-[#ef4444] text-white text-[9px] font-black uppercase px-2 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0_0_#1a1a1a] rounded-lg"
                                                    >
                                                        {t('onboarding.requiredLink', 'Obrigatório: 1 link')}
                                                    </motion.div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('onboarding.mainButtonsDesc')}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setModalView('links'); setIsAddLinkModalOpen(true); }}
                                            className="w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center hover:bg-[#97cd7a] transition-colors shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none active:translate-y-[4px] active:shadow-none rounded-xl"
                                        >
                                            <Plus size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full flex-1">
                                    {quickLinks.filter(l => l.type !== 'social').length > 0 ? (
                                        <Reorder.Group
                                            axis="y"
                                            values={quickLinks.filter(l => l.type !== 'social')}
                                            onReorder={(newOrdered: any[]) => {
                                                const socials = quickLinks.filter(l => l.type === 'social');
                                                setQuickLinks([...socials, ...newOrdered]);
                                            }}
                                            className="w-full"
                                        >
                                            {quickLinks.filter(l => l.type !== 'social').map(link => (
                                                <div key={link.id} className="w-full px-5 pb-3">
                                                    <SortableLinkItem
                                                        link={link}
                                                        updateLink={updateLink}
                                                        updateLinkFields={updateLinkFields}
                                                        removeLink={removeLink}
                                                        toggleLink={(id) => setExpandedLinks(prev => ({ ...prev, [id]: !prev[id] }))}
                                                        isExpanded={expandedLinks[link.id]}
                                                        toggleCollection={(id) => setExpandedCollections(prev => ({ ...prev, [id]: !prev[id] }))}
                                                        isCollectionExpanded={expandedCollections[link.id]}
                                                        profile={{
                                                            name: name,
                                                            bio: bio,
                                                            avatarUrl: avatarUrl,
                                                            fontFamily: 'Inter',
                                                            headerLayout: headerLayout,
                                                            themeId: themeId,
                                                            plan_type: user?.plan_type || 'free'
                                                        }}
                                                        level={0}
                                                        expandedLinks={expandedLinks}
                                                        setExpandedLinks={setExpandedLinks}
                                                        expandedCollections={expandedCollections}
                                                        setExpandedCollections={setExpandedCollections}
                                                        isAnyExpanded={Object.values(expandedLinks).some(v => v)}
                                                        isMobile={window.innerWidth < 768}
                                                        isOnboarding={true}
                                                    />
                                                </div>
                                            ))}
                                        </Reorder.Group>
                                    ) : (
                                        <div className="px-5 pb-5 w-full">
                                            <div className="w-full py-10 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 rounded-xl">
                                                <LinkIcon size={24} className="mb-2 opacity-50" />
                                                <span className="text-xs font-bold uppercase tracking-widest">{t('onboarding.noLinks', 'Nenhum link adicionado')}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setStep(6)}
                                    disabled={quickLinks.filter(l => l.type !== 'social').length === 0}
                                    className={`
                                        w-full h-16 border-2 border-[#1a1a1a] font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_6px_0_0_#1a1a1a] hover:translate-y-[3px] hover:shadow-[0_3px_0_0_#1a1a1a] active:translate-y-[6px] active:shadow-none mt-8 rounded-2xl
                                        ${quickLinks.filter(l => l.type !== 'social').length > 0
                                            ? 'bg-[#ffdf00] text-black'
                                            : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                    `}
                                >
                                    {t('onboarding.continue')}
                                </button>
                            </div>
                            <button type="button" onClick={() => setStep(4)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">{t('onboarding.back')}</button>
                        </div>
                    )}

                    {step === 6 && (
                        <form onSubmit={handleFinalize} className="space-y-6">
                            <div className="max-h-[520px] overflow-y-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-6 p-1">
                                    {THEMES.filter(t => !t.isPro && t.id !== 'custom').map((theme) => {
                                        const isSelected = themeId === theme.id;
                                        // Simple cleaner for button classes to show in preview
                                        const buttonVisuals = theme.buttonClass.replace(/\b(w-full|flex|items-center|justify-between|py-\d+|px-\d+|gap-\d+|active:.*|hover:.*|transition-.*|duration-.*)\b/g, '').trim();
                                        
                                        return (
                                            <div
                                                key={theme.id}
                                                onClick={() => setThemeId(theme.id)}
                                                className="flex flex-col gap-2 group cursor-pointer relative"
                                            >
                                                <div className={`relative aspect-[3/4] w-full border-2 transition-all duration-300 rounded-xl overflow-hidden ${isSelected ? 'border-[#1a1a1a] bg-[#ffdf00] shadow-[0_6px_0_0_#1a1a1a] -translate-y-1' : 'border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30 bg-white shadow-[0_2px_0_0_#1a1a1a]/5'}`}>
                                                    {/* Background Preview */}
                                                    <div className={`absolute inset-0 ${theme.backgroundClass}`} style={{ backgroundColor: theme.solidColor }} />
                                                    
                                                    {/* Content Preview */}
                                                    <div className="absolute inset-0 p-4 flex flex-col items-center justify-center gap-4">
                                                        <div className="flex-1 flex items-center justify-center w-full">
                                                            <div className={`${theme.textClass} text-4xl font-black opacity-90`} style={{ fontFamily: theme.fontFamily }}>Aa</div>
                                                        </div>
                                                        <div className="w-full h-10 flex items-center justify-center">
                                                            <div className={`h-8 w-20 ${buttonVisuals} flex items-center justify-center shadow-sm pointer-events-none`}>
                                                                <div className="w-8 h-1.5 bg-current opacity-20 rounded-full" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Selection Badge */}
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 w-7 h-7 bg-[#97cd7a] text-black border-2 border-[#1a1a1a] flex items-center justify-center shadow-[0_3px_0_0_#1a1a1a] z-10 rounded-lg">
                                                            <Check size={16} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] font-black text-center truncate px-1 transition-colors uppercase tracking-[0.2em] mt-1 ${isSelected ? 'text-black' : 'text-black/40 group-hover:text-black'}`}>
                                                    {theme.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    w-full h-20 border-2 border-[#1a1a1a] font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 rounded-2xl
                                    ${!loading
                                        ? 'bg-[#97cd7a] text-black shadow-[0_8px_0_0_#1a1a1a] hover:translate-y-[4px] hover:shadow-[0_4px_0_0_#1a1a1a] active:translate-y-[8px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : t('onboarding.enterStudio')}
                            </button>
                            <button type="button" onClick={() => setStep(5)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">{t('onboarding.back')}</button>
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
                            <div className="absolute inset-0 bg-white rounded-full border-4 border-[#1a1a1a] shadow-[20px_20px_0px_0px_rgba(26,26,26,1)]"></div>

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
                            <div className="absolute top-0 left-0 bg-white border-2 border-[#1a1a1a] p-4 shadow-[0_6px_0_0_rgba(26,26,26,1)] flex items-center gap-3 transform -rotate-3 z-20 animate-float">
                                <div className="w-8 h-8 bg-[#97cd7a] border-2 border-[#1a1a1a] rounded-full flex items-center justify-center">
                                    <Check className="text-black" size={16} strokeWidth={4} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-black/40 font-black uppercase tracking-widest leading-none">{t('onboarding.status')}</span>
                                    <span className="font-black text-black text-xs uppercase">{t('onboarding.profileActive')}</span>
                                </div>
                            </div>

                            {/* 2. Analytics */}
                            <div className="absolute top-[20%] -right-8 bg-white border-2 border-[#1a1a1a] p-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-2 transform rotate-6 z-20 animate-float-delayed w-36">
                                <div className="flex justify-between items-center">
                                    <div className="w-6 h-6 border-2 border-[#1a1a1a] bg-blue-400 flex items-center justify-center">
                                        <LinkIcon size={12} className="text-white" />
                                    </div>
                                    <span className="text-[10px] font-black bg-[#97cd7a] text-black px-1.5 border-2 border-[#1a1a1a]">+12%</span>
                                </div>
                                <div className="text-2xl font-black text-black">2.840</div>
                                <div className="text-[9px] font-black text-black/30 uppercase tracking-tighter">{t('onboarding.totalClicks')}</div>
                            </div>

                            {/* 3. Theme */}
                            <div className="absolute bottom-[10%] -left-8 bg-black text-white border-2 border-[#1a1a1a] p-4 shadow-[6px_6px_0px_0px_#ffdf00] flex items-center gap-3 transform rotate-2 z-20 animate-float">
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="w-2 h-2 bg-[#97cd7a] border-[1px] border-white/20"></div>
                                    <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                                    <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                                    <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-white/40 font-black uppercase tracking-widest leading-none mb-1">{t('onboarding.theme')}</span>
                                    <span className="font-black text-white text-[10px] uppercase">{t('onboarding.brutalism')}</span>
                                </div>
                            </div>

                            {/* 4. Realtime Badge */}
                            <div className="absolute -bottom-4 right-10 bg-white border-2 border-[#1a1a1a] px-4 py-2 shadow-[0_4px_0_0_rgba(26,26,26,1)] text-black text-[10px] font-black uppercase flex items-center gap-2 z-20">
                                <div className="w-3 h-3 bg-red-500 border-2 border-[#1a1a1a] animate-pulse"></div>
                                {t('onboarding.livePreview')}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full max-w-[360px] h-[720px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl relative animate-fade-in">
                        {/* Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl w-32 mx-auto z-50"></div>
                        {/* Preview Profile */}
                        <div className="w-full h-full overflow-y-auto no-scrollbar pointer-events-none rounded-[2.2rem] bg-inherit">
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
                {isAddLinkModalOpen && (
                    <AddLinkModal
                        isOpen={isAddLinkModalOpen}
                        initialView={modalView}
                        onClose={() => setIsAddLinkModalOpen(false)}
                        onAddLink={handleAddLink}
                        onAddSocial={handleAddSocial}
                        onAddCollection={handleAddCollection}
                        onAddProduct={(col) => handleAddCollection(col, '', 'carousel')} // Product is simplified here
                        onAddHeader={() => {
                            handleAddLink(); // Mock as link for onboarding
                        }}
                        onAddAgenda={() => {
                            handleAddLink();
                        }}
                        onAddMap={() => {
                            handleAddLink();
                        }}
                        onAddMediaKit={() => {
                            handleAddLink();
                        }}
                        onAddIncentives={() => {
                            handleAddLink();
                        }}
                        plan_type={user?.plan_type || 'free'}
                        profile={{
                            name: name,
                            bio: bio,
                            avatarUrl: avatarUrl,
                            themeId: 'velvet-night',
                            fontFamily: 'Inter',
                            headerLayout: headerLayout,
                            plan_type: user?.plan_type || 'free'
                        } as any}
                        onProfileChange={() => { }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
