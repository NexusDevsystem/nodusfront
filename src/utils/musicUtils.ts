export interface MusicMetadata {
    title: string;
    artist: string;
    thumbnailUrl: string;
    type: string;
    platform: 'spotify' | 'deezer' | 'youtube' | 'tiktok';
    tracks?: Array<{
        title: string;
        artist: string;
        url: string;
        image?: string;
        duration?: string;
    }>;
    resolvedUrl?: string;
    videoId?: string;
    videoUrl?: string;
    followers?: string;
}

import { API_URL } from '../services/apiClient';

export const fetchMusicMetadata = async (url: string): Promise<MusicMetadata | null> => {
    try {
        const response = await fetch(`${API_URL}/api/music/metadata?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            console.error('Failed to fetch music metadata via backend');
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching music metadata:', error);
        return null;
    }
};
