import React from 'react';
import { UserProfile, Theme } from '../types';

// Theme Background Imports
import { Background as NodusOfficialBackground } from '../themes/nodus-official';
import { Background as KawaiiSakuraBackground } from '../themes/kawaii-sakura';
import ModernVisualizer from '../themes/modern/ModernVisualizer';
import AdvocacyVisualizer from '../themes/advocacy/AdvocacyVisualizer';
import ArtisticVisualizer from '../themes/artistic/ArtisticVisualizer';
import SocialVisualizer from '../themes/social/SocialVisualizer';
import EngineeringVisualizer from '../themes/engineering/EngineeringVisualizer';
import MedicineVisualizer from '../themes/medicine/MedicineVisualizer';
import TechnologyVisualizer from '../themes/technology/TechnologyVisualizer';
import MusicVisualizer from '../themes/music/MusicVisualizer';

// ... (in renderBackground switch)



interface BackgroundLayerProps {
    profile: UserProfile;
    currentTheme: Theme;
    className?: string;
    isStatic?: boolean;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ profile, currentTheme, className = "", isStatic = false }) => {
    const renderBackground = () => {
        // Special Case: Banner & Compact Layouts
        // Rules: 
        // 1. Manually set background (customSolidColor/Background) takes Priority if themeId is 'custom' or layout is special
        // 2. Adaptive Blurred Background is the default fallback for these modes
        // 3. Theme Visualizers are NEVER used here.
        if (profile.headerLayout === 'banner' || profile.headerLayout === 'compact') {
            // Priority 1: User-set Manual Background (Wallpaper)
            if (profile.customSolidColor) {
                return (
                    <div
                        className="absolute inset-0"
                        style={{
                            background: profile.customSecondaryColor
                                ? `linear-gradient(135deg, ${profile.customSolidColor}, ${profile.customSecondaryColor})`
                                : profile.customSolidColor
                        }}
                    />
                );
            }
            if (profile.customBackground && profile.headerLayout === 'banner') {
                return (
                    <div className="absolute inset-0">
                        <img src={profile.customBackground} alt="Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                );
            }

            // Priority 2: Adaptive Blurred Background
            const hasAvatar = !!profile.avatarUrl;
            // Parse bannerBlurColor: supports "#color1" or "#color1|#color2"
            const rawBanner = profile.bannerBlurColor || (profile.headerLayout === 'banner' ? '#000000' : '#ffffff');
            const bannerParts = rawBanner.split('|');
            const color1 = bannerParts[0] || '#000000';
            const color2 = bannerParts[1] || null;
            const bgStyle = color2
                ? { background: `linear-gradient(135deg, ${color1}, ${color2})` }
                : { backgroundColor: color1 };
            const fadeColor = color2 || color1;

            return (
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={bgStyle}
                >
                    <div className="noise-overlay" />
                    {/* 1. Blurred Base Image */}
                    {hasAvatar && (
                        <div className="absolute inset-0 transform-gpu">
                            <img
                                src={profile.avatarUrl}
                                alt="Background"
                                className="w-full h-full object-cover scale-[1.4] blur-[120px] opacity-[0.35]"
                            />
                        </div>
                    )}

                    {/* 2. Color Tint Layer */}
                    <div
                        className="absolute inset-0 z-10"
                        style={color2
                            ? { background: `linear-gradient(135deg, ${color1}55, ${color2}55)` }
                            : { backgroundColor: `${color1}55` }
                        }
                    ></div>

                    {/* 3. Bottom fade */}
                    <div
                        className="absolute inset-0 z-20"
                        style={{
                            background: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 35%, ${fadeColor}cc 85%)`
                        }}
                    ></div>
                </div>
            );
        }

        // If static, return a simplified version for performance (previews)
        if (isStatic) {
            return (
                <div
                    className={`absolute inset-0 ${currentTheme.backgroundClass}`}
                    style={currentTheme.category === 'solid' && (profile.themeId === 'custom' && profile.customSolidColor) ? { backgroundColor: profile.customSolidColor } : {}}
                ></div>
            );
        }

        if ((profile.themeId === 'custom' && profile.customSolidColor)) {
            return (
                <div
                    className="absolute inset-0"
                    style={{
                        background: profile.customSecondaryColor
                            ? `linear-gradient(135deg, ${profile.customSolidColor}, ${profile.customSecondaryColor})`
                            : profile.customSolidColor
                    }}
                />
            );
        }

        if (profile.themeId === 'custom' && profile.customBackground) {
            return (
                <div className="absolute inset-0">
                    <img src={profile.customBackground} alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
            );
        }

        switch (currentTheme.id) {
            case 'animated-nodus-official':
                return <NodusOfficialBackground />;
            case 'kawaii-sakura':
                return <KawaiiSakuraBackground />;

            // Modern UI Themes
            case 'modern-minimalist':
                return <ModernVisualizer variant="minimalist" />;

            // Advocacy Themes
            case 'advocacy-juris-classic':
                return <AdvocacyVisualizer variant="juris-classic" />;
            case 'advocacy-modern-law':
                return <AdvocacyVisualizer variant="modern-law" />;
            case 'advocacy-verdict':
                return <AdvocacyVisualizer variant="verdict" />;
            case 'advocacy-equity':
                return <AdvocacyVisualizer variant="equity" />;
            case 'advocacy-justice-scale':
                return <AdvocacyVisualizer variant="justice-scale" />;
            case 'modern-cyberpunk':
                return <ModernVisualizer variant="cyberpunk" />;
            case 'modern-glassmorphism':
                return <ModernVisualizer variant="glassmorphism" />;
            case 'modern-pastel':
                return <ModernVisualizer variant="pastel" />;
            case 'modern-dark-elegant':
                return <ModernVisualizer variant="dark-elegant" />;
            case 'modern-industrial':
                return <ModernVisualizer variant="industrial" />;
            case 'modern-retro':
                return <ModernVisualizer variant="retro-futurist" />;
            case 'modern-nature':
                return <ModernVisualizer variant="nature" />;
            case 'modern-high-contrast':
                return <ModernVisualizer variant="high-contrast" />;
            case 'modern-royal-gold':
                return <ModernVisualizer variant="royal-gold" />;

            // Artistic Themes
            case 'artistic-sketchbook':
                return <ArtisticVisualizer variant="sketchbook" />;
            case 'artistic-line-art':
                return <ArtisticVisualizer variant="line-art" />;
            case 'artistic-pop-art':
                return <ArtisticVisualizer variant="pop-art" />;
            case 'artistic-abstract':
                return <ArtisticVisualizer variant="abstract" />;
            case 'artistic-bauhaus':
                return <ArtisticVisualizer variant="bauhaus" />;

            // Social Themes
            case 'social-tiktok':
                return <SocialVisualizer variant="tiktok" />;
            case 'social-twitch':
                return <SocialVisualizer variant="twitch" />;
            case 'social-youtube':
                return <SocialVisualizer variant="youtube" />;

            // Engineering Themes (Animated)
            case 'engineering-crane':
                return <EngineeringVisualizer variant="crane-sky" />;
            case 'engineering-blueprint':
                return <EngineeringVisualizer variant="blueprint-motion" />;
            case 'engineering-circuit':
                return <EngineeringVisualizer variant="circuit-flow" />;
            case 'engineering-gears':
                return <EngineeringVisualizer variant="industrial-gears" />;
            case 'engineering-structure':
                return <EngineeringVisualizer variant="neon-grid" />;

            // Medicine Themes (Animated)
            case 'medicine-clinical':
                return <MedicineVisualizer variant="clinical-clean" />;
            case 'medicine-cardio':
                return <MedicineVisualizer variant="cardio-pulse" />;
            case 'medicine-biolab':
                return <MedicineVisualizer variant="bio-lab" />;
            case 'medicine-neuro':
                return <MedicineVisualizer variant="neuro-mind" />;
            case 'medicine-radiology':
                return <MedicineVisualizer variant="radiology-dark" />;

            // Technology Themes
            case 'technology-neural':
                return <TechnologyVisualizer variant="neural-grid" />;
            case 'technology-brutalist':
                return <TechnologyVisualizer variant="brutalist-tech" />;
            case 'technology-cyberpunk':
                return <TechnologyVisualizer variant="cyberpunk-corp" />;
            case 'technology-saas':
                return <TechnologyVisualizer variant="minimal-saas" />;
            case 'technology-terminal':
                return <TechnologyVisualizer variant="terminal-dev" />;
            case 'technology-holo':
                return <TechnologyVisualizer variant="holographic-glass" />;
            case 'technology-matrix':
                return <TechnologyVisualizer variant="matrix-code" />;
            case 'technology-ai':
                return <TechnologyVisualizer variant="ai-gradient" />;
            case 'technology-dark':
                return <TechnologyVisualizer variant="dark-corp" />;
            case 'technology-startup':
                return <TechnologyVisualizer variant="startup-launch" />;

            // Music Themes (New Config)
            case 'music-sinfonia-mecanica':
                return <MusicVisualizer variant="sinfonia-mecanica" />;
            case 'music-fita-analogica':
                return <MusicVisualizer variant="fita-analogica" />;
            case 'music-sopro-de-ouro':
                return <MusicVisualizer variant="sopro-de-ouro" />;
            case 'music-batida-botanica':
                return <MusicVisualizer variant="batida-botanica" />;
            case 'music-grave-urbano':
                return <MusicVisualizer variant="grave-urbano" />;
            case 'music-hino-de-vitral':
                return <MusicVisualizer variant="hino-de-vitral" />;
            case 'music-jardim-zen-sonoro':
                return <MusicVisualizer variant="jardim-zen-sonoro" />;
            case 'music-harpa-cosmica':
                return <MusicVisualizer variant="harpa-cosmica" />;
            case 'music-horizonte-neon':
                return <MusicVisualizer variant="horizonte-neon" />;
            case 'music-orquestra-origami':
                return <MusicVisualizer variant="orquestra-origami" />;

            default:
                return (
                    <div
                        className={`absolute inset-0 ${currentTheme.backgroundClass}`}
                        style={currentTheme.category === 'solid' && profile.customSolidColor ? { backgroundColor: profile.customSolidColor } : {}}
                    ></div>
                );
        }
    };

    return (
        <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
            {renderBackground()}
        </div>
    );
};

export default BackgroundLayer;
