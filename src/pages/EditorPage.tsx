import React, { useState } from 'react';
import { UserProfile, LinkItem, Product, PaymentMethod, Store } from '../types';
import { THEMES, FONTS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSelector from '../components/ThemeSelector';
import BrutalistLoader from '../components/BrutalistLoader';
import LinkEditor from '../components/LinkEditor';
import ShopEditor from '../components/ShopEditor';
import Preview from '../components/Preview';
import Sidebar from '../components/Sidebar';
import OnboardingProgressCard from '../components/OnboardingProgressCard';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Layout, Palette, Type, MousePointer2, Smartphone, Monitor, Share, Eye, X, Check, Save, Loader2, PlusCircle, Search, List, MessageCircle, HelpCircle, Construction, Mail, ChevronsRight, Zap, ExternalLink, Menu, Globe, ChevronRight, AlertTriangle, LogOut } from 'lucide-react';
import SocialLinksEditor from '../components/SocialLinksEditor';
import AnalyticsView from '../components/AnalyticsView';
import MonetizationView from '../components/MonetizationView';
import SupportView from '../components/SupportView';
import ManageBillingView from '../components/ManageBillingView';
import AdminView from '../components/AdminView';
import BlogAdminView from '../components/BlogAdminView';
import RoadmapAdminView from '../components/admin/RoadmapAdminView';
import BillingView from '../components/BillingView';
import BillingModal from '../components/BillingModal';
import QRCodeModal from '../components/QRCodeModal';
import UpgradeBanner from '../components/UpgradeBanner';
import DesignSidebar from '../components/DesignSidebar';
import HeaderEditor from '../components/design/HeaderEditor';
import TypographyEditor from '../components/design/TypographyEditor';
import WallpaperEditor from '../components/design/WallpaperEditor';
import ButtonsEditor from '../components/design/ButtonsEditor';
import { compressImage, imgOptimized } from '../utils/imageUtils';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomSheet from '../components/MobileBottomSheet';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileExtrasMenu from '../components/MobileExtrasMenu';
import FileManager from '../components/tools/FileManager';
import { IntegrationsView } from '../views/IntegrationsView';
import { useTranslation } from 'react-i18next';
import { hasProFeatures, reconcileSubscription } from '../utils/planUtils';
import { AlertCircle } from 'lucide-react';
import AnnouncementModal from '../components/AnnouncementModal';

export default function EditorPage() {
    const { profile: authProfile, loading: authLoading, signOut } = useAuth();
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
    const deferredProfile = React.useDeferredValue(profile);

    const [links, setLinks] = useState<LinkItem[]>([]);
    const deferredLinks = React.useDeferredValue(links);

    const [products, setProducts] = useState<Product[]>([]);
    const deferredProducts = React.useDeferredValue(products);

    const [stores, setStores] = useState<Store[]>([]);
    const deferredStores = React.useDeferredValue(stores);

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
                const { profile: profileData, links: linksDataRaw, products: productsDataRaw, stores: storesDataRaw } = await apiClient.getBootstrapData();

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
                let finalProducts = withClientIds(productsDataRaw);
                let finalStores = withClientIds(storesDataRaw || []);

                const orphanedProducts = finalProducts.filter(p => !p.storeId);

                if (orphanedProducts.length > 0) {
                    let defaultStore = finalStores[0];
                    if (!defaultStore) {
                        defaultStore = {
                            id: crypto.randomUUID(),
                            clientId: crypto.randomUUID(),
                            name: 'Meus Produtos',
                            position: 0,
                            isActive: true
                        };
                        finalStores.push(defaultStore);
                    }

                    finalProducts = finalProducts.map(p =>
                        !p.storeId ? { ...p, storeId: defaultStore.id } : p
                    );
                }

                const { 
                    profile: finalProfile, 
                    stores: finalStoresWithSanitization, 
                    links: finalLinksWithSanitization 
                } = reconcileSubscription(profileData, finalStores, linksData);

                setProfile(finalProfile);
                setLinks(finalLinksWithSanitization);
                setProducts(finalProducts);
                setStores(finalStoresWithSanitization);


                // --- AUTOMATIC PAYMENT RECONCILIATION ---
                // Trigger silently in background
                if (profileData.plan_type === 'free' || !profileData.plan_type) {
                    apiClient.autoReconcile().then(reconciledProfile => {
                        if (reconciledProfile.plan_type && reconciledProfile.plan_type !== 'free') {
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
    const storesLoadHandled = React.useRef(false);

    // Track last saved state to prevent redundant requests
    const lastSavedLinks = React.useRef<string>('');
    const lastSavedProfile = React.useRef<string>('');
    const lastSavedProducts = React.useRef<string>('');
    const lastSavedStores = React.useRef<string>('');

    // Track saving states for each entity
    const [isSavingProfile, setIsSavingProfile] = React.useState(false);
    const [isSavingLinks, setIsSavingLinks] = React.useState(false);
    const [isSavingProducts, setIsSavingProducts] = React.useState(false);
    const [isSavingStores, setIsSavingStores] = React.useState(false);
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

    const isSaving = isSavingProfile || isSavingLinks || isSavingProducts || isSavingStores;

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
        const isFree = !profile.plan_type || profile.plan_type === 'free';
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
                console.error('❌ Failed to auto-save products:', error);
                // Silently handle product auto-save failure
            } finally {
                setIsSavingProducts(false);
            }
        };

        const timeoutId = setTimeout(saveProducts, 1000); // Shortened from 2500ms
        return () => clearTimeout(timeoutId);
    }, [products, hasLoadedOnce]);

    // --- AUTO-SAVE: STORES ---
    React.useEffect(() => {
        if (!hasLoadedOnce) return;

        if (!storesLoadHandled.current) {
            storesLoadHandled.current = true;
            lastSavedStores.current = JSON.stringify(stores);
            return;
        }

        const currentStoresString = JSON.stringify(stores);
        if (currentStoresString === lastSavedStores.current) return;

        const saveStores = async () => {
            setIsSavingStores(true);
            const storesSnapshot = stores;
            try {
                const savedStores = await apiClient.replaceAllStores(storesSnapshot);

                // Sync backend-generated IDs back to state
                setStores(currentStores => {
                    if (savedStores.length !== storesSnapshot.length) return currentStores;
                    const idMap = new Map<string, string>();
                    for (let i = 0; i < storesSnapshot.length; i++) {
                        if (storesSnapshot[i].id !== savedStores[i].id) {
                            idMap.set(storesSnapshot[i].id, savedStores[i].id);
                        }
                    }

                    if (idMap.size === 0) {
                        lastSavedStores.current = JSON.stringify(currentStores);
                        return currentStores;
                    }

                    const updatedStores = currentStores.map(s => ({
                        ...s,
                        id: idMap.get(s.id) || s.id
                    }));

                    lastSavedStores.current = JSON.stringify(updatedStores);
                    return updatedStores;
                });
            } catch (error) {
                console.error('❌ Failed to auto-save stores:', error);
                // Silently handle store auto-save failure
            } finally {
                setIsSavingStores(false);
            }
        };

        const timeoutId = setTimeout(saveStores, 1000); // Shortened from 2000ms
        return () => clearTimeout(timeoutId);
    }, [stores, hasLoadedOnce]);

    const [pendingShopCollection, setPendingShopCollection] = useState<string | null>(null);

    const addProductToShop = (collectionName: string) => {
        // Instead of adding a placeholder, we set the pending collection
        // ShopEditor will pick this up and open the "Add Product" form
        setPendingShopCollection(collectionName);
        setActiveTab('shop');
    };

    React.useEffect(() => {
        const handleOpenBilling = () => setIsUpgradeOpen(true);
        window.addEventListener('open-billing-modal', handleOpenBilling);
        document.title = 'Nodus editor';
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
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    // Design Sidebar State
    const [activeDesignSection, setActiveDesignSection] = useState('header');

    // Sidebar Toggle State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const shareUrl = `https://www.nodus.my/${profile.username || profile.name.toLowerCase().replace(/\s/g, '')}`;

    const renderEditorContent = () => (
        <>
            {activeTab === 'links' && (
                <div className="space-y-6">
                    <SocialLinksEditor links={links} onChange={setLinks} profile={profile} setProfile={setProfile} />
                    <LinkEditor
                        links={links}
                        onChange={setLinks}
                        profile={profile}
                        setActiveTab={setActiveTab}
                        onAddProduct={addProductToShop}
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
                        stores={stores}
                        onStoresChange={setStores}
                        userProfile={profile}
                        onProfileChange={updateProfile}
                        pendingCollection={pendingShopCollection}
                        onPendingCollectionConsumed={() => setPendingShopCollection(null)}
                    />
                </div>
            )}

            {activeTab === 'analytics' && (
                <AnalyticsView userProfile={profile} />
            )}

            {activeTab === 'billing' && (
                <ManageBillingView profile={profile} onChange={setProfile} links={links} />
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

            {activeTab === 'roadmap' && (
                <RoadmapAdminView view="kanban-admin" />
            )}

            {activeTab === 'extras' && (
                <MobileExtrasMenu 
                    onSelect={(tab) => {
                        setActiveTab(tab);
                        setIsBottomSheetOpen(true);
                    }} 
                    isAdmin={profile?.username === 'nodus' || authProfile?.email === 'jaoomarcos75@gmail.com'}
                />
            )}

            {activeTab === 'appearance' && (
                <div className="flex flex-col md:-mt-6 bg-transparent relative min-h-[calc(100vh-140px)]">
                    {/* Design Sidebar - Static Flow */}
                    <div className="shrink-0 z-[50] relative bg-transparent">
                        <DesignSidebar
                            activeSection={activeDesignSection}
                            setActiveSection={setActiveDesignSection}
                        />
                    </div>

                    {/* Design Content Area - Wider Layout */}
                    <div className="flex-1 px-1 md:px-2 pb-32 md:pb-8 w-full">
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

            {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab !== 'analytics' && activeTab !== 'settings' && activeTab !== 'earn' && activeTab !== 'billing' && activeTab !== 'support' && activeTab !== 'files' && activeTab !== 'integrations' && activeTab !== 'admin' && activeTab !== 'roadmap' && activeTab !== 'extras' && (
                <div className="bg-transparent p-12 rounded-[20px] border border-dashed border-[#1a1a1a]/20 text-center">
                    <div className="text-4xl mb-4 text-slate-300 flex justify-center"><Construction size={48} /></div>
                    <h3 className="text-lg font-medium text-slate-700">{t('editor.inDevelopment')}</h3>
                    <p className="text-slate-500 mt-2">{t('editor.inDevelopmentDesc')}</p>
                </div>
            )}
        </>
    );

    return (
        <div className="h-screen w-full bg-transparent font-sans text-black selection:bg-black selection:text-[#ffdf00] flex flex-col overflow-hidden">
            {/* Quests Checklist moved to Sidebar component */}
            {/* Top Banner for Free Users - Desktop Only */}
            {(!profile.plan_type || profile.plan_type === 'free') && (
                <div className="hidden md:block">
                    <UpgradeBanner onUpgradeClick={() => setIsUpgradeOpen(true)} />
                </div>
            )}

            <div className={`flex-1 flex overflow-hidden relative bg-transparent`}>
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
                        links={links}
                        onUpdateProfile={updateProfile}
                        onUpgradeClick={() => setIsUpgradeOpen(true)}
                        onClose={() => setIsSidebarOpen(false)}
                        className={`hidden md:flex h-full ${(!profile.plan_type || profile.plan_type === 'free') ? 'rounded-tl-[24px] md:rounded-tl-[32px]' : ''
                            }`}
                    />
                )}

                {/* Main Layout */}
                <main className="flex-1 flex flex-col md:flex-row min-w-0 h-full relative transition-all duration-300">

                    {/* Mobile Header - Hidden entirely in new Live Mobile Edit */}
                    <div className={`hidden bg-transparent border-b-2 border-[#1a1a1a] px-4 py-4 flex items-center justify-between shrink-0 z-[60] shadow-sm relative`} />

                    {/* Mobile Sidebar (Drawer) - Full height side-drawer */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <div className="fixed inset-0 z-[100] md:hidden flex overflow-hidden">
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
                                    transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 0.8 }}
                                    className="relative w-[85%] max-w-[280px] h-full bg-[#fdfcf0] border-r-2 border-[#1a1a1a] flex flex-col overflow-hidden pointer-events-auto z-10"
                                >
                                    <Sidebar
                                        activeTab={activeTab}
                                        setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }}
                                        userProfile={profile}
                                        links={links}
                                        onUpdateProfile={updateProfile}
                                        onUpgradeClick={() => { setIsUpgradeOpen(true); setIsMobileMenuOpen(false); }}
                                        className="flex-1"
                                        onClose={() => setIsMobileMenuOpen(false)}
                                    />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* MOBILE TOP BAR */}
                    {!(isBottomSheetOpen && ['analytics', 'roadmap', 'billing', 'support', 'admin'].includes(activeTab)) && (
                        <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-[#fdfcf0] border-b-4 border-black z-[70] flex items-center justify-between px-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white border-2 border-black rounded-xl overflow-hidden flex items-center justify-center shadow-[0_3px_0_0_#000]">
                                {profile.avatarUrl ? (
                                    <img 
                                        src={profile.avatarUrl} 
                                        alt={profile.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'user'}`;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#97cd7a] flex items-center justify-center text-xl font-black italic">
                                        {profile.name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-black uppercase italic tracking-tighter leading-none truncate max-w-[120px]">
                                    {profile.name || 'Sem Nome'}
                                </span>
                                <span className="text-[9px] font-bold uppercase text-black/40 tracking-widest mt-1.5 truncate max-w-[140px]">
                                    {authProfile?.email || `@${profile.username || 'user'}`}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             {/* MOBILE STATUS INDICATOR */}
                            <div 
                                className={`
                                    h-10 px-3 flex items-center justify-center gap-2 rounded-xl border-2 border-black transition-all duration-300
                                    ${isSaving 
                                        ? 'bg-[#ffdf00] shadow-[0_3px_0_0_#000]' 
                                        : isPreviewMode 
                                            ? 'bg-white border-dashed shadow-none opacity-50' 
                                            : 'bg-[#97cd7a] shadow-[0_3px_0_0_#000]'}
                                `}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" strokeWidth={3} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Salvando</span>
                                    </>
                                ) : isPreviewMode ? (
                                    <>
                                        <Eye size={16} strokeWidth={3} />
                                        <span className="text-[9px] font-black uppercase tracking-widest uppercase">Preview</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} strokeWidth={4} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Salvo</span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => signOut && signOut()}
                                className="w-10 h-10 flex items-center justify-center bg-[#fdfcf0] border-2 border-black rounded-xl shadow-[0_3px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all text-black"
                            >
                                <LogOut size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}

                    {/* MOBILE UPGRADE BANNER */}
                    {(!profile.plan_type || profile.plan_type === 'free') && activeTab !== 'billing' && (
                        <div className="md:hidden fixed top-20 left-0 right-0 z-[65]">
                            <UpgradeBanner onUpgradeClick={() => setIsUpgradeOpen(true)} />
                        </div>
                    )}

                    {/* MOBILE LIVE PREVIEW BACKGROUND */}
                    <div className={`md:hidden absolute inset-0 z-0 bg-transparent flex flex-col overflow-hidden ${((!profile.plan_type || profile.plan_type === 'free') && activeTab !== 'billing') ? 'pt-[120px]' : 'pt-20'}`}>

                       <div className="w-full h-full origin-top relative">
                         <div className="w-full h-full overflow-hidden bg-transparent">
                            <Preview
                                profile={deferredProfile}
                                links={deferredLinks}
                                products={deferredProducts}
                                stores={deferredStores}
                                onShare={() => setIsShareModalOpen(true)}
                                forcedTab={activeTab === 'shop' ? 'shop' : 'links'}
                            />
                         </div>
                       </div>
                    </div>

                    {/* MOBILE BOTTOM NAVIGATION */}
                    <MobileBottomNav 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                        isSheetOpen={isBottomSheetOpen} 
                        openSheet={() => setIsBottomSheetOpen(true)}
                        closeSheet={() => setIsBottomSheetOpen(false)}
                    />

                    {/* MOBILE BOTTOM SHEET */}
                    <MobileBottomSheet 
                        isOpen={isBottomSheetOpen} 
                        onClose={() => setIsBottomSheetOpen(false)} 
                        fullScreen={['analytics', 'roadmap', 'billing', 'support', 'admin'].includes(activeTab)}
                        onBack={
                            ['shop', 'analytics', 'integrations', 'files', 'roadmap', 'billing', 'support', 'admin'].includes(activeTab) 
                            ? () => setActiveTab('extras') 
                            : undefined
                        }
                        title={
                            activeTab === 'links' ? t('editor.tabs.links') : 
                            activeTab === 'appearance' ? t('editor.tabs.appearance') : 
                            activeTab === 'shop' ? t('editor.tabs.shop') : 
                            activeTab === 'extras' ? 'Extras' : 
                            activeTab === 'analytics' ? t('editor.tabs.analytics') :
                            activeTab === 'integrations' ? 'Integrações' :
                            activeTab === 'files' ? 'Arquivos' :
                            activeTab === 'roadmap' ? 'Lab' :
                            activeTab === 'billing' ? 'Faturamento' :
                            activeTab === 'support' ? 'Suporte' :
                            activeTab === 'admin' ? 'Administração' :
                            ''
                        }
                    >
                       <div className="pb-10 pt-2">
                          {renderEditorContent()}
                       </div>
                    </MobileBottomSheet>

                    {/* 
           --------------------------------------------------
           COLUMN 1: EDITOR AREA 
           Scrollable, Grey Background, Centered Content
           --------------------------------------------------
        */}
                    <div className={`hidden md:block flex-1 h-full overflow-y-auto scrollbar-hide`}>

                        {/* Desktop Header (Sticky) */}
                        <header className="hidden md:flex sticky top-0 z-30 items-center justify-between px-8 py-3 bg-[#fdfcf0] border-b-2 border-[#1a1a1a]">
                            <div className="flex items-center gap-2">
                                {!isSidebarOpen && (
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="p-1.5 -ml-1 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <ChevronsRight size={20} />
                                    </button>
                                )}
                                {/* Breadcrumb or Title */}
                                <h1 className="text-base font-medium uppercase tracking-widest text-black">Editor</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                {isPreviewMode ? (
                                    <div className="hidden md:flex items-center gap-2 h-9 px-4 bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl shrink-0">
                                        <Eye size={14} className="text-[#1a1a1a]" strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Modo Preview</span>
                                    </div>
                                ) : (isSaving || visualSavingProfile) ? (
                                    <div className="hidden md:flex items-center gap-2 h-9 px-4 bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl shrink-0 transition-all">
                                        <Loader2 size={14} className="animate-spin text-[#1a1a1a]" strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">{t('editor.syncing')}</span>
                                    </div>
                                ) : (
                                    <div className="hidden md:flex items-center gap-2 h-9 px-4 bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl shrink-0 transition-all">
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
                                        <Share size={16} strokeWidth={2.5} className=" transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">{t('editor.share')}</span>
                                    </button>
                                    <a
                                        href={shareUrl}
                                        target="_blank"
                                        className="h-9 px-4 flex items-center gap-2 bg-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-xl hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[3px] active:shadow-none transition-all group text-[#1a1a1a]"
                                        title={t('editor.openPublicLink')}
                                    >
                                        <ExternalLink size={16} strokeWidth={2.5} className=" transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">{t('editor.viewProfile')}</span>
                                    </a>
                                </div>


                            </div>
                        </header>
                        <div className="w-full py-2 md:py-4 px-1 pb-24">

                            {/* Page Title - Brutalist Design */}
                            {activeTab !== 'admin' && activeTab !== 'blog' && activeTab !== 'support' && activeTab !== 'billing' && activeTab !== 'roadmap' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center text-center pt-8 md:pt-12 pb-6 w-full mb-6 px-4"
                                >
                                    <div className="relative flex flex-col items-center">
                                        {/* Decorative Brutalist Bar - Compacted */}
                                        <div className="w-12 h-2 bg-[#ffdf00] border-2 border-[#1a1a1a] mb-4" />
                                        
                                        <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none italic">
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
                                        <p className="text-[10px] md:text-xs text-black/50 font-black uppercase tracking-[0.3em] mt-3 max-w-xl leading-relaxed">
                                            {activeTab === 'links' && t('editor.tabDesc.links')}
                                            {activeTab === 'appearance' && t('editor.tabDesc.appearance')}
                                            {activeTab === 'shop' && t('editor.tabDesc.shop')}
                                            {activeTab === 'analytics' && t('editor.tabDesc.analytics')}
                                            {activeTab === 'files' && t('editor.tabDesc.files')}
                                            {activeTab === 'integrations' && t('editor.tabDesc.integrations')}
                                            {activeTab === 'blog' && t('editor.tabDesc.blog')}
                                        </p>
                                    </div>
                                </motion.div>
                            )}





                            {/* Dynamic Content */}
                            <div className={`animate-fade-in mx-auto md:px-6 ${activeTab === 'admin' || activeTab === 'roadmap' ? 'w-full' : 'max-w-5xl'}`}>
                                {renderEditorContent()}
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
                        ${activeTab !== 'admin' && activeTab !== 'billing' && activeTab !== 'roadmap' ? 'hidden md:flex lg:flex' : 'hidden'} 
                        flex-col items-center justify-center 
                        lg:border-l-4 lg:border-[#1a1a1a] lg:bg-transparent 
                        w-full lg:w-[350px] xl:w-[450px] shrink-0
                        ${!showMobilePreview ? 'hidden' : 'flex-1 h-full flex flex-col z-40 overflow-hidden lg:relative lg:inset-auto lg:top-0 lg:flex lg:h-full lg:sticky lg:right-0 bg-transparent'}
                    `}>

                        <div className="relative w-full h-full lg:flex items-center justify-center overflow-y-auto bg-transparent">
                            {/* Scale container to fit phone nicely on different laptop screens - Only on Desktop */}
                            <div className={`
                               w-full min-h-full lg:py-12 transform transition-transform duration-300 origin-center flex items-center justify-center relative z-10
            `}>
                                <Preview
                                    profile={deferredProfile}
                                    links={deferredLinks}
                                    products={deferredProducts}
                                    stores={deferredStores}
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

                <AnnouncementModal />
            </div>
        </div>
    );
}
