import React from 'react';
import { UserProfile } from '../types';
import verifiedBadge from '../assets/verified-badge.png';
import BackgroundLayer from './BackgroundLayer';
import { THEMES } from '../constants';

interface ShareCardProps {
    profile: UserProfile;
    cardRef: React.RefObject<HTMLDivElement | null>;
}

const ShareCard: React.FC<ShareCardProps> = ({ profile, cardRef }) => {
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];

    return (
        <div 
            ref={cardRef}
            id="share-card-element"
            className="fixed -left-[9999px] top-0 flex items-center justify-center overflow-visible"
            style={{ 
                width: '1200px', 
                height: '630px', 
                fontFamily: profile.fontFamily || 'Inter, sans-serif',
                backgroundColor: 'transparent'
            }}
        >
            {/* Main Outer Container: The "Card" itself */}
            <div 
                className="relative w-[1120px] h-[550px] rounded-[6rem] border-[10px] border-[#1a1a1a] shadow-[0_24px_0_0_#1a1a1a] overflow-hidden flex flex-col items-center justify-center p-12 bg-[#1a1a1a]"
            >
                {/* Background Layer logic inside card */}
                <div className={`absolute inset-0 z-0`}>
                     <BackgroundLayer profile={profile} currentTheme={currentTheme} isStatic={true} />
                </div>
                
                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-black/5 z-[1]" />

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-10 py-4">
                    
                    {/* Avatar Group */}
                    <div className="relative">
                        <div className="w-[240px] h-[240px] rounded-full overflow-hidden border-[10px] border-[#1a1a1a] bg-white relative shadow-xl">
                            <img 
                                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                                alt={profile.name}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                            />
                        </div>
                        {profile.isVerified && (
                            <div className="absolute bottom-2 -right-2 w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 border-[4px] border-[#1a1a1a] shadow-lg">
                                 <img src={verifiedBadge} alt="Verified" className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Identity */}
                    <div className="flex flex-col items-center text-center gap-6">
                        <h1 
                            className="text-[84px] font-[900] tracking-tighter leading-none uppercase max-w-[1000px] px-8 mb-2"
                            style={{ color: currentTheme.textHex || '#ffffff' }}
                        >
                            {profile.name}
                        </h1>
                        
                        {/* Status/Handle Pill */}
                        <div 
                            className="flex items-center gap-5 px-10 py-5 rounded-[2.5rem] border-[6px] border-[#1a1a1a] shadow-lg"
                            style={{ backgroundColor: currentTheme.buttonHex || '#ffffff' }}
                        >
                            {/* Logo Icon */}
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1a1a1a] shrink-0">
                                <svg viewBox="0 0 24 24" fill={currentTheme.buttonHex || '#ffffff'} className="w-7 h-7">
                                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                                </svg>
                            </div>
                            
                            <span 
                                className="text-[34px] font-black tracking-tight"
                                style={{ color: currentTheme.textHex || '#1a1a1a' }}
                            >
                                 nodus.my/{profile.username}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareCard;
