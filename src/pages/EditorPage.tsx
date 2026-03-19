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
import { Plus, Trash2, GripVertical, Image as ImageIcon, Layout, Palette, Type, MousePointer2, Smartphone, Monitor, Share, Eye, X, Check, Save, Loader2, PlusCircle, Search, List, MessageCircle, HelpCircle, Construction, Mail, ChevronsRight, Zap, ExternalLink, Menu, Globe, ChevronRight, AlertTriangle } from 'lucide-react';
import SocialLinksEditor from '../components/SocialLinksEditor';
import AnalyticsView from '../components/AnalyticsView';
import MonetizationView from '../components/MonetizationView';
import SupportView from '../components/SupportView';
import ManageBillingView from '../components/ManageBillingView';
import AdminView from '../components/AdminView';
import BlogAdminView from '../components/BlogAdminView';
import BillingView from '../components/BillingView';
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
import { hasProFeatures } from '../utils/planUtils';
import { AlertCircle } from 'lucide-react';

export default function EditorPage() {
    const { profile: authProfile, loading: authLoading } = useAuth();
    const { t } = useTranslation();

    // Initialize state from localStorage (SNAPSHOT) to avoid placeholder flash
    // Profile state - starts null, loaded from API
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        bio: '',
        avatarUrl: '',
        themeId: 'brutalist-bauhaus',
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
                    }).catch(() => { /* Silent fail */ });
                }

                // Data loaded successfully
                setLoadingProgress(100);
                setHasLoadedOnce(true);

                // Small delay to show completion before hiding
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
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
    const [isPreviewMode, setIsPreviewMode] = React.useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = React.useState(false);
    const [pendingTab, setPendingTab] = React.useState<string | null>(null);

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
        if (currentProfileString === lastSavedProfile.current) {
            setIsPreviewMode(false);
            return;
        }

        // --- PRO PREVIEW CHECK ---
        const isFree = !profile.planType || profile.planType === 'free';
        if (isFree && hasProFeatures(profile)) {
            setIsPreviewMode(true);
            return;
        }

        setIsPreviewMode(false);

        const saveProfile = async () => {
            setIsSavingProfile(true);
            try {
                const response = await apiClient.updateProfile(profile);
                lastSavedProfile.current = JSON.stringify(profile);

                // Sync any backend updates (like business logic timestamps)
                if (response.usernameUpdatedAt && response.usernameUpdatedAt !== profile.usernameUpdatedAt) {
                    setProfile(prev => ({ ...prev, usernameUpdatedAt: response.usernameUpdatedAt }));
                }
            } catch (error: any) {
                // If it's a validation error (like the 7-day rule), we should probably alert the user 
                // and revert the local state to the last known good state
                if (error.message && (error.message.includes('7 dias') || error.message.includes('usuário'))) {
                    alert(error.message);
                    const lastGoodProfile = JSON.parse(lastSavedProfile.current);
                    setProfile(lastGoodProfile);
                }
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
                // Silently handle link auto-save failure
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
                // Silently handle product auto-save failure
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
        const handleOpenBilling = () => setIsUpgradeOpen(true);
        window.addEventListener('open-billing-modal', handleOpenBilling);
        document.title = 'Nodus admin';
        return () => window.removeEventListener('open-billing-modal', handleOpenBilling);
    }, []);

    // 'links' or 'appearance' are the main functional tabs
    const [activeTab, setActiveTabState] = useState<string>(() => {
        return localStorage.getItem('nodus_editor_active_tab') || 'links';
    });

    const handleTabChange = (newTab: string) => {
        if (isPreviewMode && activeTab === 'appearance' && newTab !== 'appearance') {
            setPendingTab(newTab);
            setIsDiscardModalOpen(true);
            return;
        }
        setActiveTabState(newTab);
    };

    // Keep the name setActiveTab for props compatibility
    const setActiveTab = handleTabChange;

    // Persist activeTab to localStorage
    React.useEffect(() => {
        localStorage.setItem('nodus_editor_active_tab', activeTab);
    }, [activeTab]);

    const handleDiscardChanges = () => {
        if (lastSavedProfile.current) {
            const lastGood = JSON.parse(lastSavedProfile.current);
            setProfile(lastGood);
            setIsPreviewMode(false);
            if (pendingTab) {
                setActiveTabState(pendingTab);
                setPendingTab(null);
            }
        }
        setIsDiscardModalOpen(false);
    };

    const handleUpgradeToSave = () => {
        setIsDiscardModalOpen(false);
        setIsUpgradeOpen(true);
    };

    // Mobile drawer state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    // Design Sidebar State
    const [activeDesignSection, setActiveDesignSection] = useState('header');

    // Sidebar Toggle State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const shareUrl = `https://www.nodus.my/${profile.username || profile.name.toLowerCase().replace(/\s/g, '')}`;

    return (
        <div className="h-screen w-full bg-white font-sans text-black selection:bg-black selection:text-[#ffdf00] flex flex-col overflow-hidden">
            {/* Quests Checklist moved to Sidebar component */}
            {/* Top Banner for Free Users */}
            {(!profile.planType || profile.planType === 'free') && (
                <UpgradeBanner onUpgradeClick={() => setIsUpgradeOpen(true)} />
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
                        onUpgradeClick={() => setIsUpgradeOpen(true)}
                        onClose={() => setIsSidebarOpen(false)}
                        className={`hidden md:flex h-full ${(!profile.planType || profile.planType === 'free') ? 'rounded-tl-[24px] md:rounded-tl-[32px]' : ''
                            }`}
                    />
                )}

                {/* Main Layout */}
                <main className="flex-1 flex flex-col md:flex-row min-w-0 h-full relative transition-all duration-300">

                    {/* Mobile Header */}
                    <div className={`md:hidden bg-white border-b-2 border-[#1a1a1a] px-4 py-4 flex items-center justify-between shrink-0 z-[60] shadow-sm relative`}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <Menu size={24} className="text-black" />
                            </button>
                            <h1 className="font-medium uppercase tracking-tight text-xl text-black">Nodus</h1>
                        </div>
                        <div className="flex gap-2 items-center">
                            {/* Sync Status - Brutalist */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a1a1a] bg-white shadow-[0_2px_0_0_#1a1a1a]">
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
                                className="w-9 h-9 flex items-center justify-center bg-white border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-none transition-all text-black"
                            >
                                <Share size={18} strokeWidth={2.5} />
                            </button>

                            {/* Preview Button - Brutalist */}
                            <button
                                className="w-9 h-9 flex items-center justify-center bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a]  border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-none transition-all"
                                onClick={() => setShowMobilePreview(!showMobilePreview)}
                            >
                                {showMobilePreview ? <X size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Sidebar (Drawer) */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <div className="fixed inset-0 z-[100] md:hidden flex">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/80 md:bg-black/60 md:backdrop-blur-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                />
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="relative w-72 h-full bg-white border-r-4 border-[#1a1a1a] flex flex-col overflow-hidden"
                                >
                                    <Sidebar
                                        activeTab={activeTab}
                                        setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }}
                                        userProfile={profile}
                                        onUpgradeClick={() => { setIsUpgradeOpen(true); setIsMobileMenuOpen(false); }}
                                        className="flex-1 overflow-y-auto"
                                    />
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
                        <header className={`hidden md:flex items-center justify-between px-8 py-3 bg-white border-b-2 border-[#1a1a1a] sticky top-0 z-20`}>
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
                            <div className="flex items-center gap-4">                                {isPreviewMode ? (
                                    <div className="flex items-center gap-2 h-9 px-4 bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl shrink-0">
                                        <Eye size={14} className="text-[#1a1a1a]" strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Modo Preview</span>
                                    </div>
                                ) : (isSaving || visualSavingProfile) ? (
                                    <div className="flex items-center gap-2 h-9 px-4 bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl shrink-0 transition-all">
                                        <Loader2 size={14} className="animate-spin text-[#1a1a1a]" strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">{t('editor.syncing')}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 h-9 px-4 bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl shrink-0 transition-all">
                                        <div className="w-2.5 h-2.5 bg-[#97cd7a] border-2 border-[#1a1a1a]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">{t('editor.synced')}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="h-9 px-4 flex items-center gap-2 bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[3px] active:shadow-none transition-all text-[#1a1a1a] group"
                                        title={t('editor.share')}
                                    >
                                        <Share size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">{t('editor.share')}</span>
                                    </button>
                                    <a
                                        href={shareUrl}
                                        target="_blank"
                                        className="h-9 px-4 flex items-center gap-2 bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[3px] active:shadow-none transition-all group text-[#1a1a1a]"
                                        title={t('editor.openPublicLink')}
                                    >
                                        <ExternalLink size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">{t('editor.viewProfile')}</span>
                                    </a>
                                </div>


                            </div>
                        </header>
                        <div className="w-full py-4 md:py-6 px-4 md:px-6 pb-24">

                            {/* Page Title - Brutalist Design */}
                            {activeTab !== 'admin' && activeTab !== 'blog' && activeTab !== 'support' && activeTab !== 'billing' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-[#1a1a1a] pb-8 w-full mb-12 px-2 md:px-6"
                                >
                                    <div className="relative ml-4 md:ml-6">
                                        <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-2.5 h-10 bg-[#ffdf00] border-2 border-[#1a1a1a]" />
                                        <h1 className="text-4xl font-black text-black uppercase tracking-tighter leading-none italic">
                                            {activeTab === 'links' && t('editor.tabs.links')}
                                            {activeTab === 'appearance' && t('editor.tabs.appearance')}
                                            {activeTab === 'shop' && t('editor.tabs.shop')}
                                            {activeTab === 'analytics' && t('editor.tabs.analytics')}
                                            {activeTab === 'earn' && t('editor.tabs.earn')}
                                            {activeTab === 'files' && t('editor.tabs.files')}
                                            {activeTab === 'integrations' && t('editor.tabs.integrations')}
                                            {activeTab === 'blog' && t('editor.tabs.blog')}
                                            {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab !== 'analytics' && activeTab !== 'earn' && activeTab !== 'files' && activeTab !== 'integrations' && activeTab !== 'blog' && activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                        </h1>
                                        <p className="text-[10px] text-black/40 font-black uppercase tracking-[0.3em] mt-3 ml-1">
                                            {activeTab === 'links' && t('editor.tabDesc.links')}
                                            {activeTab === 'appearance' && t('editor.tabDesc.appearance')}
                                            {activeTab === 'shop' && t('editor.tabDesc.shop')}
                                            {activeTab === 'analytics' && t('editor.tabDesc.analytics')}
                                            {activeTab === 'earn' && t('editor.tabDesc.earn')}
                                            {activeTab === 'files' && t('editor.tabDesc.files')}
                                            {activeTab === 'integrations' && t('editor.tabDesc.integrations')}
                                            {activeTab === 'blog' && t('editor.tabDesc.blog')}
                                        </p>
                                    </div>
                                </motion.div>
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
                                            setProfile={setProfile}
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
                                    <IntegrationsView profile={profile} onChange={setProfile} links={links} onLinksChange={setLinks} />
                                )}

                                {activeTab === 'admin' && (profile.username === 'nodus' || authProfile?.email === 'jaoomarcos75@gmail.com') && (
                                    <AdminView />
                                )}

                                {activeTab === 'blog' && (profile.username === 'nodus' || authProfile?.email === 'jaoomarcos75@gmail.com') && (
                                    <BlogAdminView />
                                )}





                                {activeTab === 'appearance' && (
                                    <div className="flex flex-col md:-mt-6 -mx-6 lg:-mx-12 bg-slate-50 relative min-h-[calc(100vh-140px)]">
                                        {/* Design Sidebar */}
                                        <div className="shrink-0 z-[50] sticky top-0 bg-white shadow-sm md:shadow-none">
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
            lg:border-l-4 lg:border-[#1a1a1a] lg:bg-white 
            w-full lg:w-[350px] xl:w-[450px] shrink-0
            ${!showMobilePreview ? 'hidden' : 'flex-1 h-full flex flex-col z-40 overflow-hidden lg:relative lg:inset-auto lg:top-0 lg:flex lg:h-full lg:sticky lg:right-0 bg-white md:bg-transparent'}
        `}>

                        <div className="relative w-full h-full lg:flex items-center justify-center overflow-y-auto bg-white lg:bg-[#f8f9fa]">
                            {/* Scale container to fit phone nicely on different laptop screens - Only on Desktop */}
                            <div className={`
                               w-full min-h-full lg:py-12 transform transition-transform duration-300 origin-center flex items-center justify-center relative z-10
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

                {/* Billing Modal Overlay */}
                <AnimatePresence>
                    {isUpgradeOpen && (
                        <BillingModal
                            profile={profile}
                            onChange={updateProfile}
                            onClose={() => setIsUpgradeOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* PRO Changes Detection Modal */}
                <AnimatePresence>
                    {isDiscardModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/90 md:bg-black/80 md:backdrop-blur-md pointer-events-auto"
                                onClick={() => setIsDiscardModalOpen(false)}
                            />
                            <motion.div
                                initial={{ y: '100%', opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: '100%', opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="relative w-full md:max-w-md bg-white border-t-4 border-x-4 md:border-b-4 border-[#1a1a1a] p-8 shadow-none md:shadow-[0_12px_0_0_#1a1a1a] rounded-t-[32px] md:rounded-[32px] pointer-events-auto"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-[#ffdf00] border-4 border-[#1a1a1a] flex items-center justify-center mb-6 shadow-[0_4px_0_0_#1a1a1a]">
                                        <AlertTriangle size={40} className="text-black fill-black" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-black mb-4">
                                        Detectamos Recursos PRO!
                                    </h2>
                                    <p className="text-sm font-bold text-black/60 uppercase tracking-widest leading-relaxed mb-8">
                                        Você está usando temas ou estilos premium. Para manter estas alterações no seu perfil público, você precisa migrar para o plano PRO.
                                    </p>

                                    <div className="grid grid-cols-1 w-full gap-4">
                                        <button
                                            onClick={handleUpgradeToSave}
                                            className="w-full py-4 bg-[#97cd7a] border-4 border-[#1a1a1a] text-black font-black text-xs uppercase tracking-[0.2em] shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] transition-all flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            <Check size={20} strokeWidth={4} />
                                            Fazer Upgrade e Salvar
                                        </button>
                                        <button
                                            onClick={handleDiscardChanges}
                                            className="w-full py-4 bg-white border-4 border-[#1a1a1a] text-black font-black text-xs uppercase tracking-[0.2em] shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] transition-all flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            <X size={20} strokeWidth={4} />
                                            Descartar e Continuar
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsDiscardModalOpen(false)}
                                        className="mt-6 text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors"
                                    >
                                        Voltar e Continuar Editando
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
