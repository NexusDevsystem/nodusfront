import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { UserProfile, LinkItem, Product, Store } from '../types';
import ProfileRenderer from '../components/ProfileRenderer';
import { Loader2 } from 'lucide-react';
import { THEMES } from '../constants';
import { apiClient } from '../services/apiClient';
// @ts-ignore
import LightPillar from '../components/LightPillar';
import ShareImageModal from '../components/ShareImageModal';
import BackgroundLayer from '../components/BackgroundLayer';
import ShareCard from '../components/ShareCard';
import StoryShareCard from '../components/StoryShareCard';
import { toPng } from 'html-to-image';

export default function PublicProfilePage() {
    const { t } = useTranslation();
    const { username } = useParams<{ username: string }>();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const shareCardRef = useRef<HTMLDivElement>(null);
    const storyCardRef = useRef<HTMLDivElement>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setLoading(true);
                if (!username) {
                    throw new Error('Username is required');
                }
                const response = await apiClient.getPublicBootstrap(username);

                setProfile(response.profile);
                setLinks(response.links.filter(l => l.isActive));
                setProducts(response.products.filter(p => !p.isArchived));
                setStores(response.stores || []);

            } catch (err) {
                console.error('Failed to load profile:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, [username]);

    useEffect(() => {
        if (!username || loading) return;

        const unsubscribe = apiClient.subscribeToProfileUpdates(username, () => {
            apiClient.getPublicBootstrap(username)
                .then(response => {
                    setProfile(response.profile);
                    setLinks(response.links.filter(l => l.isActive));
                    setProducts(response.products.filter(p => !p.isArchived));
                    setStores(response.stores || []);
                })
                .catch(err => console.error('Silent refresh failed:', err));
        });

        return () => unsubscribe();
    }, [username, loading]);

    useEffect(() => {
        if (profile) {
            document.title = profile.seoTitle || `${profile.name} | Nodus`;

            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', profile.seoDescription || t('profile.checkOutLinks', { name: profile.name }));
        }
    }, [profile, t]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-brand-600" size={32} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white flex-col gap-4">
                <h1 className="text-2xl font-bold text-slate-800">{t('profile.notFound')}</h1>
                <p className="text-slate-500">{t('profile.notFoundDesc', { username })}</p>
            </div>
        );
    }

    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const isProfileMode = profile.headerLayout === 'compact';
    
    // Helper to darken a color for the background
    const getDarkenedThemeColor = () => {
        const base = profile.customSecondaryColor || profile.customSolidColor || currentTheme.solidColor || currentTheme.buttonHex || '#111827';
        return base;
    };

    const themeBgColor = profile.headerLayout === 'banner' 
        ? (profile.bannerBlurColor || '#000000') 
        : isProfileMode 
            ? getDarkenedThemeColor() 
            : (profile.customSolidColor || currentTheme.solidColor || currentTheme.buttonHex || '#000000');

    const generateShareImage = async () => {
        if (!shareCardRef.current || !profile) return;
        
        try {
            setIsGeneratingImage(true);
            await new Promise(resolve => setTimeout(resolve, 500));

            const dataUrl = await toPng(shareCardRef.current, {
                width: 1200,
                height: 630,
                cacheBust: true,
            });
            
            const link = document.createElement('a');
            link.download = `nodus-share-${profile.username || 'profile'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating share image:', error);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const generateStoryImage = async () => {
        if (!storyCardRef.current || !profile) return;
        
        try {
            setIsGeneratingStory(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            const dataUrl = await toPng(storyCardRef.current, {
                width: 1080,
                height: 1920,
                cacheBust: true,
            });
            
            const link = document.createElement('a');
            link.download = `nodus-story-${profile.username || 'profile'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating story image:', error);
        } finally {
            setIsGeneratingStory(false);
        }
    };

    const handleShareImage = async () => {
        if (!shareCardRef.current || !profile) return;
        
        try {
            setIsGeneratingImage(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            const dataUrl = await toPng(shareCardRef.current, {
                width: 1200,
                height: 630,
                cacheBust: true,
            });
            
            // Sync with backend for social preview bots
            await apiClient.syncProfileCard(profile.username || '', dataUrl).catch(e => console.warn('Social card sync failed:', e));
        } catch (error) {
            console.error('Error syncing share image:', error);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    return (
        <div className="w-full min-h-screen relative flex justify-center overflow-y-auto scrollbar-hide md:pt-8" style={{ backgroundColor: themeBgColor }}>
            <div className="fixed inset-0 z-0 overflow-hidden scale-110">
                <div className="absolute inset-0">
                    <BackgroundLayer profile={profile} currentTheme={currentTheme} />
                </div>
                {/* Dynamic Overlay for Profile Mode - Matches layout color but darker/desaturated */}
                <div 
                    className={`absolute inset-0 z-40 transition-colors duration-1000 ${isProfileMode ? 'backdrop-blur-3xl' : 'bg-black/10'}`}
                    style={isProfileMode ? { backgroundColor: themeBgColor, opacity: 0.85, filter: 'brightness(0.3) saturate(0.8)' } : {}}
                ></div>
                <div className="absolute inset-0 z-50 opacity-20 pointer-events-none mix-blend-soft-light"></div>
            </div>

            <div
                className="w-full h-auto min-h-screen relative z-10 overflow-hidden md:max-w-[500px] md:shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.5)] md:rounded-t-[3rem]"
                style={{ backgroundColor: isProfileMode ? themeBgColor : (profile.headerLayout === 'banner' ? (profile.bannerBlurColor || '#000000') : (profile.customSolidColor || currentTheme.solidColor || '#000')) }}
            >
                <ProfileRenderer
                    profile={profile}
                    links={links}
                    products={products}
                    stores={stores}
                    isPreview={false}
                    onShare={() => setIsShareModalOpen(true)}
                />
            </div>

            {isShareModalOpen && (
                <ShareImageModal
                    profile={profile}
                    onClose={() => setIsShareModalOpen(false)}
                    onDownload={generateShareImage}
                    onDownloadStory={generateStoryImage}
                    onSyncShareCard={handleShareImage}
                    isGenerating={isGeneratingImage || isGeneratingStory}
                    isGeneratingStory={isGeneratingStory}
                />
            )}

            <ShareCard profile={profile} cardRef={shareCardRef} />
            <StoryShareCard profile={profile} cardRef={storyCardRef} />

            <div className="fixed bottom-8 right-8 hidden xl:block z-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-3 border-4 border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] transition-transform hover:-translate-y-1 hover:shadow-[0_12px_0_0_#1a1a1a]">
                    <QRCodeCanvas
                        value={window.location.href}
                        size={100}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        imageSettings={{
                            src: "/favicon.png",
                            x: undefined,
                            y: undefined,
                            height: 24,
                            width: 24,
                            excavate: true,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
