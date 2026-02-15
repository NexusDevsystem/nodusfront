import React from 'react';
import { UserProfile, Theme } from '../types';

// Theme Background Imports
import { Background as NodusOfficialBackground } from '../themes/nodus-official';
import { Background as KawaiiSakuraBackground } from '../themes/kawaii-sakura';
import ModernVisualizer from '../themes/modern/ModernVisualizer';
import ArtisticVisualizer from '../themes/artistic/ArtisticVisualizer';
import SocialVisualizer from '../themes/social/SocialVisualizer';

interface BackgroundLayerProps {
    profile: UserProfile;
    currentTheme: Theme;
    className?: string;
    isStatic?: boolean;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ profile, currentTheme, className = "", isStatic = false }) => {
    const renderBackground = () => {
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

            // Music Themes (New Config)

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
