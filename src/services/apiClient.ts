import { UserProfile, LinkItem, Product, SocialIntegration } from '../types';

const rawUrl = import.meta.env.VITE_API_URL || 'https://nodusback-production.up.railway.app';

// Ensure URL has protocol (prevent relative path issues)
const API_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

console.log('📡 Nodus API Client using:', API_URL);

class ApiClient {
    private async getHeaders() {
        const token = localStorage.getItem('nodus_access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    public async get(path: string) {
        return this.request(path, { method: 'GET' });
    }

    public async post(path: string, body: any) {
        return this.request(path, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    private async request(path: string, options: RequestInit = {}) {
        const headers = await this.getHeaders();
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            const response = await fetch(`${API_URL}${path}`, {
                ...options,
                cache: 'no-store', // Prevent caching of API responses
                signal: controller.signal,
                headers: {
                    ...headers,
                    ...(options.headers || {})
                }
            });
            clearTimeout(id);

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : {};
        } catch (error: any) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('Connection timeout - Backend unresponsive');
            }
            throw error;
        }


    }

    // Profile
    async getMyProfile(): Promise<UserProfile> {
        const response = await this.request('/api/profile/me');
        return response;
    }

    async getPublicProfile(username: string): Promise<UserProfile> {
        const response = await fetch(`${API_URL}/api/profile/public/${username}`);
        if (!response.ok) throw new Error('Perfil não encontrado');
        return response.json();
    }

    async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
        return this.request('/api/profile/me', {
            method: 'PUT',
            body: JSON.stringify(profile)
        });
    }

    async checkUsername(username: string): Promise<{ available: boolean }> {
        const response = await fetch(`${API_URL}/api/profile/check-username/${username}`);
        if (!response.ok) throw new Error('Erro ao verificar username');
        return response.json();
    }

    // Links
    async getMyLinks(): Promise<LinkItem[]> {
        return this.request('/api/links/me');
    }

    async getPublicLinks(username: string): Promise<LinkItem[]> {
        const response = await fetch(`${API_URL}/api/links/public/${username}`);
        if (!response.ok) return [];
        return response.json();
    }

    async replaceAllLinks(links: LinkItem[]): Promise<LinkItem[]> {
        return this.request('/api/links/bulk', {
            method: 'PUT',
            body: JSON.stringify({ links })
        });
    }

    async trackClick(id: string): Promise<void> {
        return this.request(`/api/links/track/${id}`, {
            method: 'POST'
        });
    }

    // Products
    async getMyProducts(): Promise<Product[]> {
        return this.request('/api/products/me');
    }

    async getPublicProducts(username: string): Promise<Product[]> {
        const response = await fetch(`${API_URL}/api/products/public/${username}`);
        if (!response.ok) return [];
        return response.json();
    }

    async replaceAllProducts(products: Product[]): Promise<Product[]> {
        return this.request('/api/products/bulk', {
            method: 'PUT',
            body: JSON.stringify({ products })
        });
    }

    // Analytics
    async getAnalytics(days?: number): Promise<any> {
        return this.request(`/api/analytics/summary?days=${days || 14}`);
    }

    async trackPageView(profileId: string): Promise<void> {
        return this.request('/api/analytics/track-view', {
            method: 'POST',
            body: JSON.stringify({ profileId })
        });
    }

    // Leads
    async getMyLeads(): Promise<any[]> {
        return this.request('/api/leads/me');
    }

    async deleteLead(id: string): Promise<void> {
        return this.request(`/api/leads/${id}`, {
            method: 'DELETE'
        });
    }

    // Billing
    async createCheckoutSession(planId: string): Promise<{ url: string }> {
        return this.request('/api/billing/checkout', {
            method: 'POST',
            body: JSON.stringify({ planId })
        });
    }

    async createPortalSession(): Promise<{ url: string }> {
        return this.request('/api/billing/portal', {
            method: 'POST'
        });
    }

    async getInvoices(): Promise<any> {
        return this.request('/api/billing/invoices');
    }
    async createLead(profileId: string, email: string): Promise<any> {
        return this.request('/api/leads/subscribe', {
            method: 'POST',
            body: JSON.stringify({ profileId, email })
        });
    }

    async autoReconcile(): Promise<UserProfile> {
        return this.request('/api/billing/auto-reconcile', {
            method: 'POST'
        });
    }

    async getTikTokAuthUrl(userId: string): Promise<{ url: string }> {
        return this.request(`/api/integrations/tiktok/auth-url?userId=${userId}`);
    }

    async handleTikTokCallback(code: string, userId: string): Promise<any> {
        return this.request('/api/integrations/tiktok/callback', {
            method: 'POST',
            body: JSON.stringify({ code, userId })
        });
    }

    async getMyIntegrations(): Promise<SocialIntegration[]> {
        return this.request('/api/integrations/me');
    }
}


export const apiClient = new ApiClient();
