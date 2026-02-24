import { UserProfile, LinkItem, Product, SocialIntegration } from '../types';

const rawUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://nodusback-production.up.railway.app');

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

    private async request(path: string, options: RequestInit = {}, retries = 2): Promise<any> {
        const headers = await this.getHeaders();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        try {
            const response = await fetch(`${API_URL}${path}`, {
                ...options,
                cache: 'no-store',
                signal: controller.signal,
                headers: {
                    ...headers,
                    ...(options.headers || {})
                }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                // If it's a server error (5xx) and we have retries left, try again
                if (response.status >= 500 && retries > 0) {
                    console.warn(`⚠️ Server error ${response.status} on ${path}. Retrying... (${retries} left)`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                    return this.request(path, options, retries - 1);
                }

                // If 401, the Google token expired — dispatch a global event for AuthContext to handle
                if (response.status === 401) {
                    console.warn(`🔑 [ApiClient] 401 Unauthorized on ${path}. Dispatching session-expired event.`);
                    window.dispatchEvent(new CustomEvent('nodus:session-expired'));
                }

                const errorText = await response.text();
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || (typeof errorJson.error === 'string' ? errorJson.error : errorMessage);
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : {};
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                if (retries > 0) {
                    console.warn(`⏱️ Timeout on ${path}. Retrying... (${retries} left)`);
                    return this.request(path, options, retries - 1);
                }
                throw new Error('Timeout de conexão - O servidor demorou muito para responder.');
            }

            // Network error (not a fetch error response)
            if (retries > 0 && !(error.message?.includes('40'))) {
                console.warn(`🌐 Network error on ${path}. Retrying... (${retries} left)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.request(path, options, retries - 1);
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

    async getPublicBootstrap(username: string): Promise<{ profile: UserProfile, links: LinkItem[], products: Product[] }> {
        const response = await fetch(`${API_URL}/api/profile/public-bootstrap/${username}`);
        if (!response.ok) throw new Error('Falha ao carregar dados do perfil');
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
        console.log(`📊 [Nodus] Tracking click for item: ${id}`);
        try {
            // Track via link route (increments counter + inserts analytics event)
            await this.request(`/api/links/track/${id}`, {
                method: 'POST'
            });
            console.log(`✅ [Nodus] Click tracked for: ${id}`);
        } catch (e: any) {
            console.error(`❌ [Nodus] Failed to track click for ${id}:`, e?.message || e);
        }
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

    // Email/Password Auth - using plain fetch to bypass the 401 session-expired interceptor
    async loginWithEmail(email: string, password: string): Promise<{ token: string; user: any }> {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status}`);
        }
        return data;
    }

    async registerWithEmail(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status}`);
        }
        return data;
    }

    async trackPageView(profileId: string): Promise<void> {
        console.log(`📊 [Nodus] Tracking page view for profile: ${profileId}`);
        try {
            await this.request('/api/analytics/track-view', {
                method: 'POST',
                body: JSON.stringify({ profileId })
            });
            console.log(`✅ [Nodus] Page view tracked for: ${profileId}`);
        } catch (e: any) {
            console.error(`❌ [Nodus] Failed to track page view for ${profileId}:`, e?.message || e);
        }
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

    async getTikTokAuthUrl(userId: string, origin?: string): Promise<{ url: string }> {
        return this.request(`/api/integrations/tiktok/auth-url?userId=${userId}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`);
    }

    async getInstagramAuthUrl(userId: string, origin?: string): Promise<{ url: string }> {
        return this.request(`/api/integrations/instagram/auth-url?userId=${userId}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`);
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

    async getBootstrapData(): Promise<{ profile: UserProfile, links: LinkItem[], products: Product[] }> {
        return this.request('/api/profile/bootstrap');
    }

    async disconnectIntegration(provider: string): Promise<any> {
        return this.request(`/api/integrations/${provider}`, {
            method: 'DELETE'
        });
    }

    async switchInstagramAccount(channelId: string): Promise<any> {
        return this.request('/api/integrations/instagram/switch', {
            method: 'POST',
            body: JSON.stringify({ channelId })
        });
    }
}


export const apiClient = new ApiClient();
