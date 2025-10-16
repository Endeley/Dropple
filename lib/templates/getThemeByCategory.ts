import { THUMBNAIL_THEMES } from './thumbnailThemes';

/**
 * 🎨 Returns a thumbnail theme suited to the provided category.
 */
export function getThemeByCategory(category: string = '') {
    const key = category.toLowerCase();

    switch (key) {
        case 'business':
        case 'enterprise':
            return THUMBNAIL_THEMES.modernIndigo;
        case 'education':
            return THUMBNAIL_THEMES.pastelDream;
        case 'medical':
        case 'health':
        case 'wellness':
            return THUMBNAIL_THEMES.freshMint;
        case 'ecommerce':
        case 'marketing':
            return THUMBNAIL_THEMES.sunsetGlow;
        case 'real estate':
        case 'travel':
            return THUMBNAIL_THEMES.oceanBlue;
        case 'cultural':
        case 'heritage':
        case 'art':
            return THUMBNAIL_THEMES.warmEarth;
        case 'photography':
        case 'creative':
        case 'social':
            return THUMBNAIL_THEMES.creativePop;
        case 'tech':
        case 'ai':
        case 'transport':
        case 'logistics':
            return THUMBNAIL_THEMES.cyberGrid;
        case 'invoice':
        case 'document':
            return THUMBNAIL_THEMES.monoMinimal;
        case 'luxury':
        case 'brand':
            return THUMBNAIL_THEMES.goldLuxe;
        case 'campaigns':
        case 'campaign':
            return THUMBNAIL_THEMES.warmEarth;
        default:
            return THUMBNAIL_THEMES.softNeutral;
    }
}
