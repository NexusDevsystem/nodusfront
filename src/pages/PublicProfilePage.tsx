import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { UserProfile, LinkItem, Product } from '../types';
import ProfileRenderer from '../components/ProfileRenderer';
import { Loader2 } from 'lucide-react';
import { THEMES } from '../constants';
import { apiClient } from '../services/apiClient';
// @ts-ignore
import LightPillar from '../components/LightPillar';
import QRCodeModal from '../components/QRCodeModal';
import BackgroundLayer from '../components/BackgroundLayer';

export default function PublicProfilePage() {
    const { t } = useTranslation();
    const { username } = useParams<{ username: string }>();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setLoading(true);
                // Fetch data from backend API
                if (!username) {
                    throw new Error('Username is required');
                }
                const response = await apiClient.getPublicBootstrap(username);

                setProfile(response.profile);
                setLinks(response.links.filter(l => l.isActive));
                setProducts(response.products);

                setLoading(false);
            } catch (err) {
                console.error("Error loading profile from API", err);
                setLoading(false);
            }
        };

        loadPageData();
    }, [username]);


    useEffect(() => {
        if (profile) {
            document.title = `${profile.name} | Nodus`;
        }
    }, [profile]);

    // Set page title and meta description (SEO)
    useEffect(() => {
        if (profile) {
            document.title = profile.seoTitle || `${profile.name} | Link in Bio`;

            // Update meta description if it exists
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', profile.seoDescription || t('profile.checkOutLinks', { name: profile.name }));
        }
    }, [profile]);

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
    const themeBgColor = profile.headerLayout === 'banner' ? (profile.bannerBlurColor || '#000000') : (profile.customSolidColor || currentTheme.solidColor || currentTheme.buttonHex || '#000000');

    return (
        <div className="w-full min-h-screen relative flex justify-center overflow-y-auto scrollbar-hide md:pt-8" style={{ backgroundColor: themeBgColor }}>

            {/* Dynamic Full Page Background Layer */}
            <div className="fixed inset-0 z-0 overflow-hidden scale-110">
                {/* Background Content (Blur removed for mobile performance, handled inside BackgroundLayer with lower radius if needed) */}
                <div className="absolute inset-0">
                    <BackgroundLayer profile={profile} currentTheme={currentTheme} />
                </div>

                {/* Immersive Darkening Overlay */}
                <div className="absolute inset-0 z-40 bg-black/10 transition-colors duration-1000"></div>

                {/* Ambient Glow / Grain Layer */}
                <div className="absolute inset-0 z-50 opacity-20 pointer-events-none mix-blend-soft-light"></div>
            </div>


            <div
                className="w-full h-auto min-h-screen relative z-10 overflow-hidden md:max-w-[500px] md:shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.5)] md:rounded-t-[3rem] md:border-t md:border-x md:border-white/10"
                style={{ backgroundColor: profile.headerLayout === 'banner' ? (profile.bannerBlurColor || '#000000') : (profile.customSolidColor || currentTheme.solidColor || '#000') }}
            >
                <ProfileRenderer
                    profile={profile}
                    links={links}
                    products={products}
                    isPreview={false}
                    onShare={() => setIsShareModalOpen(true)}
                />
            </div>

            {/* Share Modal */}
            {
                isShareModalOpen && (
                    <QRCodeModal
                        url={window.location.href}
                        profileName={profile.name}
                        onClose={() => setIsShareModalOpen(false)}
                    />
                )
            }

            {/* Brutalist QR Code */}
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
        </div >
    );
}
