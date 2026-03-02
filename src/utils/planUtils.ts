import { UserProfile, FontOption, Theme } from '../types';
import { FONTS, THEMES } from '../constants';

/**
 * Checks if a specific theme is a PRO feature.
 */
export const isProTheme = (themeId: string): boolean => {
    if (themeId === 'custom') return true; // Custom theme (unlimited edits) is a PRO feature
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
 * Checks if the profile configuration contains any PRO features
 * that should trigger the preview mode for free users.
 */
export const hasProFeatures = (profile: UserProfile): boolean => {
    // 1. Check Theme
    if (isProTheme(profile.themeId)) return true;

    // 2. Check Font
    if (isProFont(profile.fontFamily)) return true;

    // 3. Check for custom color overrides that typically belong to the "Custom" (PRO) theme logic
    // Even if themeId is not 'custom', if these are set, they might be remnants or PRO-level tweaks
    if (profile.customButtonColor || profile.customTextColor || profile.customCollectionTextColor || profile.customButtonTextColor) {
        return true;
    }

    return false;
};
