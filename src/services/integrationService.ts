
import { apiClient } from './apiClient';

export const integrationService = {
    getYouTubeAuthUrl: async () => {
        const response = await apiClient.get('/api/integrations/youtube/auth-url');
        return response.url;
    },

    connectYouTube: async (code: string, userId: string) => {
        return apiClient.post('/api/integrations/youtube/callback', { code, userId });
    }
};
