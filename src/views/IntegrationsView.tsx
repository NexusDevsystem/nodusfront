import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Instagram,
    Twitch,
    Check,
    Loader2,
    Trash2,
    ChevronRight,
    AlertCircle,
    Music,
    Youtube,
    Twitter,
    Lock
} from 'lucide-react';
import { SiTiktok, SiSpotify } from 'react-icons/si';
import { KickIcon } from '../constants';
import { apiClient } from '../services/apiClient';
import { UserProfile } from '../types';
import { useTranslation } from 'react-i18next';

interface IntegrationsViewProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    links?: any[];
    onLinksChange?: (links: any[]) => void;
}

interface IntegrationCardProps {
    id: string;
    name: string;
    icon: any;
    description: string;
    isConnected: boolean;
    isAvailable: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    isLoading: boolean;
    profileData?: any;
    color?: string;
    statusLabel?: string;
    notice?: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
    id,
    name,
    icon: Icon,
    description,
    isConnected,
    isAvailable,
    onConnect,
    onDisconnect,
    isLoading,
    profileData,
    color = "#000",
    statusLabel,
    notice
}) => {
    const { t } = useTranslation();
    const [showConfirm, setShowConfirm] = useState(false);
    const finalStatusLabel = statusLabel || t('common.inTests');

    return (
        <div className={`relative border-2 border-[#1a1a1a] bg-white transition-all shadow-[0_4px_0_0_#1a1a1a] overflow-hidden rounded-2xl ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
            {!isAvailable && (
                <div className="absolute top-0 right-0 z-20">
                    <div className="bg-black text-[#ffdf00] text-[8px] font-medium uppercase tracking-[0.2em] px-2 py-0.5 border-b-2 border-l-2 border-[#1a1a1a] flex items-center gap-1">
                        <Lock size={8} /> {finalStatusLabel}
                    </div>
                </div>
            )}

            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 border-2 border-[#1a1a1a] bg-white shadow-[0_2px_0_0_#1a1a1a] shrink-0 rounded-xl`} style={{ color: isAvailable ? color : "#ccc" }}>
                        <Icon size={24} />
                    </div>
                    <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-black">{name}</h3>
                            {isAvailable && isConnected && (
                                <div className="bg-[#97cd7a] p-0.5 border border-[#1a1a1a] shadow-[0_1px_0_0_#1a1a1a] text-black rounded-full">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-black/50 uppercase tracking-wider font-medium line-clamp-1">{description}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:shrink-0 w-full sm:w-auto mt-2 sm:mt-0 flex-1 justify-end">
                    {notice && (
                        <div className="p-2 bg-yellow-50 border-2 border-[#1a1a1a] flex items-start sm:items-center gap-2 w-full sm:max-w-[320px] shrink-0 mr-auto rounded-xl">
                            <AlertCircle size={14} className="text-yellow-600 shrink-0" strokeWidth={3} />
                            <p className="text-[8px] font-bold text-yellow-800 uppercase tracking-widest leading-normal">
                                {notice}
                            </p>
                        </div>
                    )}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        {isConnected && profileData && (
                            <div className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 border border-[#1a1a1a]/10 shrink-0 rounded-xl">
                                <div className="w-8 h-8 rounded-full border border-[#1a1a1a] overflow-hidden bg-white shrink-0">
                                    <img src={profileData.avatar_url || profileData.picture}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-tight truncate text-black leading-none">@{profileData.username || profileData.display_name}</p>
                                    <p className="text-[8px] uppercase tracking-widest text-black font-bold bg-[#ffdf00] px-1 mt-0.5 w-fit leading-none py-0.5">{t('common.connected')}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 shrink-0 w-[140px]">
                            {isAvailable ? (
                                isConnected ? (
                                    <div className="flex flex-col gap-1 w-full">
                                        <button
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="w-full py-2 bg-white hover:bg-red-50 text-red-600 border-2 border-[#1a1a1a] text-[9px] font-bold uppercase tracking-widest transition-all shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-none rounded-xl"
                                        >
                                            {showConfirm ? t('common.cancelCaps') : t('common.disconnect')}
                                        </button>

                                        <AnimatePresence>
                                            {showConfirm && (
                                                <motion.button
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    onClick={onDisconnect}
                                                    disabled={isLoading}
                                                    className="w-full py-2 bg-red-600 text-white border-2 border-[#1a1a1a] text-[9px] font-bold uppercase tracking-widest transition-all shadow-[0_2px_0_0_#1a1a1a] hover:bg-red-700 disabled:opacity-50 rounded-xl"
                                                >
                                                    {isLoading ? <Loader2 size={12} className="animate-spin mx-auto" strokeWidth={3} /> : t('common.confirmDisconnect')}
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <button
                                        onClick={onConnect}
                                        disabled={isLoading}
                                        className="w-full py-2.5 bg-[#97cd7a] hover:bg-[#86b96b] text-black border-2 border-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.15em] transition-all shadow-[0_3px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 rounded-xl"
                                    >
                                        {isLoading ? <Loader2 size={14} className="animate-spin" strokeWidth={3} /> : (
                                            <>
                                                {t('common.connectNow')} <ChevronRight size={14} strokeWidth={3} />
                                            </>
                                        )}
                                    </button>
                                )
                            ) : (
                                <div className="flex items-center justify-center py-2 px-4 bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest w-full rounded-xl">
                                    {t('common.blocked')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ profile, onChange, links, onLinksChange }) => {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [kickUsername, setKickUsername] = useState('');
    const { t } = useTranslation();

    const integrations = profile.integrations || [];
    const isAuthorized = profile?.username === 'nodus' || profile?.username === 'nexus' || profile?.username === 'nyill';

    const handleConnect = async (provider: string) => {
        try {
            setError(null);
            const userId = profile.id;
            if (!userId) {
                throw new Error(t('integrations.userIdNotFound'));
            }
            setLoadingProvider(provider);

            let urlResponse;
            if (provider === 'tiktok') {
                urlResponse = await apiClient.getTikTokAuthUrl(userId, window.location.origin);
            } else if (provider === 'instagram') {
                urlResponse = await apiClient.getInstagramAuthUrl(userId, window.location.origin);
            } else if (provider === 'twitch') {
                urlResponse = await apiClient.getTwitchAuthUrl(userId, window.location.origin);
            } else if (provider === 'youtube') {
                urlResponse = await apiClient.getYoutubeAuthUrl(userId, window.location.origin);
            } else if (provider === 'kick') {
                // If username is provided, use manual connection
                if (kickUsername) {
                    const response = await apiClient.connectKickAccount(kickUsername);
                    const updatedProfile = {
                        ...profile,
                        integrations: [...(profile.integrations || []), response.data]
                    };
                    onChange(updatedProfile);
                    setKickUsername('');
                    setLoadingProvider(null);
                    return;
                }
                // Otherwise, initiate OAuth
                urlResponse = await apiClient.getKickAuthUrl(userId, window.location.origin);
            } else {
                throw new Error(t('integrations.providerNotSupported'));
            }

            window.location.href = urlResponse.url;
        } catch (err: any) {
            setError(`${t('integrations.errorConnecting')} ${provider}: ${err.message}`);
            setLoadingProvider(null);
        }
    };

    const handleDisconnect = async (provider: string) => {
        try {
            setError(null);
            setLoadingProvider(provider);
            await apiClient.disconnectIntegration(provider);

            const updatedProfile = {
                ...profile,
                integrations: profile.integrations?.filter(i => i.provider !== provider)
            };
            onChange(updatedProfile);

            if (links && onLinksChange) {
                const updatedLinks = links.filter(l => !(l.platform === provider && (l.type === 'social' || l.layout === 'social')));
                onLinksChange(updatedLinks);
            }

            setLoadingProvider(null);
        } catch (err: any) {
            setError(`${t('integrations.errorDisconnecting')} ${provider}: ${err.message}`);
            setLoadingProvider(null);
        }
    };

    const getIntegrationData = (provider: string) => {
        return integrations.find(i => i.provider === provider);
    };

    return (
        <div className="space-y-8 pb-32">
            <div>
                <p className="text-black/50 text-[10px] uppercase font-medium tracking-widest mb-6 border-b border-[#1a1a1a] pb-2">
                    {t('integrations.viewDescription')}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-[#1a1a1a] flex items-center gap-3 text-red-600 shadow-[0_2px_0_0_#1a1a1a] rounded-xl">
                        <AlertCircle size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {[
                        { id: 'instagram', name: 'Instagram', icon: Instagram, description: t('integrations.instagramDesc'), isAvailable: isAuthorized, color: '#E4405F', statusLabel: t('common.inTests') },
                        { id: 'twitch', name: 'Twitch', icon: Twitch, description: t('integrations.twitchDesc'), isAvailable: true, color: '#9146FF' },
                        { id: 'kick', name: 'Kick', icon: KickIcon, description: t('integrations.kickDesc'), isAvailable: true, color: '#53FC18' },
                        { id: 'tiktok', name: 'TikTok', icon: SiTiktok, description: t('integrations.tiktokDesc'), isAvailable: isAuthorized, color: '#000000', statusLabel: t('common.inTests') },
                        { id: 'youtube', name: 'YouTube', icon: Youtube, description: t('integrations.youtubeDesc'), isAvailable: true, color: '#FF0000', notice: t('social.youtubeBetaNotice') },
                        { id: 'spotify', name: 'Spotify', icon: SiSpotify, description: t('integrations.spotifyDesc'), isAvailable: false, color: '#1DB954', statusLabel: t('common.comingSoon') },
                        { id: 'twitter', name: 'X / Twitter', icon: Twitter, description: t('integrations.twitterDesc'), isAvailable: false, color: '#000000', statusLabel: t('common.comingSoon') }
                    ].sort((a, b) => {
                        const aConnected = !!getIntegrationData(a.id);
                        const bConnected = !!getIntegrationData(b.id);
                        if (aConnected && !bConnected) return -1;
                        if (!aConnected && bConnected) return 1;
                        return 0;
                    }).map(config => (
                        <IntegrationCard
                            key={config.id}
                            id={config.id}
                            name={config.name}
                            icon={config.icon}
                            description={config.description}
                            isConnected={!!getIntegrationData(config.id)}
                            isAvailable={config.isAvailable}
                            onConnect={config.isAvailable ? () => handleConnect(config.id) : () => { }}
                            onDisconnect={config.isAvailable ? () => handleDisconnect(config.id) : () => { }}
                            isLoading={loadingProvider === config.id}
                            profileData={getIntegrationData(config.id)?.profile_data}
                            color={config.color}
                            statusLabel={config.statusLabel}
                            notice={config.notice}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
};
