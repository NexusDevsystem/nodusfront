export interface MusicMetadata {
    title: string;
    artist: string;
    thumbnailUrl: string;
    type: string;
    platform: 'spotify' | 'deezer';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
