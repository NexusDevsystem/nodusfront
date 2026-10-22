import React from 'react';
import { motion } from 'framer-motion';
import { RiTwitterXFill } from 'react-icons/ri';
import { Users } from 'lucide-react';

interface XCardProps {
    username: string;
    displayName: string;
    followers: string | number;
    avatarUrl: string;
    themeButtonClass?: string;
    themeButtonStyle?: React.CSSProperties;
    themeTextHex?: string;
    buttonRoundness?: string;
    isDark?: boolean;
    fontFamily?: string;
    fontWeight?: string;
    fontItalic?: boolean;
    profileUrl?: string;
}

const XCard: React.FC<XCardProps> = ({
    username,
    displayName,
    followers,
    avatarUrl,
    themeButtonClass = '',
    themeButtonStyle = {},
    themeTextHex = '#000000',
    buttonRoundness = '0.5rem',
    isDark = false,
    fontFamily,
    fontWeight,
    fontItalic,
    profileUrl
}) => {
    // Format followers if it's a number
    const displayFollowers = typeof followers === 'number' 
        ? new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(followers)
        : followers;

    const url = profileUrl || `https://x.com/${username.replace('@', '')}`;
    const handle = username.startsWith('@') ? username : `@${username}`;

    const isDefaultAvatar = !avatarUrl || avatarUrl.includes('default_profile');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full overflow-hidden group ${themeButtonClass}`}
            style={{
                ...themeButtonStyle,
                minHeight: '72px',
                borderRadius: buttonRoundness,
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                gap: '0.75rem',
            }}
        >
            {/* Background Accent */}
            <div className="absolute inset-0 bg-black/[0.02] dark:bg-white/[0.02] group-hover:bg-black/5 transition-colors duration-300" />
            
            {/* Profile Picture on Left */}
            <div className="relative z-10 shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#1a1a1a]/5 shadow-sm transition-transform group-hover:scale-105 duration-300 bg-zinc-100 flex items-center justify-center">
                    {!isDefaultAvatar ? (
                        <img 
                            src={avatarUrl} 
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center opacity-40"><RiTwitterXFill size={24} /></div>';
                            }}
                        />
                    ) : (
                        <div className="opacity-40">
                            <RiTwitterXFill size={24} style={{ color: themeTextHex }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Centered */}
            <div className="relative z-10 flex-1 flex flex-col justify-center text-center min-w-0 pr-12">
                {/* Platform Label */}
                <div className="flex items-center justify-center gap-1.5 mb-0.5 opacity-60">
                    <RiTwitterXFill size={10} style={{ color: themeTextHex }} className="shrink-0" />
                    <span className="text-[7px] font-bold uppercase tracking-[0.25em] leading-none" style={{ color: themeTextHex }}>
                        X (Twitter)
                    </span>
                </div>

                {/* Username as Title */}
                <h3 
                    className="text-[15px] font-black leading-tight uppercase tracking-[0.02em] truncate"
                    style={{ 
                        color: themeTextHex,
                        fontFamily,
                        fontWeight: (fontWeight === 'normal' ? '400' : '900'),
                        fontStyle: fontItalic ? 'italic' : 'normal'
                    }}
                >
                    {handle}
                </h3>
                
                {/* Stats Row */}
                <div className="flex items-center justify-center gap-1.5 opacity-70 mt-0.5">
                    <Users size={12} style={{ color: themeTextHex }} className="shrink-0" />
                    <span className="text-[12px] leading-tight font-bold" style={{ color: themeTextHex }}>
                        {displayFollowers || '0'} SEGUIDORES
                    </span>
                </div>
            </div>

            {/* Hidden overlay link */}
            <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 z-20" />
        </motion.div>
    );
};

export default XCard;
