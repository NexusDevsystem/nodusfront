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
            className="flex items-center gap-3.5 w-full h-full"
        >
            {/* Server Icon vs System Icon */}
            <div className="relative shrink-0 z-10 w-14 h-14 flex items-center justify-center border-r bg-black/[0.03]" style={{ borderColor: `${smartText}0A` }}>
                {stats?.icon || link.image ? (
                    <div className="w-10 h-10 rounded-sm overflow-hidden border border-black/5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <img 
                            src={stats?.icon || link.image} 
                            className="w-full h-full object-cover" 
                            alt=""
                        />
                    </div>
                ) : (
                    <div className="transition-transform duration-300 group-hover:scale-110">
                        <SystemIcon size={26} style={{ color: smartText }} />
                    </div>
                )}
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center z-10 pr-4">
                <div className="flex items-center justify-center gap-1.5 opacity-50 mb-0.5">
                    <SiDiscord size={10} style={{ color: smartText }} className="shrink-0" />
                    <span className="text-[8px] uppercase tracking-[0.25em] font-black" style={{ color: smartText }}>
                        DISCORD
                    </span>
                </div>

                <h4 className="text-[15px] font-bold truncate tracking-tight uppercase leading-none mb-1 w-full text-center" style={{ color: smartText }}>
                    {stats?.name || link.title || "Discord Server"}
                </h4>

                <div className="flex items-center justify-center w-full">
                    {loading ? (
                        <div className="h-2 w-16 bg-black/10 animate-pulse rounded" />
                    ) : (
                        <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-70 whitespace-nowrap" style={{ color: smartText }}>
                             <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <div className="w-2 h-2 rounded-full bg-[#23A559] shrink-0 shadow-[0_0_8px_rgba(35,165,89,0.4)]" />
                                <span className="whitespace-nowrap">{stats?.online.toLocaleString()} ONLINE</span>
                            </div>
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <div className="w-2 h-2 rounded-full border-2 border-current opacity-40 shrink-0" />
                                <span className="whitespace-nowrap">{stats?.total.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </div>
    );
};

export default DiscordCard;
