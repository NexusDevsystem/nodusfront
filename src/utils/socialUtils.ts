
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

// In-flight deduplication: prevents multiple simultaneous requests for the same URL
const igInflightRequests = new Map<string, Promise<any | null>>();
// Result cache: reuses results for 10 minutes
const igResultCache = new Map<string, { data: any; expiresAt: number }>();

export const fetchInstagramProfileInfo = async (url: string): Promise<any | null> => {
    const cacheKey = url.toLowerCase().trim();
    
    // Check result cache first
    const cached = igResultCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        console.log('[SocialUtils] IG cache hit for', cacheKey);
        return cached.data;
    }

    // Check if there's already an in-flight request for this URL
    if (igInflightRequests.has(cacheKey)) {
        console.log('[SocialUtils] IG deduplication: waiting for existing request for', cacheKey);
        return igInflightRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
        try {
            const response = await fetch(`${API_URL}/api/social/instagram?url=${encodeURIComponent(url)}`);
            if (!response.ok) return null;
            const data = await response.json();
            // Cache successful non-empty results for 30 seconds
            if (data && (data.name || data.avatarUrl || data.followers)) {
                igResultCache.set(cacheKey, { data, expiresAt: Date.now() + 30 * 1000 });
            }
            return data;
        } catch (error) {
            console.error('Error fetching Instagram profile info:', error);
            return null;
        } finally {
            igInflightRequests.delete(cacheKey);
        }
    })();

    igInflightRequests.set(cacheKey, requestPromise);
    return requestPromise;
};

const tiktokInflightRequests = new Map<string, Promise<any | null>>();
const tiktokResultCache = new Map<string, { data: any; expiresAt: number }>();

export const fetchTiktokProfileInfo = async (url: string): Promise<any | null> => {
    const cacheKey = url.toLowerCase().trim();
    
    // Check result cache
    const cached = tiktokResultCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    // Check in-flight
    if (tiktokInflightRequests.has(cacheKey)) {
        return tiktokInflightRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
        try {
            const response = await fetch(`${API_URL}/api/social/tiktok?url=${encodeURIComponent(url)}`);
            if (!response.ok) return null;
            const data = await response.json();
            if (data && (data.name || data.avatarUrl || data.followers)) {
                tiktokResultCache.set(cacheKey, { data, expiresAt: Date.now() + 30 * 1000 });
            }
            return data;
        } catch (error) {
            console.error('Error fetching TikTok profile info:', error);
            return null;
        } finally {
            tiktokInflightRequests.delete(cacheKey);
        }
    })();

    tiktokInflightRequests.set(cacheKey, requestPromise);
    return requestPromise;
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

/**
 * Checks if a link is incomplete (missing the specific ID/username/number)
 * @param url The final URL of the link
 * @param platform The platform ID (e.g. 'whatsapp', 'instagram')
 * @returns true if incomplete, false if it seems valid
 */
export const isLinkIncomplete = (url: string, platformId?: string): boolean => {
    if (!url || url.trim() === '') return true;

    // Common base URLs that indicate no ID was provided
    const basePaths = [
        'https://wa.me/', 'https://wa.me',
        'https://instagram.com/', 'https://instagram.com',
        'https://facebook.com/', 'https://facebook.com',
        'https://x.com/', 'https://x.com',
        'https://twitter.com/', 'https://twitter.com',
        'https://tiktok.com/@', 'https://tiktok.com/',
        'https://linkedin.com/in/', 'https://linkedin.com/',
        'https://t.me/',
        'https://youtube.com/@', 'https://youtube.com/channel/',
        'https://twitch.tv/',
        'https://kick.com/',
        'mailto:',
        'tel:',
        'https://',
        'http://'
    ];

    const trimmedUrl = url.trim().toLowerCase();
    
    // Exact match with any base path means no content added
    if (basePaths.some(path => trimmedUrl === path)) return true;

    // Special cases
    if (platformId === 'whatsapp' && (trimmedUrl === 'https://wa.me/' || trimmedUrl === 'https://wa.me')) return true;
    if (platformId === 'email' && trimmedUrl === 'mailto:') return true;
    if (platformId === 'telefone' && trimmedUrl === 'tel:') return true;

    return false;
};
