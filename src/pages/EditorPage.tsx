import React, { useState } from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES, FONTS } from '../constants';
import ThemeSelector from '../components/ThemeSelector';

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
import DesignSidebar from '../components/DesignSidebar';
import HeaderEditor from '../components/design/HeaderEditor';
import TypographyEditor from '../components/design/TypographyEditor';
import ButtonsEditor from '../components/design/ButtonsEditor';
import ColorsEditor from '../components/design/ColorsEditor';
import WallpaperEditor from '../components/design/WallpaperEditor';
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

    // Manual save for profile and products
    const handleManualSave = async () => {
        if (!profile.id) return;

        setIsSavingProfile(true);
        setIsSavingProducts(true);

        try {
            // Save profile and products in parallel
            await Promise.all([
                apiClient.updateProfile(profile),
                apiClient.replaceAllProducts(products)
            ]);

            // Success feedback could be added here (e.g., toast)
        } catch (error) {
            console.error('Failed to save data:', error);
            // Error feedback could be added here
        } finally {
            setIsSavingProfile(false);
            setIsSavingProducts(false);
        }
    };

    // Save links changes to API with Debounce & Deep Compare (KEEP UNCHANGED)
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

    // Products auto-save removed in favor of manual save button
    // Links still use auto-save below.

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

    // Design Sidebar State
    const [activeDesignSection, setActiveDesignSection] = useState('header');

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
                                onClick={handleManualSave}
                                disabled={isSaving}
                                className={`flex items-center gap-2 text-sm font-bold text-white px-5 py-2 rounded-full transition-all ${isSaving ? 'bg-slate-400' : 'bg-slate-900 shadow-lg active:scale-95'}`}
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? 'Salvando...' : 'Salvar'}
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
                                <button
                                    onClick={handleManualSave}
                                    disabled={isSaving}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all text-sm font-bold ${isSaving
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95'
                                        }`}
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
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
                        <div className="w-full py-4 md:py-10 px-6 lg:px-12 pb-32">

                            {/* Page Title */}
                            <div className="mb-4 md:mb-8">
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
                                    <div className="flex flex-col md:flex-row h-[calc(100vh-130px)] md:h-[calc(100vh-140px)] -mt-4 md:-mt-6 -mx-6 lg:-mx-12 bg-slate-50 relative">
                                        {/* Design Sidebar */}
                                        <div className="shrink-0 h-auto md:h-full z-10 sticky top-0 bg-slate-50">
                                            <DesignSidebar
                                                activeSection={activeDesignSection}
                                                setActiveSection={setActiveDesignSection}
                                            />
                                        </div>

                                        {/* Design Content Area */}
                                        <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
                                            <h2 className="text-2xl font-bold text-slate-800 mb-6 hidden md:block">
                                                {activeDesignSection === 'header' && 'Cabeçalho'}
                                                {activeDesignSection === 'theme' && 'Temas'}
                                                {activeDesignSection === 'wallpaper' && 'Papel de Parede'}
                                                {activeDesignSection === 'text' && 'Tipografia'}
                                                {activeDesignSection === 'buttons' && 'Estilo dos Botões'}
                                                {activeDesignSection === 'colors' && 'Cores Personalizadas'}
                                            </h2>

                                            {activeDesignSection === 'header' && (
                                                <HeaderEditor profile={profile} onChange={setProfile} />
                                            )}

                                            {activeDesignSection === 'theme' && (
                                                <ThemeSelector profile={profile} links={links} products={products} onChange={setProfile} />
                                            )}

                                            {activeDesignSection === 'wallpaper' && (
                                                <WallpaperEditor profile={profile} onChange={setProfile} />
                                            )}

                                            {activeDesignSection === 'text' && (
                                                <TypographyEditor profile={profile} onChange={setProfile} />
                                            )}

                                            {activeDesignSection === 'buttons' && (
                                                <ButtonsEditor profile={profile} onChange={setProfile} />
                                            )}

                                            {activeDesignSection === 'colors' && (
                                                <ColorsEditor profile={profile} onChange={setProfile} />
                                            )}
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
