import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserProfile, LinkItem, Product } from '../types';
import ProfileRenderer from '../components/ProfileRenderer';
import { Loader2 } from 'lucide-react';
import { THEMES } from '../constants';
import { apiClient } from '../services/apiClient';
// @ts-ignore
import LightPillar from '../components/LightPillar';
import QRCodeModal from '../components/QRCodeModal';

export default function PublicProfilePage() {
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
                const [profileData, linksData, productsData] = await Promise.all([
                    apiClient.getPublicProfile(username),
                    apiClient.getPublicLinks(username),
                    apiClient.getPublicProducts(username)
                ]);

                setProfile(profileData);
                setLinks(linksData.filter(l => l.isActive));
                setProducts(productsData);

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
            metaDescription.setAttribute('content', profile.seoDescription || `Confira os links de ${profile.name} no Nodus.`);
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
                <h1 className="text-2xl font-bold text-slate-800">Perfil não encontrado</h1>
                <p className="text-slate-500">O usuário @{username} não foi encontrado.</p>
            </div>
        );
    }

    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const themeBgColor = profile.customSolidColor || currentTheme.solidColor || currentTheme.buttonHex || '#000000';

    return (
        <div className="w-full h-screen relative flex justify-center overflow-hidden md:pt-8" style={{ backgroundColor: themeBgColor }}>

            {/* Dynamic Fuzzy Background */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div
                    className="absolute inset-0 blur-[100px] scale-150 transition-colors duration-1000"
                    style={{ backgroundColor: themeBgColor }}
                ></div>

                {profile.customBackground && (
                    <div className="absolute inset-0">
                        <img src={profile.customBackground} alt="" className="w-full h-full object-cover blur-3xl scale-110 opacity-30" />
                    </div>
                )}

                {/* Adaptive Overlay: Darker for light themes to provide contrast, vice-versa */}
                <div className={`absolute inset-0 backdrop-blur-[60px] ${
                    // Detect if it's a dark background (using a simple heuristic for now, or just making it universally softer)
                    currentTheme.id === 'kawaii-space' ? 'bg-black/20' : 'bg-white/5'
                    }`}></div>
            </div>


            {/* Main Profile Card - Responsive: Full Screen Mobile, Card Desktop */}
            <div
                className="w-full h-full relative z-10 overflow-hidden md:max-w-[460px] md:shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.5)] md:rounded-t-[3rem] md:border-t md:border-x md:border-white/10"
                style={{ backgroundColor: profile.customSolidColor || currentTheme.solidColor || '#000' }}
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
            {isShareModalOpen && (
                <QRCodeModal
                    url={window.location.href}
                    profileName={profile.name}
                    onClose={() => setIsShareModalOpen(false)}
                />
            )}

            {/* Minimalist QR Code */}
            <div className="fixed bottom-4 right-4 hidden xl:block z-20">
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${window.location.href}`}
                    alt="QR Code"
                    className="w-32 h-32 invert transition-opacity duration-300 hover:opacity-100 opacity-90 brightness-200"
                />
            </div>
        </div>
    );
}
