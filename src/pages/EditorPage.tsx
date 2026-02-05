import React, { useState } from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES, FONTS } from '../constants';
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
import QRCodeModal from '../components/QRCodeModal';
import { compressImage } from '../utils/imageUtils';
import { apiClient } from '../services/apiClient';

export default function EditorPage() {
    // Initialize state with empty defaults, load from API
    const [profile, setProfile] = useState<UserProfile>({
        name: 'Seu Nome',
        bio: 'Sua bio aqui',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nodus',
        themeId: 'default',
        fontFamily: "'Inter', sans-serif",
        buttonStyle: 'rounded',
        showNewsletter: true
    });

    const [links, setLinks] = useState<LinkItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from API on mount
    React.useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [profileData, linksData, productsData] = await Promise.all([
                    apiClient.getProfile(),
                    apiClient.getLinks(),
                    apiClient.getProducts()
                ]);

                // Default showNewsletter to true if undefined
                if (profileData.showNewsletter === undefined) profileData.showNewsletter = true;

                setProfile(profileData);
                setLinks(linksData);
                setProducts(productsData);
            } catch (error) {
                console.error('Failed to load data:', error);
                alert('Erro ao carregar dados. Verifique se o backend está rodando.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Save profile changes to API
    React.useEffect(() => {
        if (isLoading) return; // Don't save during initial load

        const saveProfile = async () => {
            try {
                await apiClient.updateProfile(profile);
            } catch (error) {
                console.error('Failed to save profile:', error);
                alert('Erro ao salvar perfil. Verifique sua conexão.');
            }
        };

        const timeoutId = setTimeout(saveProfile, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [profile, isLoading]);

    // Save links changes to API
    React.useEffect(() => {
        if (isLoading) return;

        const saveLinks = async () => {
            try {
                await apiClient.replaceAllLinks(links);
            } catch (error) {
                console.error('Failed to save links:', error);
                alert('Erro ao salvar links.');
            }
        };

        const timeoutId = setTimeout(saveLinks, 500);
        return () => clearTimeout(timeoutId);
    }, [links, isLoading]);

    // Save products changes to API
    React.useEffect(() => {
        if (isLoading) return;

        const saveProducts = async () => {
            try {
                await apiClient.replaceAllProducts(products);
            } catch (error) {
                console.error('Failed to save products:', error);
            }
        };

        const timeoutId = setTimeout(saveProducts, 500);
        return () => clearTimeout(timeoutId);
    }, [products, isLoading]);

    React.useEffect(() => {
        document.title = 'Nodus | Editor';
    }, []);

    // 'links' or 'appearance' are the main functional tabs
    const [activeTab, setActiveTab] = useState<string>('links');

    // Mobile drawer state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const shareUrl = `${window.location.origin}/${profile.name.toLowerCase().replace(/\s/g, '')}`;

    return (
        <div className="h-screen bg-slate-50 flex overflow-hidden">

            {/* Sidebar - Desktop (Fixed) */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userProfile={profile} className="fixed left-0 top-0 z-40 hidden md:flex" />

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
                    <div className="flex gap-2">
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
                            <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }} userProfile={profile} className="flex" />
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
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-sm font-medium"
                            >
                                <Share2 size={16} />
                                Compartilhar
                            </button>
                            <a
                                href={`/${profile.name.toLowerCase().replace(/\s/g, '')}`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors text-sm font-medium"
                            >
                                <ExternalLink size={16} />
                                Abrir Link
                            </a>
                        </div>
                    </header>
                    <div className="max-w-[680px] mx-auto py-10 px-6 lg:px-8 pb-32">

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
                            </p>
                        </div>





                        {/* Dynamic Content */}
                        <div className="animate-fade-in">
                            {activeTab === 'links' && (
                                <div className="space-y-6">
                                    <ProfileEditor profile={profile} onChange={setProfile} />
                                    <SocialLinksEditor links={links} onChange={setLinks} />
                                    <LinkEditor links={links} onChange={setLinks} />
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

                            {activeTab === 'appearance' && (
                                <div className="space-y-8">
                                    {/* Theme Section */}
                                    <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 lg:p-8">
                                        <h2 className="text-xl font-bold text-slate-800 mb-6">Temas</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                                            {/* Custom Theme Card */}
                                            <div className="relative group rounded-xl overflow-hidden aspect-[3/5] border-[3px] transition-all duration-200 border-dashed border-slate-300 hover:border-brand-400 bg-slate-50 flex flex-col">
                                                <input
                                                    type="file"
                                                    id="bg-upload-theme"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            try {
                                                                // Compress and set as custom background
                                                                const compressed = await compressImage(e.target.files[0], 800, 0.7);
                                                                setProfile({ ...profile, customBackground: compressed });
                                                            } catch (error) {
                                                                console.error(error);
                                                                alert('Erro ao processar imagem.');
                                                            }
                                                        }
                                                    }}
                                                />

                                                {profile.customBackground ? (
                                                    <>
                                                        {/* Preview of Custom Bg */}
                                                        <div className="absolute inset-0 z-0">
                                                            <img src={profile.customBackground} className="w-full h-full object-cover blur-[2px] scale-105" alt="Custom" />
                                                            <div className="absolute inset-0 bg-black/20"></div>
                                                        </div>

                                                        {/* Mock UI over custom bg */}
                                                        <div className="relative z-10 w-full h-full p-3 flex flex-col items-center justify-center gap-2">
                                                            <div className="w-6 h-6 rounded-full border border-white/50 bg-white/20"></div>
                                                            <div className="w-12 h-1.5 rounded-full bg-white/30 backdrop-blur-md"></div>
                                                            <div className="w-12 h-1.5 rounded-full bg-white/30 backdrop-blur-md"></div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className={`absolute bottom-0 left-0 right-0 py-2 px-1 text-center text-xs font-semibold border-t bg-white/90 backdrop-blur text-brand-700 border-brand-200 ${profile.customBackground ? 'ring-4 ring-brand-100 border-brand-600' : ''}`}>
                                                            Pesonalizado
                                                        </div>

                                                        {/* Hover Overlay to Edit/Delete */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20">
                                                            <button
                                                                onClick={() => document.getElementById('bg-upload-theme')?.click()}
                                                                className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-full hover:scale-105 transition-transform"
                                                            >
                                                                Trocar
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setProfile({ ...profile, customBackground: undefined });
                                                                }}
                                                                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    /* Empty State */
                                                    <button
                                                        onClick={() => document.getElementById('bg-upload-theme')?.click()}
                                                        className="w-full h-full flex flex-col items-center justify-center gap-3 hover:bg-brand-50/30 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500">Criar Novo</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Standard Themes */}
                                            {THEMES.map((theme) => (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => setProfile({ ...profile, themeId: theme.id, customBackground: undefined })}
                                                    className={`relative group rounded-xl overflow-hidden aspect-[3/5] border-[3px] transition-all duration-200 ${profile.themeId === theme.id && !profile.customBackground ? 'border-brand-600 scale-[1.02] shadow-lg ring-4 ring-brand-100' : 'border-slate-100 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className={`w-full h-full ${theme.backgroundClass} p-3 flex flex-col items-center justify-center gap-2`}>
                                                        <div className={`w-6 h-6 rounded-full border ${theme.avatarBorder} bg-white/20`}></div>
                                                        <div className={`w-12 h-1.5 rounded-full ${theme.buttonClass}`}></div>
                                                        <div className={`w-12 h-1.5 rounded-full ${theme.buttonClass}`}></div>
                                                        <div className={`w-12 h-1.5 rounded-full ${theme.buttonClass}`}></div>
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-2 px-1 text-center text-xs font-semibold text-slate-700 border-t border-slate-100">
                                                        {theme.name}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

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
                                                            onClick={() => setProfile({ ...profile, customTextColor: undefined })}
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
                                                            onClick={() => setProfile({ ...profile, customButtonColor: undefined })}
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
                                                        onChange={(e) => setProfile({ ...profile, customSolidColor: e.target.value, customBackground: undefined })}
                                                        className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent shrink-0"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={profile.customSolidColor || ''}
                                                        onChange={(e) => setProfile({ ...profile, customSolidColor: e.target.value, customBackground: undefined })}
                                                        placeholder="Ex: #ffffff"
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                                                    />
                                                    {(profile.customSolidColor) && (
                                                        <button
                                                            onClick={() => setProfile({ ...profile, customSolidColor: undefined })}
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

                            {activeTab !== 'links' && activeTab !== 'appearance' && activeTab !== 'shop' && activeTab !== 'analytics' && activeTab !== 'audience' && activeTab !== 'settings' && activeTab !== 'earn' && (
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

                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-white/50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                        {/* Scale container to fit phone nicely on different laptop screens */}
                        <div className={`
              transform transition-transform duration-300 origin-center flex items-center justify-center w-full h-full
            `}>
                            <Preview profile={profile} links={links} products={products} />
                        </div>
                    </div>

                    <div className="absolute bottom-6 px-4 py-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full text-xs font-medium text-slate-500 shadow-sm">
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

        </div >
    );
}
