import { getThemeByCategory } from './getThemeByCategory';
import { getRandomTheme } from './getRandomTheme';

/**
 * 🧠 Chooses a thumbnail theme using category as the primary signal with
 * an occasional random variation to keep the catalog feeling fresh.
 */
export function assignTemplateTheme(meta: { category?: string }) {
    const useRandom = Math.random() < 0.2;
    return useRandom ? getRandomTheme() : getThemeByCategory(meta.category ?? '');
}
