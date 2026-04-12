import { UserProfile, FontOption, Theme, Store, LinkItem } from '../types';
import { FONTS, THEMES } from '../constants';

/**
 * Checks if a specific theme is a PRO feature.
 */
export const isProTheme = (themeId: string): boolean => {
    if (themeId === 'custom') return true;
    const theme = THEMES.find(t => t.id === themeId);
    return theme?.isPro === true;
};

/**
 * Checks if a specific font is a PRO feature.
 */
export const isProFont = (fontFamily: string): boolean => {
    const font = FONTS.find(f => f.family === fontFamily);
    return font?.isPro === true;
};

/**
 * Checks if the profile configuration contains any PRO features.
 */
export const hasProFeatures = (profile: UserProfile): boolean => {
    if (isProTheme(profile.themeId)) return true;
    if (isProFont(profile.fontFamily)) return true;
    if (profile.headerStyle === 'logo') return true;
    if (profile.customButtonColor || profile.customTextColor || profile.customCollectionTextColor || profile.customButtonTextColor) return true;
    if (profile.headerLayout === 'compact' || profile.headerLayout === 'banner') return true;
    return false;
};

/**
 * Reconciles user configuration based on their current plan.
 * Handles both "Expiration" (resetting to free) and "Restoration" (returning to pro state).
 */
export const reconcileSubscription = (
    profile: UserProfile,
    stores: Store[],
    links: LinkItem[]
): { profile: UserProfile; stores: Store[]; links: LinkItem[] } => {
    const isFree = !profile.plan_type || profile.plan_type === 'free';
    let newProfile = { ...profile };
    let newStores = [...stores];
    let newLinks = [...links];

    if (isFree) {
        // --- EXPIRATION / CLEANUP (PRO -> FREE) ---

        // 1. Store Pro Theme choice before resetting
        if (isProTheme(profile.themeId)) {
            newProfile.lastProThemeId = profile.themeId;
            newProfile.themeId = 'brutalist-minimalist';
        }

        // 2. Store Pro Font choice before resetting
        if (isProFont(profile.fontFamily)) {
            newProfile.lastProFontFamily = profile.fontFamily;
            newProfile.fontFamily = "'Inter', sans-serif";
        }

        // 3. Reset Layouts
        if (profile.headerLayout === 'compact' || profile.headerLayout === 'banner') {
            newProfile.headerLayout = 'standard' as any;
        }

        // 4. Deactivate extra stores (Max 2 allowed)
        newStores = stores.map((store, index) => {
            if (index >= 2 && store.isActive) {
                return { ...store, isActive: false, deactivatedBySystem: true };
            }
            return store;
        });

        // 5. Deactivate Pro Link Types
        const proLinkTypes = ['agenda', 'mediakit', 'map'];
        newLinks = links.map(link => {
            if (link.type && proLinkTypes.includes(link.type) && link.isActive) {
                return { ...link, isActive: false };
            }
            return link;
        });

    } else {
        // --- RESTORATION (FREE -> PRO) ---

        // 1. Restore Theme if we have it in memory
        if (profile.lastProThemeId) {
            newProfile.themeId = profile.lastProThemeId;
            newProfile.lastProThemeId = null;
        }

        // 2. Restore Font if we have it in memory
        if (profile.lastProFontFamily) {
            newProfile.fontFamily = profile.lastProFontFamily;
            newProfile.lastProFontFamily = null;
        }

        // 3. Re-activate stores that were disabled by the system
        newStores = stores.map(store => {
            if (store.deactivatedBySystem) {
                return { ...store, isActive: true, deactivatedBySystem: false };
            }
            return store;
        });
    }

    return { profile: newProfile, stores: newStores, links: newLinks };
};

/**
 * Legacy stubs for backward compatibility if needed, but reconciled is preferred.
 */
export const sanitizeFreeProfile = (profile: UserProfile) => reconcileSubscription(profile, [], []).profile;
export const sanitizeFreeStores = (stores: Store[]) => reconcileSubscription({} as any, stores, []).stores;
