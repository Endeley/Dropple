import { THUMBNAIL_THEMES } from './thumbnailThemes';

/**
 * 🎲 Returns a random thumbnail theme from the available library.
 */
export function getRandomTheme() {
    const keys = Object.keys(THUMBNAIL_THEMES) as Array<keyof typeof THUMBNAIL_THEMES>;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return THUMBNAIL_THEMES[randomKey];
}
