const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface YoutubeChannelInfo {
    name: string;
    avatarUrl: string;
    subscribers: string; // e.g. "1,2 mi inscritos" or "Canal do YouTube"
    platform: 'youtube';
    channelUrl: string;
}

/**
 * Detects if a URL is a YouTube channel (not a video/short/live).
 */
export const isYoutubeChannelUrl = (url: string): boolean => {
    if (!url) return false;
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    if (!isYoutube) return false;
    const isVideo = url.includes('watch?v=') || url.includes('/shorts/') || url.includes('/live/') || url.includes('youtu.be/');
    return !isVideo;
};

/**
 * Fetches YouTube channel metadata (name, avatar, subscriber count).
 * Uses the dedicated /api/social/youtube endpoint.
 */
export const fetchYoutubeChannelInfo = async (url: string): Promise<YoutubeChannelInfo | null> => {
    if (!isYoutubeChannelUrl(url)) return null;

    try {
        const response = await fetch(`${API_URL}/api/social/youtube?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            console.error('[socialUtils] Failed to fetch YouTube channel info:', response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('[socialUtils] Error fetching YouTube channel info:', error);
        return null;
    }
};
