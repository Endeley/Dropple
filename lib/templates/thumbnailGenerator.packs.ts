// 🧩 Deterministic label + CSS thumbnail using fixed phrase packs
import { THUMBNAIL_THEMES } from './thumbnailThemes';
import { PHRASE_PACKS, NUMBER_POOL, QUARTERS, CITIES } from './thumbnailPhrases';
import type { TemplateMetaRecord } from './catalogData';

// --- deterministic helpers -------------------------------------------------
function hash32(str: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function rng(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
        s ^= s << 13;
        s >>>= 0;
        s ^= s >> 17;
        s >>>= 0;
        s ^= s << 5;
        s >>>= 0;
        return (s >>> 0) / 4294967296;
    };
}

const pick = <T,>(rand: () => number, arr: readonly T[]): T => {
    const idx = Math.floor(rand() * arr.length) % arr.length;
    return arr[idx];
};

// --- palettes per category (reuse your CSS themes) -------------------------
type ThemeStyle = (typeof THUMBNAIL_THEMES)[keyof typeof THUMBNAIL_THEMES];

const PALETTES: Record<string, readonly ThemeStyle[]> = {
    ecommerce: [THUMBNAIL_THEMES.sunsetGlow, THUMBNAIL_THEMES.neonTech, THUMBNAIL_THEMES.goldLuxe, THUMBNAIL_THEMES.oceanBlue, THUMBNAIL_THEMES.creativePop, THUMBNAIL_THEMES.silverMist],
    business: [THUMBNAIL_THEMES.modernIndigo, THUMBNAIL_THEMES.monoMinimal, THUMBNAIL_THEMES.midnight, THUMBNAIL_THEMES.silverMist, THUMBNAIL_THEMES.softNeutral, THUMBNAIL_THEMES.goldLuxe],
    resume: [THUMBNAIL_THEMES.monoMinimal, THUMBNAIL_THEMES.softNeutral, THUMBNAIL_THEMES.silverMist, THUMBNAIL_THEMES.modernIndigo],
    presentations: [THUMBNAIL_THEMES.modernIndigo, THUMBNAIL_THEMES.neonTech, THUMBNAIL_THEMES.cyberGrid, THUMBNAIL_THEMES.silverMist],
    marketing: [THUMBNAIL_THEMES.creativePop, THUMBNAIL_THEMES.sunsetGlow, THUMBNAIL_THEMES.coralBloom, THUMBNAIL_THEMES.pastelDream],
    invoices: [THUMBNAIL_THEMES.monoMinimal, THUMBNAIL_THEMES.minimalGrey, THUMBNAIL_THEMES.softNeutral, THUMBNAIL_THEMES.silverMist],
    education: [THUMBNAIL_THEMES.pastelDream, THUMBNAIL_THEMES.freshMint, THUMBNAIL_THEMES.softNeutral],
    realestate: [THUMBNAIL_THEMES.deepOcean, THUMBNAIL_THEMES.oceanBlue, THUMBNAIL_THEMES.goldLuxe, THUMBNAIL_THEMES.silverMist],
    food: [THUMBNAIL_THEMES.coralBloom, THUMBNAIL_THEMES.sunsetGlow, THUMBNAIL_THEMES.pastelDream],
    medical: [THUMBNAIL_THEMES.freshMint, THUMBNAIL_THEMES.oceanBlue, THUMBNAIL_THEMES.silverMist],
    travel: [THUMBNAIL_THEMES.oceanBlue, THUMBNAIL_THEMES.deepOcean, THUMBNAIL_THEMES.sunsetGlow, THUMBNAIL_THEMES.pastelDream],
    photography: [THUMBNAIL_THEMES.coralBloom, THUMBNAIL_THEMES.modernIndigo, THUMBNAIL_THEMES.midnight],
    campaigns: [THUMBNAIL_THEMES.sunsetGlow, THUMBNAIL_THEMES.creativePop, THUMBNAIL_THEMES.warmEarth],
    tech: [THUMBNAIL_THEMES.neonTech, THUMBNAIL_THEMES.cyberGrid, THUMBNAIL_THEMES.silverMist],
    logistics: [THUMBNAIL_THEMES.deepOcean, THUMBNAIL_THEMES.midnight, THUMBNAIL_THEMES.goldLuxe],
};

// Normalize category key so ecommerce_email -> ecommerceemail, etc.
const normalizeCategory = (category?: string): string => (category ?? 'business').toLowerCase().replace(/\s+/g, '');

// Fill placeholders in phrase ------------------------------------------------
function fillPlaceholders(template: string, rand: () => number): string {
    const num = pick(rand, NUMBER_POOL);
    const q = pick(rand, QUARTERS);
    const city = pick(rand, CITIES);
    return template.replaceAll('{num}', String(num)).replaceAll('{q}', String(q)).replaceAll('{city}', city);
}

// Ensure higher uniqueness: rotate selection index by seed & index -----------
function pickStable<T>(rand: () => number, arr: readonly T[], offset: number): T {
    if (!arr.length) {
        throw new Error('pickStable called with empty array');
    }
    const base = Math.floor(rand() * arr.length);
    return arr[(base + offset) % arr.length];
}

/**
 * attachThumbnailsAndFixedLabels
 * Adds: thumbnail (CSS) + thumbnailLabel (bold text) to each template.
 * Deterministic per slug/title/index so 2,000 items remain stable.
 */
export function attachThumbnailsAndFixedLabels<T extends TemplateMetaRecord>(templates: readonly T[]): T[] {
    return templates.map((template, index) => {
        const cat = normalizeCategory(template.category);
        const pack = PHRASE_PACKS[cat as keyof typeof PHRASE_PACKS] ?? PHRASE_PACKS.business;
        const seed = hash32(`${template.slug || template.title || 'template'}#${index}`);
        const rand = rng(seed);

        const paletteGroup = PALETTES[cat] ?? PALETTES.business;
        const hasCustomThumbnail =
            typeof template.thumbnail === 'string' ||
            (template.thumbnail && typeof template.thumbnail === 'object' && template.thumbnail.type && template.thumbnail.type !== 'css');
        const style =
            template.thumbnail && typeof template.thumbnail === 'object' && template.thumbnail.type === 'css'
                ? template.thumbnail.style
                : pickStable(rand, paletteGroup, index % paletteGroup.length);

        const basePhrase = template.thumbnailLabel ?? pickStable(rand, pack, index % pack.length);
        const label = fillPlaceholders(basePhrase, rand);

        if (hasCustomThumbnail) {
            return {
                ...template,
                thumbnailLabel: label,
            };
        }

        return {
            ...template,
            thumbnail: { type: 'css' as const, style },
            thumbnailLabel: label,
        };
    });
}
