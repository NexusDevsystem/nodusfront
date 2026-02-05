import { UserProfile, LinkItem, Product, AnalyticsEvent, NewsletterLead } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    // Profile
    async getProfile(): Promise<UserProfile> {
        return this.request<UserProfile>('/api/profile');
    }

    async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
        return this.request<UserProfile>('/api/profile', {
            method: 'PUT',
            body: JSON.stringify(profile),
        });
    }

    // Links
    async getLinks(): Promise<LinkItem[]> {
        return this.request<LinkItem[]>('/api/links');
    }

    async createLink(link: Omit<LinkItem, 'id'>): Promise<LinkItem> {
        return this.request<LinkItem>('/api/links', {
            method: 'POST',
            body: JSON.stringify(link),
        });
    }

    async updateLink(id: string, updates: Partial<LinkItem>): Promise<LinkItem> {
        return this.request<LinkItem>(`/api/links/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteLink(id: string): Promise<void> {
        return this.request<void>(`/api/links/${id}`, {
            method: 'DELETE',
        });
    }

    async replaceAllLinks(links: LinkItem[]): Promise<LinkItem[]> {
        return this.request<LinkItem[]>('/api/links/bulk', {
            method: 'PUT',
            body: JSON.stringify(links),
        });
    }

    // Products
    async getProducts(): Promise<Product[]> {
        return this.request<Product[]>('/api/products');
    }

    async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
        return this.request<Product>('/api/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
    }

    async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
        return this.request<Product>(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteProduct(id: string): Promise<void> {
        return this.request<void>(`/api/products/${id}`, {
            method: 'DELETE',
        });
    }

    async replaceAllProducts(products: Product[]): Promise<Product[]> {
        return this.request<Product[]>('/api/products/bulk', {
            method: 'PUT',
            body: JSON.stringify(products),
        });
    }

    // Analytics
    async getAnalytics(): Promise<AnalyticsEvent[]> {
        return this.request<AnalyticsEvent[]>('/api/analytics');
    }

    async trackClick(linkId: string): Promise<void> {
        return this.request<void>('/api/analytics/track', {
            method: 'POST',
            body: JSON.stringify({ linkId }),
        });
    }

    // Leads
    async getLeads(): Promise<NewsletterLead[]> {
        return this.request<NewsletterLead[]>('/api/leads');
    }

    async createLead(email: string, name?: string): Promise<NewsletterLead> {
        return this.request<NewsletterLead>('/api/leads', {
            method: 'POST',
            body: JSON.stringify({ email, name }),
        });
    }

    async deleteLead(id: string): Promise<void> {
        return this.request<void>(`/api/leads/${id}`, {
            method: 'DELETE',
        });
    }
}

export const apiClient = new ApiClient();
