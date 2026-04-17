/**
 * 🔗 URL UTILS - Shared utility functions for URLs
 */

/**
 * Ensures URLs start with a protocol (http/https/mailto/tel/whatsapp)
 * so they don't break routing acting as relative paths.
 */
export const formatUrl = (url: string | undefined | null): string => {
    if (!url) return '';
    const trimmed = url.trim();
    
    // Check if it already has a protocol
    if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(trimmed)) {
        return trimmed;
    }
    
    // Default to https
    return `https://${trimmed}`;
};

/**
 * Extracts the domain from a URL for display purposes.
 */
export const getDomain = (url: string): string => {
    try {
        const domain = new URL(formatUrl(url)).hostname;
        return domain.replace('www.', '');
    } catch (e) {
        return url;
    }
};
