import React, { useState } from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES, FONTS } from '../constants';
import ThemeSelector from '../components/ThemeSelector';
import ProfileEditor from '../components/ProfileEditor';
import LinkEditor from '../components/LinkEditor';
import ShopEditor from '../components/ShopEditor';
import Preview from '../components/Preview';
import Sidebar from '../components/Sidebar';
import { Plus, Trash2, GripVertical, Settings, Image as ImageIcon, Layout, Palette, Type, MousePointer2, Smartphone, Monitor, Share2, Eye, ExternalLink, Globe, ChevronRight, Menu, X, Check, Save, Loader2, Play, PlusCircle, Search, List, MessageCircle, HelpCircle, Construction, Mail } from 'lucide-react';
import SocialLinksEditor from '../components/SocialLinksEditor';
import AnalyticsView from '../components/AnalyticsView';
import AudienceView from '../components/AudienceView';
import SettingsView from '../components/SettingsView';
import MonetizationView from '../components/MonetizationView';
import ManageBillingView from '../components/ManageBillingView';
import BillingModal from '../components/BillingModal';
import QRCodeModal from '../components/QRCodeModal';
import UpgradeBanner from '../components/UpgradeBanner';
import { compressImage } from '../utils/imageUtils';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function EditorPage() {
    const { profile: authProfile, loading: authLoading } = useAuth();

    // Initialize state from localStorage (SNAPSHOT) to avoid placeholder flash
    // Profile state - starts null, loaded from API
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        bio: '',
        avatarUrl: '',
        themeId: 'default',
        fontFamily: "'Inter', sans-serif",
        buttonStyle: 'rounded',
        showNewsletter: true
    });

    const [links, setLinks] = useState<LinkItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Always start loading - we don't use localStorage cache anymore
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [loadError, setLoadError] = useState(false); // New state to track load failures

    // Loading progress (0-100)
    const [loadingProgress, setLoadingProgress] = React.useState(0);

    // Load data from API on mount - but only after auth profile exists
    React.useEffect(() => {
        if (authLoading) {
            setIsLoading(true);
            setLoadingProgress(10); // Auth is loading
            return;
        }

        if (!authProfile) {
            setIsLoading(false);
            return;
        }

        setLoadingProgress(20); // Auth complete, starting data fetch

        const loadData = async () => {
            try {
                // Load each item separately to track progress
                setLoadingProgress(30);
                const profileData = await apiClient.getMyProfile();
                setLoadingProgress(50);

                const linksData = await apiClient.getMyLinks();
                setLoadingProgress(70);

                const productsData = await apiClient.getMyProducts();
                setLoadingProgress(90);

                if (profileData.showNewsletter === undefined) profileData.showNewsletter = true;

                setProfile(profileData);
                setLinks(linksData);
                setProducts(productsData);

                // Data loaded successfully
                setLoadingProgress(100);
                setHasLoadedOnce(true);

                // Small delay to show completion before hiding
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.error('Failed to sync background data:', error);
                setLoadingProgress(100);
                setLoadError(true);
                // Do NOT set hasLoadedOnce(true) here to prevent auto-save of empty state
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [authProfile, authLoading]);

    // Refs to track if initial load has been handled for each entity
    const profileLoadHandled = React.useRef(false);
    const linksLoadHandled = React.useRef(false);
    const productsLoadHandled = React.useRef(false);

    // Track last saved state to prevent redundant requests (stop duplication loop)
    const lastSavedLinks = React.useRef<string>('');

    // Track saving states for each entity for more reliable feedback
    const [isSavingProfile, setIsSavingProfile] = React.useState(false);
    const [isSavingLinks, setIsSavingLinks] = React.useState(false);
    const [isSavingProducts, setIsSavingProducts] = React.useState(false);

    const isSaving = isSavingProfile || isSavingLinks || isSavingProducts;

    // Save profile changes to API
    React.useEffect(() => {
        if (!hasLoadedOnce) return;
        if (!profile.id) return; // Only block if ID is missing

        if (!profileLoadHandled.current) {
            profileLoadHandled.current = true;
            return;
        }

        const saveProfile = async () => {
            setIsSavingProfile(true);
            try {
                await apiClient.updateProfile(profile);
            } catch (error) {
                console.error('Persistence Error (Profile):', error);
            } finally {
                setIsSavingProfile(false);
            }
        };

        const timeoutId = setTimeout(saveProfile, 200);
        return () => clearTimeout(timeoutId);
    }, [profile, hasLoadedOnce]);

    // Save links changes to API with Debounce & Deep Compare
    React.useEffect(() => {
        if (!hasLoadedOnce) return;

        if (!linksLoadHandled.current) {
            linksLoadHandled.current = true;
            // Initialize lastSaved state on first load to avoid immediate save
            lastSavedLinks.current = JSON.stringify(links);
            return;
        }

        // Deep equality check: Only save if content ACTUALLY changed
        const currentLinksString = JSON.stringify(links);
        if (currentLinksString === lastSavedLinks.current) {
            return;
        }

        const saveLinks = async () => {
            setIsSavingLinks(true);
            const linksSnapshot = links;
            try {
                // console.log('Saving links...', linksSnapshot.length);
                const savedLinks = await apiClient.replaceAllLinks(linksSnapshot);

                // Update the "last saved" ref to the VERSION WE JUST RECEIVED/SYNCED
                // This is crucial: if we save X, backend returns X' (with UUIDs).
                // We MUST update state to X'. Then lastSaved becomes X'. 
                // Next render checks X' vs X' -> No Save.

                // Sync IDs back to state
                setLinks(currentLinks => {
                    if (savedLinks.length !== linksSnapshot.length) return currentLinks;

                    const idMap = new Map<string, string>();

                    const buildMap = (sent: LinkItem[], received: LinkItem[]) => {
                        for (let i = 0; i < sent.length; i++) {
                            if (sent[i].id !== received[i].id) {
                                idMap.set(sent[i].id, received[i].id);
                            }
                            if (sent[i].children && received[i].children && sent[i].children!.length === received[i].children!.length) {
                                buildMap(sent[i].children!, received[i].children!);
                            }
                        }
                    };

                    buildMap(linksSnapshot, savedLinks);

                    if (idMap.size === 0) {
                        // If no IDs changed, we still strict update the ref to current state
                        lastSavedLinks.current = JSON.stringify(currentLinks);
                        return currentLinks;
                    }

                    const updateIds = (items: LinkItem[]): LinkItem[] => {
                        return items.map(item => ({
                            ...item,
                            id: idMap.get(item.id) || item.id,
                            children: item.children ? updateIds(item.children) : undefined
                        }));
                    };

                    const updatedLinks = updateIds(currentLinks);

                    // Update reference to the NEW state (with UUIDs)
                    lastSavedLinks.current = JSON.stringify(updatedLinks);

                    return updatedLinks;
                });

            } catch (error) {
                console.error('Failed to save links:', error);
            } finally {
                setIsSavingLinks(false);
            }
        };

        const timeoutId = setTimeout(saveLinks, 3000); // Debounce 3s
        return () => clearTimeout(timeoutId);
    }, [links, hasLoadedOnce]);

    // Save products changes to API
    React.useEffect(() => {
        if (!hasLoadedOnce) return;

        if (!productsLoadHandled.current) {
            productsLoadHandled.current = true;
            return;
        }

        const saveProducts = async () => {
            setIsSavingProducts(true);
            const productsSnapshot = products;
            try {
                const savedProducts = await apiClient.replaceAllProducts(productsSnapshot);

                // Sync IDs for products too
                setProducts(currentProducts => {
                    if (savedProducts.length !== productsSnapshot.length) return currentProducts;

                    const idMap = new Map<string, string>();
                    for (let i = 0; i < productsSnapshot.length; i++) {
                        if (productsSnapshot[i].id !== savedProducts[i].id) {
                            idMap.set(productsSnapshot[i].id, savedProducts[i].id);
                        }
                    }

                    if (idMap.size === 0) return currentProducts;

                    return currentProducts.map(p => ({
                        ...p,
                        id: idMap.get(p.id) || p.id
                    }));
                });

            } catch (error) {
                console.error('Failed to save products:', error);
            } finally {
                setIsSavingProducts(false);
            }
        };

        const timeoutId = setTimeout(saveProducts, 1000); // Increased debounce
        return () => clearTimeout(timeoutId);
    }, [products, hasLoadedOnce]);

    React.useEffect(() => {
        document.title = 'Nodus | Editor';
    }, []);

    // 'links' or 'appearance' are the main functional tabs
    const [activeTab, setActiveTab] = useState<string>('links');

    // Mobile drawer state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

    const shareUrl = `https://www.noduscc.com.br/${profile.username || profile.name.toLowerCase().replace(/\s/g, '')}`;

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
            {/* Top Banner for Free Users */}
            {profile.planType === 'free' && (
                <UpgradeBanner onUpgradeClick={() => setIsBillingModalOpen(true)} />
            )}

            <div className="flex-1 flex overflow-hidden relative">
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
                        {/* Minimal Loader */}
                        <div className="flex flex-col items-center">
                            {/* Logo Text */}
                            <div className="mb-8">
                                <span className="text-3xl font-black tracking-tight text-slate-800">
                                    N<span className="text-[#acc8a2]">o</span>dus
                                </span>
                            </div>

                            {/* Minimal Circular Spinner */}
                            <div className="relative w-12 h-12 mb-6">
                                <svg className="animate-spin w-full h-full text-[#acc8a2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>

                            {/* Progress Text */}
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                                {loadingProgress < 30 ? 'Autenticando' :
                                    loadingProgress < 50 ? 'Perfil' :
                                        loadingProgress < 70 ? 'Links' :
                                            loadingProgress < 90 ? 'Produtos' :
                                                'Pronto'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State - Non-intrusive Banner */}
                {loadError && (
                    <div className="absolute top-0 left-0 w-full bg-red-50 border-b border-red-200 z-[100] px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-700 text-sm">
                            <Construction size={16} />
                            <span className="font-medium">Erro de sincronização. As alterações não serão salvas automaticamente.</span>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-bold hover:bg-red-700 transition-colors"
                        >
                            RECARREGAR
                        </button>
                    </div>
                )}

                {/* Sidebar - Desktop (Fixed) */}
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    userProfile={profile}
                    onUpgradeClick={() => setIsBillingModalOpen(true)}
                    className={`fixed left-0 z-40 hidden md:flex ${profile.planType === 'free' ? 'top-10 h-[calc(100vh-40px)]' : 'top-0 h-screen'}`}
                />

                {/* Main Layout */}
                <main className="flex-1 md:ml-64 flex flex-col md:flex-row w-full h-full relative transition-all duration-300">

                    {/* Mobile Header */}
                    <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 z-30">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <Menu size={24} className="text-slate-700" />
                            </button>
                            <h1 className="font-bold text-slate-800">Nodus</h1>
                        </div>
                        <div className="flex gap-2 items-center">
                            {isSaving && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-full animate-pulse border border-brand-100 mr-1">
                                    <Save size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Salvando</span>
                                </div>
                            )}
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="p-2 text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200"
                            >
                                <Share2 size={18} />
                            </button>
                            <button
                                className="flex items-center gap-2 text-sm font-medium text-brand-700 bg-brand-50 px-4 py-2 rounded-full border border-brand-100"
                                onClick={() => setShowMobilePreview(!showMobilePreview)}
                            >
                                <Eye size={16} />
                                {showMobilePreview ? 'Editar' : 'Preview'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Sidebar (Drawer) */}
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-50 md:hidden flex">
                            <div className="w-64 h-full bg-white shadow-xl">
                                <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }} userProfile={profile} onUpgradeClick={() => { setIsBillingModalOpen(true); setIsMobileMenuOpen(false); }} className="flex" />
                            </div>
                            <div className="flex-1 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                        </div>
                    )}

                    {/* 
           --------------------------------------------------
           COLUMN 1: EDITOR AREA 
           Scrollable, Grey Background, Centered Content
           --------------------------------------------------
        */}
                    {/* 
           --------------------------------------------------
           COLUMN 1: EDITOR AREA 
           Scrollable, Grey Background, Centered Content
           --------------------------------------------------
        */}
                    <div className={`flex-1 h-full overflow-y-auto scrollbar-hide ${showMobilePreview ? 'hidden lg:block' : 'block'}`}>

                        {/* Desktop Header (Sticky) */}
                        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-20">
                            <div className="flex items-center gap-2">
                                {/* Breadcrumb or Title */}
                                <h1 className="text-xl font-bold text-slate-800">Editor</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                {isSaving && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 transition-all">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Salvando...</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-sm font-medium"
                                >
                                    <Share2 size={16} />
                                    Compartilhar
                                </button>
                                <a
                                    href={shareUrl}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors text-sm font-medium"
                                >
                                    <ExternalLink size={16} />
                                    Abrir Link
                                </a>
                            </div>
                        </header>
                        <div className="w-full py-10 px-6 lg:px-12 pb-32">

                            {/* Page Title */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                                    {activeTab === 'links' && 'Links'}
                                    {activeTab === 'appearance' && 'Design'}
                                    {activeTab === 'shop' && 'Loja'}
                                    {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                </h1>
                                <p className="text-slate-500 mt-2 text-base">
                                    {activeTab === 'links' && 'Gerencie seus links e informações do perfil.'}
                                    {activeTab === 'appearance' && 'Personalize as cores e o tema do seu Nodus.'}
                                    {activeTab === 'shop' && 'Gerencie os produtos da sua vitrine.'}
                                    {activeTab === 'billing' && 'Gerencie sua assinatura, visualize recibos e detalhes de pagamento.'}
                                </p>
                            </div>





                            {/* Dynamic Content */}
                            <div className="animate-fade-in">
                                {activeTab === 'links' && (
                                    <div className="space-y-6">
                                        <ProfileEditor profile={profile} onChange={setProfile} />
                                        <SocialLinksEditor links={links} onChange={setLinks} />
                                        <LinkEditor links={links} onChange={setLinks} profile={profile} />
                                    </div>
                                )}

                                {activeTab === 'shop' && (
                                    <div className="space-y-6">
                                        <ShopEditor products={products} onChange={setProducts} />
                                    </div>
                                )}

                                {activeTab === 'analytics' && (
                                    <AnalyticsView />
                                )}

                                {activeTab === 'audience' && (
                                    <AudienceView />
                                )}

                                {activeTab === 'settings' && (
                                    <SettingsView profile={profile} onChange={setProfile} />
                                )}

                                {activeTab === 'earn' && (
                                    <MonetizationView profile={profile} onChange={setProfile} />
                                )}

                                {activeTab === 'billing' && (
                                    <ManageBillingView profile={profile} />
                                )}


                                {activeTab === 'appearance' && (
                                    <div className="space-y-8">
                                        {/* Theme Section */}
                                        <ThemeSelector profile={profile} links={links} products={products} onChange={setProfile} />

                                        {/* Custom Colors Section */}
                                        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 lg:p-8">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Palette size={20} className="text-slate-400" />
                                                <h2 className="text-xl font-bold text-slate-800">Cores</h2>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Font Color */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cor da Fonte</label>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="color"
                                                            value={profile.customTextColor || '#000000'}
                                                            onChange={(e) => setProfile({ ...profile, customTextColor: e.target.value })}
                                                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent shrink-0"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={profile.customTextColor || ''}
                                                            onChange={(e) => setProfile({ ...profile, customTextColor: e.target.value })}
                                                            placeholder="#000000"
                                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                                                        />
                                                        {(profile.customTextColor) && (
                                                            <button
                                                                onClick={() => setProfile({ ...profile, customTextColor: null })}
                                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Button Color */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cor dos Botões</label>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="color"
                                                            value={profile.customButtonColor || '#ffffff'}
                                                            onChange={(e) => setProfile({ ...profile, customButtonColor: e.target.value })}
                                                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent shrink-0"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={profile.customButtonColor || ''}
                                                            onChange={(e) => setProfile({ ...profile, customButtonColor: e.target.value })}
                                                            placeholder="#ffffff"
                                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                                                        />
                                                        {(profile.customButtonColor) && (
                                                            <button
                                                                onClick={() => setProfile({ ...profile, customButtonColor: null })}
                                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Background Solid Color */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Fundo Sólido (Opcional)</label>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="color"
                                                            value={profile.customSolidColor || '#ffffff'}
                                                            onChange={(e) => setProfile({ ...profile, customSolidColor: e.target.value, customBackground: null })}
                                                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent shrink-0"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={profile.customSolidColor || ''}
                                                            onChange={(e) => setProfile({ ...profile, customSolidColor: e.target.value, customBackground: null })}
                                                            placeholder="Ex: #ffffff"
                                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                                                        />
                                                        {(profile.customSolidColor) && (
                                                            <button
                                                                onClick={() => setProfile({ ...profile, customSolidColor: null })}
                                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1">Isso sobrescreverá o gradiente do tema selecionado.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fonts Section */}
                                        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 lg:p-8">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Type size={20} className="text-slate-400" />
                                                <h2 className="text-xl font-bold text-slate-800">Tipografia</h2>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {FONTS.map((font) => (
                                                    <button
                                                        key={font.name}
                                                        onClick={() => setProfile({ ...profile, fontFamily: font.family })}
                                                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left hover:bg-slate-50 ${profile.fontFamily === font.family
                                                            ? 'border-brand-600 bg-brand-50/50'
                                                            : 'border-slate-100 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <span className="text-2xl mb-1" style={{ fontFamily: font.family }}>Aa</span>
                                                        <span className="font-semibold text-slate-800">{font.name}</span>
                                                        <span className="text-xs text-slate-400 uppercase tracking-wider">{font.type}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Button Style Section */}
                                        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 lg:p-8">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="p-1.5 bg-brand-50 rounded-md text-brand-600">
                                                    <Construction size={18} />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">Estilo dos Botões</h2>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Rounded Option */}
                                                <button
                                                    onClick={() => setProfile({ ...profile, buttonStyle: 'rounded' })}
                                                    className={`group relative p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${(profile.buttonStyle || 'rounded') === 'rounded'
                                                        ? 'border-brand-600 bg-brand-50/50'
                                                        : 'border-slate-100 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className={`w-12 h-8 bg-slate-200 border border-slate-300 rounded-full ${(profile.buttonStyle || 'rounded') === 'rounded' ? 'bg-brand-200 border-brand-300' : ''}`}></div>
                                                    <div>
                                                        <span className="font-semibold text-slate-800 block">Redondo</span>
                                                        <span className="text-xs text-slate-400">Estilo Clássico</span>
                                                    </div>
                                                    {(profile.buttonStyle || 'rounded') === 'rounded' && (
                                                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-500"></div>
                                                    )}
                                                </button>

                                                {/* Soft Rect Option */}
                                                <button
                                                    onClick={() => setProfile({ ...profile, buttonStyle: 'soft-rect' })}
                                                    className={`group relative p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${profile.buttonStyle === 'soft-rect'
                                                        ? 'border-brand-600 bg-brand-50/50'
                                                        : 'border-slate-100 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className={`w-12 h-8 bg-slate-200 border border-slate-300 rounded-xl ${(profile.buttonStyle) === 'soft-rect' ? 'bg-brand-200 border-brand-300' : ''}`}></div>
                                                    <div>
                                                        <span className="font-semibold text-slate-800 block">Quadrado Suave</span>
                                                        <span className="text-xs text-slate-400">Bordas Arredondadas</span>
                                                    </div>
                                                    {profile.buttonStyle === 'soft-rect' && (
                                                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-500"></div>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab !== 'analytics' && activeTab !== 'audience' && activeTab !== 'settings' && activeTab !== 'earn' && activeTab !== 'billing' && (
                                    <div className="bg-white p-12 rounded-[20px] border border-dashed border-slate-300 text-center">
                                        <div className="text-4xl mb-4 text-slate-300 flex justify-center"><Construction size={48} /></div>
                                        <h3 className="text-lg font-medium text-slate-700">Em Desenvolvimento</h3>
                                        <p className="text-slate-500 mt-2">Esta funcionalidade estará disponível em breve.</p>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* 
           --------------------------------------------------
           COLUMN 2: PREVIEW AREA 
           Fixed, White Background, Distinct Border
           --------------------------------------------------
        */}
                    <div className={`
            lg:flex flex-col items-center justify-center 
            border-l border-slate-200 bg-white 
            w-full lg:w-[480px] xl:w-[580px] shrink-0
            h-[calc(100vh-64px)] md:h-screen
            sticky top-0 right-0
            ${!showMobilePreview ? 'hidden' : 'flex'}
        `}>

                        <div className="relative w-full h-full lg:flex items-center justify-center overflow-hidden lg:bg-white/50 lg:bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                            {/* Scale container to fit phone nicely on different laptop screens - Only on Desktop */}
                            <div className={`
              w-full h-full transform transition-transform duration-300 origin-center flex items-center justify-center
            `}>
                                <Preview profile={profile} links={links} products={products} onShare={() => setIsShareModalOpen(true)} />
                            </div>
                        </div>

                        <div className="hidden lg:block absolute bottom-6 px-4 py-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full text-xs font-medium text-slate-500 shadow-sm">
                            Preview ao vivo
                        </div>
                    </div>

                </main >
                {/* QR Code Modal */}
                {isShareModalOpen && (
                    <QRCodeModal
                        url={shareUrl}
                        profileName={profile.name}
                        onClose={() => setIsShareModalOpen(false)}
                    />
                )}

                {/* Billing Modal */}
                {isBillingModalOpen && (
                    <BillingModal
                        profile={profile}
                        onChange={setProfile}
                        onClose={() => setIsBillingModalOpen(false)}
                    />
                )}

            </div>
        </div>
    );
}
