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
import { apiClient } from '../services/apiClient';
import { UserProfile } from '../types';
import { useTranslation } from 'react-i18next';

interface IntegrationsViewProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
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
        <div className={`relative border-2 border-black bg-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
            {!isAvailable && (
                <div className="absolute top-2 right-2 z-20">
                    <div className="bg-black text-[#ffdf00] text-[8px] font-medium uppercase tracking-[0.2em] px-2 py-0.5 border border-black flex items-center gap-1">
                        <Lock size={8} /> {finalStatusLabel}
                    </div>
                </div>
            )}

            <div className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`} style={{ color: isAvailable ? color : "#ccc" }}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-black">{name}</h3>
                            <p className="text-[10px] text-black/50 uppercase tracking-wider font-medium line-clamp-1">{description}</p>
                        </div>
                    </div>
                    {isAvailable && isConnected && (
                        <div className="bg-[#97cd7a] p-1 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-black">
                            <Check size={12} strokeWidth={4} />
                        </div>
                    )}
                </div>

                {notice && (
                    <div className="mb-4 p-2.5 bg-yellow-50 border-2 border-black/10 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={12} className="text-yellow-600 shrink-0 mt-0.5" strokeWidth={3} />
                        <p className="text-[8px] font-normal text-yellow-800 uppercase tracking-widest leading-relaxed">
                            {notice}
                        </p>
                    </div>
                )}

                {isConnected && profileData && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 border border-black/10">
                        <div className="w-8 h-8 rounded-full border border-black overflow-hidden bg-white shrink-0">
                            <img
                                src={profileData.avatar_url || profileData.picture}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-tight truncate text-black leading-none">@{profileData.username || profileData.display_name}</p>
                            <p className="text-[8px] uppercase tracking-widest text-[#97cd7a] font-bold bg-black px-1 mt-0.5 w-fit">{t('common.connected')}</p>
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 flex flex-col gap-2">
                    {isAvailable ? (
                        isConnected ? (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="w-full py-2 bg-white hover:bg-red-50 text-red-600 border-2 border-black text-[9px] font-bold uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
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
                                            className="w-full py-2 bg-red-600 text-white border-2 border-black text-[9px] font-bold uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 disabled:opacity-50"
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
                                className="w-full py-3 bg-[#97cd7a] hover:bg-[#86b96b] text-black border-2 border-black text-[10px] font-bold uppercase tracking-[0.15em] transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 size={14} className="animate-spin" strokeWidth={3} /> : (
                                    <>
                                        {t('common.connectNow')} <ChevronRight size={14} strokeWidth={3} />
                                    </>
                                )}
                            </button>
                        )
                    ) : (
                        <div className="flex items-center justify-center py-3 px-4 bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            {t('common.blocked')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ profile, onChange }) => {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const integrations = profile.integrations || [];
    const isAuthorized = profile?.username === 'nodus' || profile?.username === 'nexus';

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
                <p className="text-black/50 text-[10px] uppercase font-medium tracking-widest mb-6 border-b border-black pb-2">
                    {t('integrations.viewDescription')}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-black flex items-center gap-3 text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <AlertCircle size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <IntegrationCard
                        id="instagram"
                        name="Instagram"
                        icon={Instagram}
                        description={t('integrations.instagramDesc')}
                        isConnected={!!getIntegrationData('instagram')}
                        isAvailable={isAuthorized}
                        onConnect={() => handleConnect('instagram')}
                        onDisconnect={() => handleDisconnect('instagram')}
                        isLoading={loadingProvider === 'instagram'}
                        profileData={getIntegrationData('instagram')?.profile_data}
                        color="#E4405F"
                        statusLabel={t('common.inTests')}
                    />

                    <IntegrationCard
                        id="twitch"
                        name="Twitch"
                        icon={Twitch}
                        description={t('integrations.twitchDesc')}
                        isConnected={!!getIntegrationData('twitch')}
                        isAvailable={true}
                        onConnect={() => handleConnect('twitch')}
                        onDisconnect={() => handleDisconnect('twitch')}
                        isLoading={loadingProvider === 'twitch'}
                        profileData={getIntegrationData('twitch')?.profile_data}
                        color="#9146FF"
                    />

                    <IntegrationCard
                        id="tiktok"
                        name="TikTok"
                        icon={SiTiktok}
                        description={t('integrations.tiktokDesc')}
                        isConnected={!!getIntegrationData('tiktok')}
                        isAvailable={isAuthorized}
                        onConnect={() => handleConnect('tiktok')}
                        onDisconnect={() => handleDisconnect('tiktok')}
                        isLoading={loadingProvider === 'tiktok'}
                        profileData={getIntegrationData('tiktok')?.profile_data}
                        color="#000000"
                        statusLabel={t('common.inTests')}
                    />

                    <IntegrationCard
                        id="youtube"
                        name="YouTube"
                        icon={Youtube}
                        description={t('integrations.youtubeDesc')}
                        isConnected={!!getIntegrationData('youtube')}
                        isAvailable={true}
                        onConnect={() => handleConnect('youtube')}
                        onDisconnect={() => handleDisconnect('youtube')}
                        isLoading={loadingProvider === 'youtube'}
                        profileData={getIntegrationData('youtube')?.profile_data}
                        color="#FF0000"
                        notice={t('social.youtubeBetaNotice')}
                    />

                    <IntegrationCard
                        id="spotify"
                        name="Spotify"
                        icon={SiSpotify}
                        description={t('integrations.spotifyDesc')}
                        isConnected={false}
                        isAvailable={false}
                        onConnect={() => { }}
                        onDisconnect={() => { }}
                        isLoading={false}
                        color="#1DB954"
                        statusLabel={t('common.comingSoon')}
                    />

                    <IntegrationCard
                        id="twitter"
                        name="X / Twitter"
                        icon={Twitter}
                        description={t('integrations.twitterDesc')}
                        isConnected={false}
                        isAvailable={false}
                        onConnect={() => { }}
                        onDisconnect={() => { }}
                        isLoading={false}
                        color="#000000"
                        statusLabel={t('common.comingSoon')}
                    />
                </div>
            </div>

        </div>
    );
};
