import React from 'react';
import { UserProfile } from '../types';
import verifiedBadge from '../assets/verified-badge.png';
import BackgroundLayer from './BackgroundLayer';
import { THEMES } from '../constants';

interface StoryShareCardProps {
    profile: UserProfile;
    cardRef: React.RefObject<HTMLDivElement | null>;
}

const StoryShareCard: React.FC<StoryShareCardProps> = ({ profile, cardRef }) => {
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];

    return (
        <div 
            ref={cardRef}
            id="story-share-card-element"
            className="fixed -left-[9999px] top-0 flex flex-col items-center justify-between p-16"
            style={{ 
                width: '1080px', 
                height: '1920px', 
                fontFamily: profile.fontFamily || 'Inter, sans-serif',
                backgroundColor: '#1a1a1a'
            }}
        >
            {/* Background Layer: High impact */}
            <div className="absolute inset-0 z-0 scale-110">
                <BackgroundLayer profile={profile} currentTheme={currentTheme} isStatic={true} />
            </div>
            
            {/* Dark Filter & Grain */}
            <div className="absolute inset-0 bg-black/20 z-[1] backdrop-blur-[1px]" />

            {/* Content Area */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between py-24 px-10">
                
                {/* Header Branding */}
                <div className="flex flex-col items-center gap-6">
                    <div className="w-[120px] h-[120px] bg-white border-4 border-[#1a1a1a] rounded-3xl flex items-center justify-center shadow-xl">
                        <svg viewBox="0 0 24 24" fill="#1a1a1a" className="w-[60px] h-[60px]">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                        </svg>
                    </div>
                    <span className="text-[36px] font-black uppercase tracking-[0.6em] text-white drop-shadow-lg">NODUS</span>
                </div>

                {/* Main Identity: Huge Bold Title and Handle */}
                <div className="flex flex-col items-center gap-20 w-full">
                    {/* Unique Avatar Group */}
                    <div className="relative">
                        <div className="w-[450px] h-[450px] rounded-full overflow-hidden border-[16px] border-white/20 bg-white relative shadow-[0_40px_80px_rgba(0,0,0,0.3)]">
                            <img 
                                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                                alt={profile.name}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                            />
                        </div>
                        {profile.isVerified && (
                            <div className="absolute bottom-6 right-6 w-[120px] h-[120px] bg-[#ffdf00] rounded-full flex items-center justify-center p-4 border-[8px] border-[#1a1a1a] shadow-xl">
                                 <img src={verifiedBadge} alt="Verified" className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Identity Text Overlay */}
                    <div className="flex flex-col items-center text-center gap-12 w-full">
                        <h1 
                            className="text-[150px] font-[900] tracking-tighter leading-[0.75] uppercase max-w-[960px] px-8 text-white drop-shadow-2xl"
                            style={{ color: '#ffffff' }}
                        >
                            {profile.name}
                        </h1>
                        
                        {/* URL Badge - Minimalist but powerful */}
                        <div 
                            className="flex items-center gap-8 px-14 py-8 rounded-full border-[6px] border-[#1a1a1a] shadow-[0_20px_0_0_#1a1a1a]"
                            style={{ backgroundColor: '#ffdf00' }}
                        >
                            <span 
                                className="text-[64px] font-black tracking-tight text-[#1a1a1a]"
                            >
                                 nodus.my/{profile.username}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Engagement */}
                <div className="flex flex-col items-center gap-8 pt-20">
                     <span className="bg-white/10 backdrop-blur-md px-12 py-5 rounded-full text-white text-[32px] font-black uppercase tracking-[0.4em] border-2 border-white/20">
                         Link na Bio
                     </span>
                     <div className="h-1.5 w-32 bg-white/40 rounded-full" />
                </div>
            </div>
            
            {/* Texture */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none mix-blend-overlay" />
        </div>
    );
};

export default StoryShareCard;
