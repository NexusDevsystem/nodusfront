import { UserProfile, LinkItem, Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
    private async getHeaders() {
        const token = localStorage.getItem('nodus_access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    private async request(path: string, options: RequestInit = {}) {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                ...headers,
                ...(options.headers || {})
            }
        });

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

        return response.json();
    }

    // Profile
    async getMyProfile(): Promise<UserProfile> {
        return this.request('/api/profile/me');
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
    async getAnalytics(): Promise<any[]> {
        return this.request('/api/analytics/summary');
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
}

export const apiClient = new ApiClient();
