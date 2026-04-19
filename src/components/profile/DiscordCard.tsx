import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import { LinkItem, UserProfile } from '../../types';
import { apiClient } from '../../services/apiClient';
import { SOCIAL_NETWORKS } from '../../constants';

interface DiscordCardProps {
    link: LinkItem;
    handleLinkClick: (id: string) => void;
    baseCardClass: string;
    mainButtonStyle: React.CSSProperties;
    effectiveFontFamily: string;
    profile: UserProfile;
    getSmartTextColor: () => string;
}

const DiscordCard: React.FC<DiscordCardProps> = ({
    link,
    handleLinkClick,
    baseCardClass,
    mainButtonStyle,
    effectiveFontFamily,
    profile,
    getSmartTextColor
}) => {
    const [stats, setStats] = useState<{ online: number; total: number; name: string; icon: string | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const smartText = getSmartTextColor();
    const discordNetwork = SOCIAL_NETWORKS.find(n => n.id === 'discord');
    const SystemIcon = discordNetwork?.icon || SiDiscord;

    useEffect(() => {
        const fetchDiscordInfo = async () => {
            if (!link.url) return;
            setLoading(true);
            try {
                const data = await apiClient.getDiscordInfo(link.url);
                setStats(data);
            } catch (err) {
                console.error("Error fetching Discord stats:", err);
                setStats({
                    name: link.title || "Discord Server",
                    online: 0,
                    total: 0,
                    icon: link.image || null
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDiscordInfo();
    }, [link.url]);

    return (
        <div
            className="flex items-center gap-3 w-full h-full"
        >
            {/* Server Icon vs System Icon */}
            <div className="relative shrink-0 z-10">
                {stats?.icon || link.image ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-black/5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <img 
                            src={stats?.icon || link.image} 
                            className="w-full h-full object-cover" 
                            alt=""
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center opacity-80 transition-transform duration-300 group-hover:scale-110">
                        <SystemIcon size={28} style={{ color: smartText }} />
                    </div>
                )}
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center z-10">
                <div className="flex items-center justify-center gap-1.5 mb-1 opacity-60">
                    <SiDiscord size={10} style={{ color: smartText }} className="shrink-0" />
                    <span className="text-[7px] font-bold uppercase tracking-[0.25em] leading-none" style={{ color: smartText }}>
                        Discord
                    </span>
                </div>

                <h4 className="text-[14px] font-bold truncate tracking-tight uppercase leading-none mb-1.5 w-full text-center" style={{ color: smartText }}>
                    {stats?.name || link.title || "Discord Server"}
                </h4>

                <div className="flex items-center justify-center w-full">
                    <span className="text-[8px] opacity-60 font-bold leading-none flex items-center justify-center gap-1.5 w-full whitespace-nowrap uppercase tracking-[0.15em]" style={{ color: smartText }}>
                        Discord Server • Joined
                    </span>
                </div>
            </div>

            {/* Balancing space for centering */}
            <div className="w-12 shrink-0" />

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </div>
    );
};

export default DiscordCard;
