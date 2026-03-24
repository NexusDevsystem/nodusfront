import React from 'react';
import { motion } from 'framer-motion';
import { LinkItem, UserProfile } from '../../types';
import InteractiveButton from '../animations/InteractiveButton';
import { InstagramCard } from '../InstagramCard';
import { YouTubeCard } from '../YouTubeCard';
import { TwitchCard } from '../TwitchCard';
import { KickCard } from '../KickCard';
import { MapBlock } from '../MapBlock';
import YouTubeEmbed from '../YouTubeEmbed';
import TikTokEmbed from '../TikTokEmbed';



interface IntegrationCardProps {
    link: LinkItem;
    profile: UserProfile;
    isDarkTheme: boolean;
    getSmartTextColor: () => string | undefined;
    getHighlightClass: (highlight?: string) => string;
    baseCardClass: string;
    mainButtonStyle: React.CSSProperties;
    roundedClass?: string;
    borderRadiusValue?: number;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
    link,
    profile,
    isDarkTheme,
    getSmartTextColor,
    getHighlightClass,
    baseCardClass,
    mainButtonStyle,
    roundedClass,
    borderRadiusValue
}) => {
    // Logic for individual integration cards
    if (link.embedType === 'youtube') {
        return (
            <InteractiveButton key={link.id} className="w-full">
                <div className={getHighlightClass(link.highlight)}>
                    <YouTubeEmbed url={link.url} title={link.title} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} />
                </div>
            </InteractiveButton>
        );
    }

    if (link.embedType === 'tiktok') {
        return (
            <InteractiveButton key={link.id} className="w-full">
                <div className={getHighlightClass(link.highlight)}>
                    <TikTokEmbed url={link.url} title={link.title} videoUrl={link.videoUrl} themeButtonClass={baseCardClass} themeButtonStyle={mainButtonStyle} />
                </div>
            </InteractiveButton>
        );
    }

    // ... Handle social integrations (Instagram, etc.) based on platform field
    // This is essentially moving the logic from ProfileRenderer into here.

    return null; // Placeholder for now, I will populate it more specifically
};
