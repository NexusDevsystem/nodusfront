import React from 'react';
import { motion } from 'framer-motion';
import { SiTiktok } from 'react-icons/si';
import { Users } from 'lucide-react';

interface TikTokCardProps {
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
}

const TikTokCard: React.FC<TikTokCardProps> = ({
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
    fontItalic
}) => {
    // Format followers if it's a number
    const displayFollowers = typeof followers === 'number' 
        ? new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(followers)
        : followers;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full overflow-hidden group ${themeButtonClass}`}
            style={{
                ...themeButtonStyle,
                minHeight: '100px',
                borderRadius: buttonRoundness,
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                gap: '1.25rem',
            }}
        >
            {/* Background Accent */}
            <div className="absolute inset-0 bg-[#000000]/[0.02] dark:bg-white/[0.02] group-hover:bg-[#fe2c55]/5 transition-colors duration-300" />
            
            {/* Avatar */}
            <div className="relative z-10 shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                    <img 
                        src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
                        }}
                    />
                </div>
                {/* TikTok Badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#000000] rounded-full flex items-center justify-center border-2 border-white">
                    <SiTiktok size={12} className="text-white" />
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center min-w-0">
                {/* Platform Label (Consistent with IG) */}
                <div className="flex items-center gap-1.5 opacity-40 mb-1">
                    <SiTiktok size={8} style={{ color: themeTextHex }} />
                    <span className="text-[8px] tracking-[0.25em] uppercase font-bold" style={{ color: themeTextHex }}>TikTok</span>
                </div>

                <h3 
                    className="text-[16px] font-bold truncate leading-tight mb-0.5 uppercase tracking-tight"
                    style={{ 
                        color: themeTextHex,
                        fontFamily,
                        fontWeight: (fontWeight === 'normal' ? '400' : '900'),
                        fontStyle: fontItalic ? 'italic' : 'normal'
                    }}
                >
                    @{username.replace('@', '')}
                </h3>
                
                {/* Stats Row */}
                <div className="flex items-center gap-2 mt-0.5 transition-all group-hover:translate-x-1">
                    <div className="flex items-center gap-1.5 opacity-70">
                        <Users size={12} style={{ color: themeTextHex }} className="shrink-0" />
                        <span className="text-[11px] font-bold leading-none uppercase tracking-tight" style={{ color: themeTextHex }}>
                            {displayFollowers} Seguidores
                        </span>
                    </div>
                </div>
            </div>

            {/* Animated TikTok Colors lines (Subtle) */}
            <div className="absolute top-0 right-0 h-1 w-24 bg-gradient-to-r from-transparent via-[#25f4ee] to-[#fe2c55] opacity-30 blur-sm" />
            <div className="absolute bottom-0 left-0 h-1 w-24 bg-gradient-to-r from-[#fe2c55] via-[#25f4ee] to-transparent opacity-30 blur-sm" />
        </motion.div>
    );
};

export default TikTokCard;
