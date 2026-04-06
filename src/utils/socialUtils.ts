
import { API_URL } from '../services/apiClient';

export interface SocialMetadata {
    followers: string | null;
    platform: string;
    username?: string;
    avatarUrl?: string;
    url: string;
}

export const isYoutubeChannelUrl = (url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    if (!lowerUrl.includes('youtube.com') && !lowerUrl.includes('youtu.be')) return false;
    // If it's a video/short/live, it's not a "channel only" link for scraping
    return !lowerUrl.includes('/watch') && !lowerUrl.includes('/shorts/') && !lowerUrl.includes('/live/') && !lowerUrl.includes('youtu.be/');
};

export const fetchYoutubeChannelInfo = async (url: string): Promise<any | null> => {
    try {
        const response = await fetch(`${API_URL}/api/social/youtube?url=${encodeURIComponent(url)}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching YouTube channel info:', error);
        return null;
    }
};

export const fetchSocialMetadata = async (url: string): Promise<SocialMetadata | null> => {
    try {
        const response = await fetch(`${API_URL}/api/social/metadata?url=${encodeURIComponent(url)}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching social metadata:', error);
        return null;
    }
};

// Log helper to debug API responses
export const debugSocialFetch = async (url: string) => {
    console.log(`[SocialDebug] Iniciando busca para: ${url}`);
    const metadata = await fetchSocialMetadata(url);
    if (!metadata) {
        console.error('[SocialDebug] Falha total: O backend não retornou dados ou o link é inválido.');
    } else {
        console.log('[SocialDebug] Dados recebidos do backend:', metadata);
    }
    return metadata;
};
