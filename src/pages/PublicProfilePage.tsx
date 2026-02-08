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

    return (
        <div className="w-full h-screen relative flex justify-center overflow-hidden md:pt-8 bg-[#222]">

            {/* Dynamic Fuzzy Background */}
            <div className="fixed inset-0 z-0">
                {profile.customBackground ? (
                    <div className="absolute inset-0">
                        <img src={profile.customBackground} alt="" className="w-full h-full object-cover blur-xl scale-110 opacity-60" />
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                ) : currentTheme.id === 'glass' ? (
                    <div className="absolute inset-0 bg-black">
                        <div className="absolute inset-0 opacity-40 blur-3xl scale-125">
                            <LightPillar
                                topColor="#5227FF"
                                bottomColor="#FF9FFC"
                                intensity={1}
                            />
                        </div>
                    </div>
                ) : (
                    <div className={`absolute inset-0 ${currentTheme.backgroundClass} blur-3xl scale-125 opacity-70`}></div>
                )}
                {/* Overlay to ensure readability and focus */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[60px]"></div>
            </div>


            {/* Main Profile Card - Responsive: Full Screen Mobile, Card Desktop */}
            <div className="w-full h-full relative z-10 bg-black overflow-hidden 
                md:max-w-[600px] md:shadow-2xl md:rounded-t-[3rem] md:border-t md:border-x md:border-white/10">
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

            {/* Footer / QR Code Mock (Visual Match) */}
            <div className="fixed bottom-8 right-8 hidden xl:flex flex-col items-center gap-2 text-white/40 z-20">
                <span className="text-xs font-medium tracking-wide">View on mobile</span>
                <div className="w-24 h-24 bg-white p-1 rounded-lg opacity-80 mix-blend-screen">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.href}`} alt="QR Code" className="w-full h-full" />
                </div>
            </div>
        </div>
    );
}
