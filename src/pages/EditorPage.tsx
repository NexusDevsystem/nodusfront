import React, { useState } from 'react';
import { UserProfile, LinkItem, Product, PaymentMethod } from '../types';
import { THEMES, FONTS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSelector from '../components/ThemeSelector';
import BrutalistLoader from '../components/BrutalistLoader';
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
import AdminView from '../components/AdminView';
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
import { IntegrationsView } from '../views/IntegrationsView';
import { useTranslation } from 'react-i18next';

export default function EditorPage() {
    const { profile: authProfile, loading: authLoading } = useAuth();
    const { t } = useTranslation();

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
            if (!hasLoadedOnce) {
                setIsLoading(true);
                setLoadingProgress(10); // Auth is loading
            }
            return;
        }

        if (!authProfile) {
            setIsLoading(false);
            return;
        }

        setLoadingProgress(20); // Auth complete, starting data fetch

        const loadData = async () => {
            try {
                // Load all items in a single bootstrap call for maximum efficiency
                setLoadingProgress(30);
                const { profile: profileData, links: linksDataRaw, products: productsDataRaw } = await apiClient.getBootstrapData();

                setLoadingProgress(80);

                // Helper to assign clientIds recursively
                const withClientIds = (items: any[]): any[] => items.map(item => ({
                    ...item,
                    clientId: item.clientId || crypto.randomUUID(),
                    children: item.children ? withClientIds(item.children) : undefined
                }));

                const linksData = withClientIds(linksDataRaw).map(l => {
                    // Proactive tagging for legacy collections to ensure they don't lose identity on name change
                    if (l.type === 'collection' && l.title === 'Posts do Instagram' && !l.platform) {
                        return { ...l, platform: 'instagram' };
                    }
                    return l;
                });
                const productsData = withClientIds(productsDataRaw);

                setProfile(profileData);
                setLinks(linksData);
                setProducts(productsData);

                // --- AUTOMATIC PAYMENT RECONCILIATION ---
                // Trigger silently in background
                if (profileData.planType === 'free' || !profileData.planType) {
                    apiClient.autoReconcile().then(reconciledProfile => {
                        if (reconciledProfile.planType && reconciledProfile.planType !== 'free') {
                            setProfile(prev => ({ ...prev, ...reconciledProfile }));
                        }
                    }).catch(err => console.error('Silent reconcile failed:', err));
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

    // Keep saving states active for at least 500ms for visual feedback
    const [visualSavingProfile, setVisualSavingProfile] = React.useState(false);
    React.useEffect(() => {
        if (isSavingProfile) {
            setVisualSavingProfile(true);
        } else {
            const timer = setTimeout(() => setVisualSavingProfile(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isSavingProfile]);

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

        console.log('🔄 [EditorPage] Profile change detected, scheduling auto-save...');

        const saveProfile = async () => {
            console.log('💾 [EditorPage] Executing auto-save for profile:', {
                headerLayout: profile.headerLayout,
                id: profile.id
            });
            setIsSavingProfile(true);
            try {
                const response = await apiClient.updateProfile(profile);
                console.log('✅ [EditorPage] Auto-save profile success:', response);
                lastSavedProfile.current = JSON.stringify(profile);
                // Sync any backend updates (like business logic timestamps)
                if (response.usernameUpdatedAt && response.usernameUpdatedAt !== profile.usernameUpdatedAt) {
                    setProfile(prev => ({ ...prev, usernameUpdatedAt: response.usernameUpdatedAt }));
                }
            } catch (error: any) {
                console.error('❌ [EditorPage] Auto-save profile failed:', error);

                // If it's a validation error (like the 7-day rule), we should probably alert the user 
                // and revert the local state to the last known good state
                if (error.message && (error.message.includes('7 dias') || error.message.includes('usuário'))) {
                    alert(error.message);
                    const lastGoodProfile = JSON.parse(lastSavedProfile.current);
                    setProfile(lastGoodProfile);
                }

                if (error.response) console.error('Response details:', error.response.data);
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

    const [pendingShopCollection, setPendingShopCollection] = useState<string | null>(null);

    const addProductToShop = (collectionName: string) => {
        // Instead of adding a placeholder, we set the pending collection
        // ShopEditor will pick this up and open the "Add Product" form
        setPendingShopCollection(collectionName);
        setActiveTab('shop');
    };

    const handleAddIncentive = (type: 'pix' | 'paypal', key: string) => {
        const newMethod: PaymentMethod = {
            id: Date.now().toString(),
            type,
            key,
            label: type === 'pix' ? 'Meu Pix Principal' : 'Meu PayPal',
            isActive: true
        };

        setProfile(prev => ({
            ...prev,
            paymentMethods: [newMethod, ...(prev.paymentMethods || [])]
        }));
        setActiveTab('earn');
    };

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

    const shareUrl = `https://www.nodus.my/${profile.username || profile.name.toLowerCase().replace(/\s/g, '')}`;

    return (
        <div className="h-screen w-full bg-white font-sans text-black selection:bg-black selection:text-[#ffdf00] flex flex-col overflow-hidden">
            {/* Top Banner for Free Users */}
            {(!profile.planType || profile.planType === 'free') && (
                <UpgradeBanner onUpgradeClick={() => setIsBillingModalOpen(true)} />
            )}

            <div className={`flex-1 flex overflow-hidden relative bg-white`}>
                {/* Loading Overlay - Brutalist Version */}
                {isLoading && (
                    <BrutalistLoader
                        message={loadingProgress < 30 ? t('loading.authenticating') :
                            loadingProgress < 50 ? t('loading.loadingProfile') :
                                loadingProgress < 70 ? t('loading.syncingLinks') :
                                    loadingProgress < 90 ? t('loading.organizingProducts') :
                                        t('loading.finishing')}
                        progress={loadingProgress}
                    />
                )}
                {/* Error State - Non-intrusive Banner */}
                {loadError && (
                    <div className="absolute top-0 left-0 w-full bg-red-50 border-b border-red-200 z-[100] px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-700 text-sm">
                            <Construction size={16} />
                            <span className="font-medium">{t('editor.syncError')}</span>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-normal hover:bg-red-700 transition-colors"
                        >
                            {t('editor.reload')}
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
                        className={`hidden md:flex h-full ${(!profile.planType || profile.planType === 'free') ? 'rounded-tl-[24px] md:rounded-tl-[32px]' : ''
                            }`}
                    />
                )}

                {/* Main Layout */}
                <main className="flex-1 flex flex-col md:flex-row min-w-0 h-full relative transition-all duration-300">

                    {/* Mobile Header */}
                    <div className={`md:hidden bg-white border-b-2 border-black px-4 py-4 flex items-center justify-between shrink-0 z-[45] shadow-sm`}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <Menu size={24} className="text-black" />
                            </button>
                            <h1 className="font-medium uppercase tracking-tight text-xl text-black">Nodus</h1>
                        </div>
                        <div className="flex gap-2 items-center">
                            {/* Sync Status - Brutalist */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {(isSaving || visualSavingProfile) ? (
                                    <>
                                        <Loader2 size={10} className="animate-spin text-black" strokeWidth={3} />
                                        <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black">Sync</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={10} className="text-[#97cd7a]" strokeWidth={4} />
                                        <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black">{t('editor.saved')}</span>
                                    </>
                                )}
                            </div>

                            {/* Share Button - Brutalist */}
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="w-9 h-9 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-black"
                            >
                                <Share size={18} strokeWidth={2.5} />
                            </button>

                            {/* Preview Button - Brutalist */}
                            <button
                                className="w-9 h-9 flex items-center justify-center bg-black text-[#97cd7a] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                onClick={() => setShowMobilePreview(!showMobilePreview)}
                            >
                                {showMobilePreview ? <X size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Sidebar (Drawer) */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <div className="fixed inset-0 z-50 md:hidden flex">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                />
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="relative w-72 h-full bg-white border-r-4 border-black flex flex-col overflow-hidden"
                                >
                                    <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }} userProfile={profile} onUpgradeClick={() => { setIsBillingModalOpen(true); setIsMobileMenuOpen(false); }} className="flex-1 overflow-y-auto" />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* 
           --------------------------------------------------
           COLUMN 1: EDITOR AREA 
           Scrollable, Grey Background, Centered Content
           --------------------------------------------------
        */}
                    <div className={`flex-1 h-full overflow-y-auto scrollbar-hide ${showMobilePreview ? 'hidden lg:block' : 'block'}`}>

                        {/* Desktop Header (Sticky) */}
                        <header className={`hidden md:flex items-center justify-between px-8 py-3 bg-white border-b-2 border-black sticky top-0 z-20`}>
                            <div className="flex items-center gap-2">
                                {!isSidebarOpen && (
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="p-1.5 -ml-1 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                                        title="Abrir Menu"
                                    >
                                        <ChevronsRight size={20} />
                                    </button>
                                )}
                                {/* Breadcrumb or Title */}
                                <h1 className="text-base font-medium uppercase tracking-widest text-black">Editor</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all">
                                    {(isSaving || visualSavingProfile) ? (
                                        <>
                                            <Loader2 size={10} className="animate-spin text-black" strokeWidth={3} />
                                            <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black">{t('editor.syncing')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-1.5 h-1.5 bg-[#97cd7a] border border-black" />
                                            <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black">{t('editor.synced')}</span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="w-9 h-9 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-black"
                                        title="Compartilhar"
                                    >
                                        <Share size={18} strokeWidth={2.5} />
                                    </button>
                                    <a
                                        href={shareUrl}
                                        target="_blank"
                                        className="w-9 h-9 flex items-center justify-center bg-black text-[#97cd7a] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                                        title="Abrir Link Público"
                                    >
                                        <ExternalLink size={18} strokeWidth={2.5} />
                                    </a>
                                </div>
                            </div>
                        </header>
                        <div className="w-full py-4 md:py-6 px-4 md:px-6 pb-24">

                            {/* Page Title - Brutalist Design */}
                            {activeTab !== 'admin' && activeTab !== 'support' && (
                                <div className="mb-8 border-l-4 border-black pl-6 py-2 relative">
                                    <div className="absolute -left-[4px] top-0 bottom-0 w-[4px] bg-[#97cd7a]"></div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 bg-black text-[#97cd7a] text-[8px] font-medium uppercase tracking-[0.2em]">
                                            Nodus System
                                        </div>
                                        {(!profile?.planType || profile.planType === 'free') && (
                                            <div className="px-2 py-0.5 bg-[#ffdf00] border border-black text-black text-[8px] font-medium uppercase tracking-[0.2em]">
                                                {t('editor.freePlan')}
                                            </div>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-medium uppercase text-black tracking-tighter leading-none mb-1">
                                        {activeTab === 'links' && t('editor.tabs.links')}
                                        {activeTab === 'appearance' && t('editor.tabs.appearance')}
                                        {activeTab === 'shop' && t('editor.tabs.shop')}
                                        {activeTab === 'analytics' && t('editor.tabs.analytics')}
                                        {activeTab === 'earn' && t('editor.tabs.earn')}
                                        {activeTab === 'files' && t('editor.tabs.files')}
                                        {activeTab === 'billing' && t('editor.tabs.billing')}
                                        {activeTab === 'integrations' && t('editor.tabs.integrations')}
                                        {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab !== 'analytics' && activeTab !== 'earn' && activeTab !== 'support' && activeTab !== 'files' && activeTab !== 'billing' && activeTab !== 'integrations' && activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                    </h1>
                                    <p className="text-black/50 font-normal text-[10px] md:text-xs uppercase tracking-widest max-w-lg">
                                        {activeTab === 'links' && t('editor.tabDesc.links')}
                                        {activeTab === 'appearance' && t('editor.tabDesc.appearance')}
                                        {activeTab === 'shop' && t('editor.tabDesc.shop')}
                                        {activeTab === 'analytics' && t('editor.tabDesc.analytics')}
                                        {activeTab === 'earn' && t('editor.tabDesc.earn')}
                                        {activeTab === 'files' && t('editor.tabDesc.files')}
                                        {activeTab === 'billing' && t('editor.tabDesc.billing')}
                                        {activeTab === 'integrations' && t('editor.tabDesc.integrations')}
                                    </p>
                                    <div className="mt-4 w-full h-[1px] bg-black/10"></div>
                                </div>
                            )}





                            {/* Dynamic Content */}
                            <div className="animate-fade-in">
                                {activeTab === 'links' && (
                                    <div className="space-y-6">

                                        <SocialLinksEditor links={links} onChange={setLinks} profile={profile} setProfile={setProfile} />
                                        <LinkEditor
                                            links={links}
                                            onChange={setLinks}
                                            profile={profile}
                                            setActiveTab={setActiveTab}
                                            onAddProduct={addProductToShop}
                                            onAddIncentive={handleAddIncentive}
                                            expandedLinks={expandedLinks}
                                            setExpandedLinks={setExpandedLinks}
                                            expandedCollections={expandedCollections}
                                            setExpandedCollections={setExpandedCollections}
                                        />
                                    </div>
                                )}

                                {activeTab === 'shop' && (
                                    <div className="space-y-6">
                                        <ShopEditor
                                            products={products}
                                            onChange={setProducts}
                                            userProfile={profile}
                                            pendingCollection={pendingShopCollection}
                                            onPendingCollectionConsumed={() => setPendingShopCollection(null)}
                                        />
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
                                    <SupportView userProfile={profile} />
                                )}

                                {activeTab === 'files' && (
                                    <FileManager userProfile={profile} />
                                )}

                                {activeTab === 'integrations' && (
                                    <IntegrationsView profile={profile} onChange={setProfile} />
                                )}

                                {activeTab === 'admin' && (profile.username === 'nodus' || authProfile?.email === 'jaoomarcos75@gmail.com') && (
                                    <AdminView />
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
                                            <h2 className="text-2xl font-normal text-slate-800 mb-6 hidden md:block">
                                                {activeDesignSection === 'header' && t('design.header')}
                                                {activeDesignSection === 'theme' && t('design.themes')}
                                                {activeDesignSection === 'buttons' && t('design.buttons')}
                                                {activeDesignSection === 'wallpaper' && t('design.wallpaper')}
                                                {activeDesignSection === 'text' && t('design.typography')}
                                            </h2>

                                            {activeDesignSection === 'header' && (
                                                <HeaderEditor profile={profile} onChange={setProfile} updateProfile={updateProfile} />
                                            )}

                                            {activeDesignSection === 'theme' && (
                                                <ThemeSelector profile={profile} links={links} products={products} onChange={setProfile} />
                                            )}

                                            {activeDesignSection === 'wallpaper' && (
                                                <WallpaperEditor profile={profile} onChange={setProfile} updateProfile={updateProfile} />
                                            )}

                                            {activeDesignSection === 'buttons' && (
                                                <ButtonsEditor profile={profile} updateProfile={updateProfile} />
                                            )}

                                            {activeDesignSection === 'text' && (
                                                <TypographyEditor profile={profile} onChange={setProfile} updateProfile={updateProfile} />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab !== 'analytics' && activeTab !== 'settings' && activeTab !== 'earn' && activeTab !== 'billing' && activeTab !== 'support' && activeTab !== 'files' && activeTab !== 'integrations' && activeTab !== 'admin' && (
                                    <div className="bg-white p-12 rounded-[20px] border border-dashed border-slate-300 text-center">
                                        <div className="text-4xl mb-4 text-slate-300 flex justify-center"><Construction size={48} /></div>
                                        <h3 className="text-lg font-medium text-slate-700">{t('editor.inDevelopment')}</h3>
                                        <p className="text-slate-500 mt-2">{t('editor.inDevelopmentDesc')}</p>
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
            ${activeTab !== 'admin' ? 'lg:flex' : 'hidden'} flex-col items-center justify-center 
            lg:border-l-4 lg:border-black lg:bg-white 
            w-full lg:w-[350px] xl:w-[450px] shrink-0
            ${!showMobilePreview ? 'hidden' : 'flex-1 z-40 overflow-hidden lg:relative lg:inset-auto lg:top-0 lg:flex lg:h-full lg:sticky lg:right-0 bg-white md:bg-transparent'}
        `}>

                        <div className="relative w-full h-full lg:flex items-center justify-center overflow-y-auto bg-white lg:bg-slate-50">
                            {/* Dots Pattern - Only on Desktop */}
                            <div className="hidden lg:block absolute inset-0 opacity-20 pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '24px 24px' }}>
                            </div>

                            {/* Scale container to fit phone nicely on different laptop screens - Only on Desktop */}
                            <div className={`
                               w-full min-h-full transform transition-transform duration-300 origin-center flex items-center justify-center relative z-10
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

                        <div className="hidden lg:block absolute bottom-6 px-4 py-1.5 bg-black text-[#97cd7a] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-[8px] font-medium uppercase tracking-[0.3em]">
                            {t('editor.livePreview')}
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
