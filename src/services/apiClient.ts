import { UserProfile, LinkItem, Product, SocialIntegration, Store } from '../types';

const rawUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://nodusback-production.up.railway.app');

// Ensure URL has protocol (prevent relative path issues)
export const API_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;


class ApiClient {
    private async getHeaders(isMultipart = false) {
        const token = localStorage.getItem('nodus_access_token');
        const headers: any = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
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
        const isFormData = options.body instanceof FormData;
        const token = localStorage.getItem('nodus_access_token');
        const baseHeaders: Record<string, string> = {};

        if (token) {
            baseHeaders['Authorization'] = `Bearer ${token}`;
        }
        // Do NOT set Content-Type for FormData — browser must set it with boundary
        if (!isFormData) {
            baseHeaders['Content-Type'] = 'application/json';
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        try {
            const response = await fetch(`${API_URL}${path}`, {
                ...options,
                cache: 'no-store',
                signal: controller.signal,
                headers: {
                    ...baseHeaders,
                    ...(options.headers || {})
                }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                // If it's a server error (5xx) and we have retries left, try again
                if (response.status >= 500 && retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                    return this.request(path, options, retries - 1);
                }

                // If 401, the Google token expired — dispatch a global event for AuthContext to handle
                // EXCEPTION: Don't trigger logout if it's a simple link password verification failure
                if (response.status === 401 && !path.includes('verify-password')) {
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
                    return this.request(path, options, retries - 1);
                }
                throw new Error('Timeout de conexão - O servidor demorou muito para responder.');
            }

            // Network error (not a fetch error response)
            if (retries > 0 && !(error.message?.includes('40'))) {
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

    async getPublicBootstrap(username: string): Promise<{ profile: UserProfile, links: LinkItem[], products: Product[], stores?: Store[] }> {
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
        try {
            // Track via link route (increments counter + inserts analytics event)
            await this.request(`/api/links/track/${id}`, {
                method: 'POST'
            });
        } catch (e: any) {
            // Silently fail or handle internally
        }
    }

    async uploadInternalAsset(file: File): Promise<{ success: boolean; file?: any; message?: string }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.request('/api/links/thumbnail', {
            method: 'POST',
            body: formData
        });
    }

    async proxyUploadAsset(url: string): Promise<{ success: boolean; file?: any; message?: string }> {
        return this.request('/api/links/proxy-thumbnail', {
            method: 'POST',
            body: JSON.stringify({ url })
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

    async replaceAllStores(stores: Store[]): Promise<Store[]> {
        return this.request('/api/products/stores/bulk', {
            method: 'PUT',
            body: JSON.stringify({ stores })
        });
    }

    // Admin
    async getAdminStats(): Promise<{
        summary: {
            totalUsers: number;
            proUsers: number;
            freeUsers: number;
            totalLinks: number;
            totalProducts: number;
            totalViews: number;
            totalClicks: number;
            globalCTR: string;
        };
        growth: {
            today: number;
            thisWeek: number;
        };
        latestUsers: {
            id: string;
            username: string;
            email: string;
            name: string;
            created_at: string;
            plan_type: string;
            bio?: string;
            avatar_url?: string;
            is_verified?: boolean;
            user_category?: string;
            links?: { count: number, type?: string }[];
            clicks?: { count: number }[];
            products?: { count: number }[];
            views?: number;
        }[];
    }> {
        return this.request('/api/admin/stats');
    }

    async updateAdminUser(userId: string, updates: any): Promise<any> {
        return this.request(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    async deleteAdminUser(userId: string): Promise<any> {
        return this.request(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
    }

    async getAdminUserStats(userId: string): Promise<any> {
        return this.request(`/api/admin/users/${userId}/stats`);
    }

    async createAdminUser(userData: any): Promise<any> {
        return this.request('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Verification Requests
    async submitVerificationRequest(data: {
        nodus_link: string;
        display_name: string;
        contact_email: string;
        category: string;
        social_link_1: string;
        social_link_2?: string;
        social_link_3?: string;
        has_verified_badge: boolean;
        press_link_1?: string;
        press_link_2?: string;
        press_link_3?: string;
    }): Promise<any> {
        return this.request('/api/verification/request', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getMyVerificationRequest(): Promise<any> {
        return this.request('/api/verification/my');
    }

    async getAdminVerifications(status?: string): Promise<any[]> {
        const qs = status ? `?status=${status}` : '';
        return this.request(`/api/admin/verifications${qs}`);
    }

    async reviewVerification(id: string, action: 'approve' | 'reject', reason?: string): Promise<any> {
        return this.request(`/api/admin/verifications/${id}/review`, {
            method: 'PATCH',
            body: JSON.stringify({ action, reason })
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

    async registerWithEmail(email: string, password: string, name: string, username: string): Promise<{ token: string; user: any }> {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, username })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status}`);
        }
        return data;
    }

    async requestPasswordReset(email: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/api/auth/request-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status}`);
        }
        return data;
    }

    async verifyResetCode(email: string, code: string): Promise<{ message: string; resetToken: string }> {
        const response = await fetch(`${API_URL}/api/auth/verify-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status}`);
        }
        return data;
    }

    async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resetToken, newPassword })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status}`);
        }
        return data;
    }

    async trackPageView(profileId: string, fingerprint?: string): Promise<void> {
        try {
            await this.request('/api/analytics/track-view', {
                method: 'POST',
                body: JSON.stringify({ profileId, fingerprint })
            });
        } catch (e: any) {
            // Silently fail or handle internally
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
        return this.request('/api/billing/p', {
            method: 'POST',
            body: JSON.stringify({ planId })
        });
    }




    async cancelSubscription(): Promise<any> {
        return this.request('/api/billing/cancel', {
            method: 'POST'
        });
    }

    async reactivateSubscription(): Promise<any> {
        return this.request('/api/billing/reactivate', {
            method: 'POST'
        });
    }
    async getInvoices(): Promise<any> {
        return this.request('/api/billing/invoices');
    }
    async createLead(profileId: string, email: string): Promise<any> {
        return this.request('/api/leads', {
            method: 'POST',
            body: JSON.stringify({ profileId, email })
        });
    }

    async autoReconcile(): Promise<UserProfile> {
        return this.request('/api/billing/auto-reconcile', {
            method: 'POST'
        });
    }

    async getBillingConfig(): Promise<{ gateway: string; env: string }> {
        return this.request('/api/billing/config');
    }

    async getStripeConfig(): Promise<any> {
        return this.getBillingConfig();
    }


    async getTikTokAuthUrl(userId: string, origin?: string): Promise<{ url: string }> {
        return this.request(`/api/integrations/tiktok/auth-url?userId=${userId}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`);
    }

    async getInstagramAuthUrl(userId: string, origin?: string): Promise<{ url: string }> {
        return this.request(`/api/integrations/instagram/auth-url?userId=${userId}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`);
    }

    async getTwitchAuthUrl(userId: string, origin?: string): Promise<{ url: string }> {
        return this.request(`/api/integrations/twitch/auth-url?userId=${userId}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`);
    }

    async getYoutubeAuthUrl(userId: string, origin?: string): Promise<{ url: string }> {
        return this.request(`/api/integrations/youtube/auth-url?userId=${userId}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`);
    }

    async getKickAuthUrl(userId: string, origin?: string): Promise<{ url: string }> {
        return this.request(`/api/integrations/kick/auth-url?userId=${userId}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`);
    }

    async connectKickAccount(username: string): Promise<any> {
        return this.request('/api/integrations/kick/connect', {
            method: 'POST',
            body: JSON.stringify({ username })
        });
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

    async getBootstrapData(): Promise<{ profile: UserProfile, links: LinkItem[], products: Product[], stores: Store[] }> {
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

    // File Management
    async listFiles(): Promise<{ success: boolean; files: any[] }> {
        return this.request('/api/files');
    }

    async uploadFile(file: File, type = 'user_upload', folder = ''): Promise<{ success: boolean; file?: any; message?: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const queryParams = new URLSearchParams({ type, folder }).toString();
        
        // Pass FormData directly — request() will auto-detect and skip Content-Type
        return this.request(`/api/files?${queryParams}`, {
            method: 'POST',
            body: formData
        });
    }

    async deleteFile(filename: string): Promise<{ success: boolean; message?: string }> {
        return this.request(`/api/files/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });
    }

    // Events (Agenda)
    async bulkUpsertEvents(collectionId: string, events: any[]): Promise<any[]> {
        return this.request('/api/events/bulk-upsert', {
            method: 'POST',
            body: JSON.stringify({ collectionId, events })
        });
    }

    // Blog
    async getAdminBlogPosts(): Promise<any[]> {
        return this.request('/api/blog/admin');
    }

    async getPublicBlogPosts(): Promise<any[]> {
        return this.request('/api/blog');
    }

    async getBlogPostBySlug(slug: string): Promise<any> {
        return this.request(`/api/blog/${slug}`);
    }

    async createBlogPost(post: any): Promise<any> {
        return this.request('/api/blog', {
            method: 'POST',
            body: JSON.stringify(post)
        });
    }

    async updateBlogPost(id: string, post: any): Promise<any> {
        return this.request(`/api/blog/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(post)
        });
    }

    async deleteBlogPost(id: string): Promise<any> {
        return this.request(`/api/blog/${id}`, {
            method: 'DELETE'
        });
    }

    async upvoteBlogPost(id: string, fingerprint: string): Promise<any> {
        return this.request(`/api/blog/${id}/upvote`, {
            method: 'POST',
            body: JSON.stringify({ fingerprint })
        });
    }

    async syncBlogCard(slug: string, imageData: string): Promise<any> {
        return this.request(`/api/files/sync-blog/${slug}`, {
            method: 'POST',
            body: JSON.stringify({ image: imageData })
        });
    }
    
    async syncProfileCard(username: string, imageData: string): Promise<any> {
        return this.request(`/api/files/sync-profile/${username}`, {
            method: 'POST',
            body: JSON.stringify({ image: imageData })
        });
    }

    async reorderBlogPosts(posts: any[]): Promise<any> {
        return this.request('/api/blog/reorder', {
            method: 'PUT',
            body: JSON.stringify({ posts })
        });
    }

    async trackBlogPostView(id: string): Promise<void> {
        try {
            await this.request(`/api/blog/${id}/view`, {
                method: 'POST'
            });
        } catch (e: any) { }
    }
    // SSE Subscriptions
    public subscribeToProfileUpdates(username: string, onUpdate: () => void): () => void {
        const eventSource = new EventSource(`${API_URL}/api/profile/realtime/${username}`);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'profile_update') {
                    onUpdate();
                }
            } catch (error) {
                console.error('SSE message parse error:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            // eventSource.close(); // Don't close, browser might retry
        };

        return () => {
            console.log(`Closing SSE connection for ${username}`);
            eventSource.close();
        };
    }

    // Onboarding
    async markUrlCopied(): Promise<void> {
        return this.request('/api/profile/onboarding/copy-url', { method: 'PATCH' });
    }

    async dismissOnboarding(): Promise<void> {
        return this.request('/api/profile/onboarding/dismiss', { method: 'PATCH' });
    }
}


export const apiClient = new ApiClient();
