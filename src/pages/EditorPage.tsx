import React, { useState } from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES, FONTS } from '../constants';
import ThemeSelector from '../components/ThemeSelector';

import LinkEditor from '../components/LinkEditor';
import ShopEditor from '../components/ShopEditor';
import Preview from '../components/Preview';
import Sidebar from '../components/Sidebar';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Layout, Palette, Type, MousePointer2, Smartphone, Monitor, Share, Eye, ExternalLink, Globe, ChevronRight, Menu, X, Check, Save, Loader2, PlusCircle, Search, List, MessageCircle, HelpCircle, Construction, Mail, ChevronsRight } from 'lucide-react';
import SocialLinksEditor from '../components/SocialLinksEditor';
import AnalyticsView from '../components/AnalyticsView';
import MonetizationView from '../components/MonetizationView';
import SupportView from '../components/SupportView';
import ManageBillingView from '../components/ManageBillingView';
import BillingModal from '../components/BillingModal';
import QRCodeModal from '../components/QRCodeModal';
import UpgradeBanner from '../components/UpgradeBanner';
import DesignSidebar from '../components/DesignSidebar';
import HeaderEditor from '../components/design/HeaderEditor';
import TypographyEditor from '../components/design/TypographyEditor';
import WallpaperEditor from '../components/design/WallpaperEditor';
import ButtonsEditor from '../components/design/ButtonsEditor';
import { compressImage } from '../utils/imageUtils';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import FileManager from '../components/tools/FileManager';


export default function EditorPage() {
    const { profile: authProfile, loading: authLoading } = useAuth();

    // Initialize state from localStorage (SNAPSHOT) to avoid placeholder flash
    // Profile state - starts null, loaded from API
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        bio: '',
        avatarUrl: '',
        themeId: 'animated-nodus-official',
        fontFamily: "'Inter', sans-serif"
    });

    const [links, setLinks] = useState<LinkItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const updateProfile = (updates: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

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

                const linksDataRaw = await apiClient.getMyLinks();
                setLoadingProgress(70);

                const productsDataRaw = await apiClient.getMyProducts();
                setLoadingProgress(90);

                // Helper to assign clientIds recursively
                const withClientIds = (items: any[]): any[] => items.map(item => ({
                    ...item,
                    clientId: item.clientId || crypto.randomUUID(),
                    children: item.children ? withClientIds(item.children) : undefined
                }));

                const linksData = withClientIds(linksDataRaw);
                const productsData = withClientIds(productsDataRaw);


                setProfile(profileData);
                setLinks(linksData);
                setProducts(productsData);

                // --- AUTOMATIC PAYMENT RECONCILIATION ---
                // If user is currently marked as Free, check Stripe silently for an active subscription
                if (profileData.planType === 'free' || !profileData.planType) {
                    console.log('🔄 Free plan detected. Silently checking for active subscriptions...');
                    try {
                        const reconciledProfile = await apiClient.autoReconcile();
                        if (reconciledProfile.planType && reconciledProfile.planType !== 'free') {
                            setProfile(reconciledProfile);
                            console.log('✨ Account upgraded automatically!');
                        }
                    } catch (reconcileError) {
                        // Fail silently for auto-reconcile to not disturb user flow
                        console.error('Silent reconcile failed:', reconcileError);
                    }
                }

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

    // Track last saved state to prevent redundant requests
    const lastSavedLinks = React.useRef<string>('');
    const lastSavedProfile = React.useRef<string>('');
    const lastSavedProducts = React.useRef<string>('');

    // Track saving states for each entity
    const [isSavingProfile, setIsSavingProfile] = React.useState(false);
    const [isSavingLinks, setIsSavingLinks] = React.useState(false);
    const [isSavingProducts, setIsSavingProducts] = React.useState(false);
    const [expandedLinks, setExpandedLinks] = React.useState<Record<string, boolean>>({});
    const [expandedCollections, setExpandedCollections] = React.useState<Record<string, boolean>>({});

    const isSaving = isSavingProfile || isSavingLinks || isSavingProducts;

    // --- AUTO-SAVE: PROFILE ---
    React.useEffect(() => {
        if (!hasLoadedOnce || !profile.id) return;

        // Initialize ref on first successful load
        if (!profileLoadHandled.current) {
            profileLoadHandled.current = true;
            lastSavedProfile.current = JSON.stringify(profile);
            return;
        }

        const currentProfileString = JSON.stringify(profile);
        if (currentProfileString === lastSavedProfile.current) return;

        const saveProfile = async () => {
            setIsSavingProfile(true);
            try {
                await apiClient.updateProfile(profile);
                lastSavedProfile.current = JSON.stringify(profile);
            } catch (error) {
                console.error('Auto-save profile failed:', error);
            } finally {
                setIsSavingProfile(false);
            }
        };

        const timeoutId = setTimeout(saveProfile, 800);
        return () => clearTimeout(timeoutId);
    }, [profile, hasLoadedOnce]);

    // --- AUTO-SAVE: LINKS ---
    React.useEffect(() => {
        if (!hasLoadedOnce) return;

        if (!linksLoadHandled.current) {
            linksLoadHandled.current = true;
            lastSavedLinks.current = JSON.stringify(links);
            return;
        }

        const currentLinksString = JSON.stringify(links);
        if (currentLinksString === lastSavedLinks.current) return;

        const saveLinks = async () => {
            setIsSavingLinks(true);
            const linksSnapshot = links;
            try {
                const savedLinks = await apiClient.replaceAllLinks(linksSnapshot);

                // Sync backend-generated IDs back to state
                setLinks(currentLinks => {
                    if (savedLinks.length !== linksSnapshot.length) return currentLinks;
                    const idMap = new Map<string, string>();
                    const buildMap = (sent: LinkItem[], received: LinkItem[]) => {
                        for (let i = 0; i < sent.length; i++) {
                            if (sent[i].id !== received[i].id) idMap.set(sent[i].id, received[i].id);
                            if (sent[i].children && received[i].children) buildMap(sent[i].children!, received[i].children!);
                        }
                    };
                    buildMap(linksSnapshot, savedLinks);

                    if (idMap.size === 0) {
                        lastSavedLinks.current = JSON.stringify(currentLinks);
                        return currentLinks;
                    }

                    const updateIds = (items: LinkItem[]): LinkItem[] => items.map(item => ({
                        ...item,
                        id: idMap.get(item.id) || item.id,
                        children: item.children ? updateIds(item.children) : undefined
                    }));

                    const updatedLinks = updateIds(currentLinks);

                    // Also sync expanded states so editors don't close!
                    setExpandedLinks(prev => {
                        const next = { ...prev };
                        idMap.forEach((newId, oldId) => {
                            if (next[oldId]) {
                                next[newId] = true;
                                delete next[oldId];
                            }
                        });
                        return next;
                    });
                    setExpandedCollections(prev => {
                        const next = { ...prev };
                        idMap.forEach((newId, oldId) => {
                            if (next[oldId]) {
                                next[newId] = true;
                                delete next[oldId];
                            }
                        });
                        return next;
                    });

                    lastSavedLinks.current = JSON.stringify(updatedLinks);
                    return updatedLinks;
                });
            } catch (error) {
                console.error('Auto-save links failed:', error);
            } finally {
                setIsSavingLinks(false);
            }
        };

        const timeoutId = setTimeout(saveLinks, 3000);
        return () => clearTimeout(timeoutId);
    }, [links, hasLoadedOnce]);

    // --- AUTO-SAVE: PRODUCTS ---
    React.useEffect(() => {
        if (!hasLoadedOnce) return;

        if (!productsLoadHandled.current) {
            productsLoadHandled.current = true;
            lastSavedProducts.current = JSON.stringify(products);
            return;
        }

        const currentProductsString = JSON.stringify(products);
        if (currentProductsString === lastSavedProducts.current) return;

        const saveProducts = async () => {
            setIsSavingProducts(true);
            const productsSnapshot = products;
            try {
                const savedProducts = await apiClient.replaceAllProducts(productsSnapshot);

                // Sync backend-generated IDs back to state
                setProducts(currentProducts => {
                    if (savedProducts.length !== productsSnapshot.length) return currentProducts;
                    const idMap = new Map<string, string>();
                    for (let i = 0; i < productsSnapshot.length; i++) {
                        if (productsSnapshot[i].id !== savedProducts[i].id) {
                            idMap.set(productsSnapshot[i].id, savedProducts[i].id);
                        }
                    }

                    if (idMap.size === 0) {
                        lastSavedProducts.current = JSON.stringify(currentProducts);
                        return currentProducts;
                    }

                    const updatedProducts = currentProducts.map(p => ({
                        ...p,
                        id: idMap.get(p.id) || p.id
                    }));

                    lastSavedProducts.current = JSON.stringify(updatedProducts);
                    return updatedProducts;
                });
            } catch (error) {
                console.error('Auto-save products failed:', error);
            } finally {
                setIsSavingProducts(false);
            }
        };

        const timeoutId = setTimeout(saveProducts, 2500);
        return () => clearTimeout(timeoutId);
    }, [products, hasLoadedOnce]);

    React.useEffect(() => {
        const handleOpenBilling = () => setIsBillingModalOpen(true);
        window.addEventListener('open-billing-modal', handleOpenBilling);
        document.title = 'Nodus | Editor';
        return () => window.removeEventListener('open-billing-modal', handleOpenBilling);
    }, []);

    // 'links' or 'appearance' are the main functional tabs
    const [activeTab, setActiveTab] = useState<string>(() => {
        return localStorage.getItem('nodus_editor_active_tab') || 'links';
    });

    // Persist activeTab to localStorage
    React.useEffect(() => {
        localStorage.setItem('nodus_editor_active_tab', activeTab);
    }, [activeTab]);

    // Mobile drawer state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

    // Design Sidebar State
    const [activeDesignSection, setActiveDesignSection] = useState('header');

    // Sidebar Toggle State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const shareUrl = `https://www.noduscc.com.br/${profile.username || profile.name.toLowerCase().replace(/\s/g, '')}`;

    return (
        <div className="h-screen bg-[#0D0E12] flex flex-col overflow-hidden">
            {/* Top Banner for Free Users */}
            {profile.planType === 'free' && (
                <UpgradeBanner onUpgradeClick={() => setIsBillingModalOpen(true)} />
            )}

            <div className={`flex-1 flex overflow-hidden relative bg-white shadow-2xl ${profile.planType === 'free' ? 'rounded-t-[24px] md:rounded-t-[32px]' : ''
                }`}>
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
                {isSidebarOpen && (
                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        userProfile={profile}
                        onUpgradeClick={() => setIsBillingModalOpen(true)}
                        onClose={() => setIsSidebarOpen(false)}
                        className={`hidden md:flex h-full ${profile.planType === 'free' ? 'rounded-tl-[24px] md:rounded-tl-[32px]' : ''
                            }`}
                    />
                )}

                {/* Main Layout */}
                <main className="flex-1 flex flex-col md:flex-row min-w-0 h-full relative transition-all duration-300">

                    {/* Mobile Header */}
                    <div className={`md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm ${profile.planType === 'free' ? 'rounded-t-[24px]' : ''
                        }`}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <Menu size={24} className="text-slate-700" />
                            </button>
                            <h1 className="font-bold text-slate-800">Nodus</h1>
                        </div>
                        <div className="flex gap-1 items-center">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300">
                                {isSaving ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin text-[#32a800]" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#32a800]">Salvando</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={12} className="text-slate-400 font-bold" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Salvo</span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="p-2 text-slate-500 hover:text-[#32a800] active:bg-slate-50 rounded-lg transition-all"
                            >
                                <Share size={20} />
                            </button>
                            <button
                                className="p-2 text-slate-500 active:text-[#32a800] active:bg-slate-50 rounded-lg transition-all"
                                onClick={() => setShowMobilePreview(!showMobilePreview)}
                            >
                                {showMobilePreview ? <X size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Sidebar (Drawer) */}
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-50 md:hidden flex">
                            <div className="w-64 h-full bg-white shadow-xl rounded-tr-[24px] overflow-hidden">
                                <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }} userProfile={profile} onUpgradeClick={() => { setIsBillingModalOpen(true); setIsMobileMenuOpen(false); }} className="flex h-full" />
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
                    <div className={`flex-1 h-full overflow-y-auto scrollbar-hide ${showMobilePreview ? 'hidden lg:block' : 'block'}`}>

                        {/* Desktop Header (Sticky) */}
                        <header className={`hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-20 ${profile.planType === 'free' ? 'rounded-tr-[24px] md:rounded-tr-[32px]' : ''
                            }`}>
                            <div className="flex items-center gap-2">
                                {!isSidebarOpen && (
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                                        title="Abrir Menu"
                                    >
                                        <ChevronsRight size={20} />
                                    </button>
                                )}
                                {/* Breadcrumb or Title */}
                                <h1 className="text-xl font-bold text-slate-800">Editor</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 border border-transparent mr-2 shrink-0 whitespace-nowrap">
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin text-[#32a800]" />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#32a800]">Sincronizando</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Alterações Salvas</span>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    title="Compartilhar"
                                    className="p-2 text-slate-500 hover:text-[#32a800] hover:bg-slate-50 rounded-lg transition-all active:scale-95"
                                >
                                    <Share size={20} />
                                </button>
                                <a
                                    href={shareUrl}
                                    target="_blank"
                                    title="Abrir Link Público"
                                    className="p-2 text-slate-500 hover:text-[#32a800] hover:bg-slate-50 rounded-lg transition-all active:scale-95"
                                >
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                        </header>
                        <div className="w-full py-6 md:py-10 px-4 md:px-10 lg:px-12 pb-32">

                            {/* Page Title */}
                            <div className="mb-4 md:mb-8">
                                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                                    {activeTab === 'links' && 'Links'}
                                    {activeTab === 'appearance' && 'Design'}
                                    {activeTab === 'shop' && 'Loja'}
                                    {activeTab === 'support' && 'Suporte'}
                                    {activeTab === 'files' && 'Arquivos'}
                                    {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab !== 'earn' && activeTab !== 'support' && activeTab !== 'files' && activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                </h1>
                                <p className="text-slate-500 mt-2 text-base">
                                    {activeTab === 'links' && 'Gerencie seus links e informações do perfil.'}
                                    {activeTab === 'appearance' && 'Personalize as cores e o tema do seu Nodus.'}
                                    {activeTab === 'shop' && 'Gerencie os produtos da sua vitrine.'}
                                    {activeTab === 'billing' && 'Gerencie sua assinatura, visualize recibos e detalhes de pagamento.'}
                                    {activeTab === 'support' && 'Entre em contato com nossa equipe para resolver dúvidas.'}
                                    {activeTab === 'files' && 'Hospede arquivos e documentos para usar no seu perfil.'}

                                </p>
                            </div>





                            {/* Dynamic Content */}
                            <div className="animate-fade-in">
                                {activeTab === 'links' && (
                                    <div className="space-y-6">

                                        <SocialLinksEditor links={links} onChange={setLinks} />
                                        <LinkEditor
                                            links={links}
                                            onChange={setLinks}
                                            profile={profile}
                                            expandedLinks={expandedLinks}
                                            setExpandedLinks={setExpandedLinks}
                                            expandedCollections={expandedCollections}
                                            setExpandedCollections={setExpandedCollections}
                                        />
                                    </div>
                                )}

                                {activeTab === 'shop' && (
                                    <div className="space-y-6">
                                        <ShopEditor products={products} onChange={setProducts} />
                                    </div>
                                )}

                                {activeTab === 'analytics' && (
                                    <AnalyticsView userProfile={profile} />
                                )}


                                {activeTab === 'earn' && (
                                    <MonetizationView profile={profile} onChange={setProfile} />
                                )}

                                {activeTab === 'billing' && (
                                    <ManageBillingView profile={profile} />
                                )}

                                {activeTab === 'support' && (
                                    <SupportView />
                                )}

                                {activeTab === 'files' && (
                                    <FileManager />
                                )}




                                {activeTab === 'appearance' && (
                                    <div className="flex flex-col -mt-4 md:-mt-6 -mx-6 lg:-mx-12 bg-slate-50 relative min-h-[calc(100vh-140px)]">
                                        {/* Design Sidebar */}
                                        <div className="shrink-0 z-10 sticky top-0 bg-slate-50">
                                            <DesignSidebar
                                                activeSection={activeDesignSection}
                                                setActiveSection={setActiveDesignSection}
                                            />
                                        </div>

                                        {/* Design Content Area */}
                                        <div className="flex-1 p-4 md:p-8 pb-32 md:pb-8">
                                            <h2 className="text-2xl font-bold text-slate-800 mb-6 hidden md:block">
                                                {activeDesignSection === 'header' && 'Cabeçalho'}
                                                {activeDesignSection === 'theme' && 'Temas'}
                                                {activeDesignSection === 'buttons' && 'Botões'}
                                                {activeDesignSection === 'wallpaper' && 'Papel de Parede'}
                                                {activeDesignSection === 'text' && 'Tipografia'}
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

                                            {activeDesignSection === 'buttons' && (
                                                <ButtonsEditor profile={profile} updateProfile={updateProfile} />
                                            )}

                                            {activeDesignSection === 'text' && (
                                                <TypographyEditor profile={profile} onChange={setProfile} />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab !== 'analytics' && activeTab !== 'settings' && activeTab !== 'earn' && activeTab !== 'billing' && activeTab !== 'support' && activeTab !== 'files' && activeTab !== 'integrations' && (
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
            w-full lg:w-[350px] xl:w-[450px] shrink-0
            ${!showMobilePreview ? 'hidden' : 'fixed inset-0 top-[60px] md:top-[64px] z-40 lg:relative lg:inset-auto lg:top-0 lg:flex lg:h-screen lg:sticky lg:right-0'}
        `}>

                        <div className="relative w-full h-full lg:flex items-center justify-center overflow-hidden lg:bg-[#FAFBFC] lg:bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                            {/* Scale container to fit phone nicely on different laptop screens - Only on Desktop */}
                            <div className={`
              w-full h-full transform transition-transform duration-300 origin-center flex items-center justify-center
            `}>
                                <Preview
                                    profile={profile}
                                    links={links}
                                    products={products}
                                    onShare={() => setIsShareModalOpen(true)}
                                    forcedTab={activeTab === 'shop' ? 'shop' : 'links'}
                                />
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
