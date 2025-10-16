import { THUMBNAIL_THEMES } from './thumbnailThemes';
import type { TemplateMetaRecord } from './catalogData';

// Deterministic hash + PRNG for slug-based variety --------------------------
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

const pick = <T,>(rand: () => number, arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

// Palette assignments --------------------------------------------------------
const PALETTES: Record<string, Array<(typeof THUMBNAIL_THEMES)[keyof typeof THUMBNAIL_THEMES]>> = {
    ecommerce: [THUMBNAIL_THEMES.sunsetGlow, THUMBNAIL_THEMES.neonTech, THUMBNAIL_THEMES.goldLuxe, THUMBNAIL_THEMES.oceanBlue, THUMBNAIL_THEMES.creativePop, THUMBNAIL_THEMES.silverMist],
    business: [THUMBNAIL_THEMES.modernIndigo, THUMBNAIL_THEMES.monoMinimal, THUMBNAIL_THEMES.midnight, THUMBNAIL_THEMES.silverMist, THUMBNAIL_THEMES.softNeutral, THUMBNAIL_THEMES.goldLuxe],
    resume: [THUMBNAIL_THEMES.monoMinimal, THUMBNAIL_THEMES.softNeutral, THUMBNAIL_THEMES.silverMist, THUMBNAIL_THEMES.modernIndigo],
    presentations: [THUMBNAIL_THEMES.modernIndigo, THUMBNAIL_THEMES.neonTech, THUMBNAIL_THEMES.cyberGrid, THUMBNAIL_THEMES.silverMist],
    marketing: [THUMBNAIL_THEMES.creativePop, THUMBNAIL_THEMES.sunsetGlow, THUMBNAIL_THEMES.coralBloom, THUMBNAIL_THEMES.pastelDream],
    invoices: [THUMBNAIL_THEMES.monoMinimal, THUMBNAIL_THEMES.minimalGrey, THUMBNAIL_THEMES.softNeutral, THUMBNAIL_THEMES.silverMist],
    ecommerce_email: [THUMBNAIL_THEMES.oceanBlue, THUMBNAIL_THEMES.neonTech, THUMBNAIL_THEMES.silverMist],
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

// Phrase grammars -----------------------------------------------------------
type GrammarConfig = {
    leadins: readonly string[];
    tails: readonly string[];
    verbs?: readonly string[];
    nouns?: readonly string[];
    nums?: readonly number[];
    q?: readonly number[];
};

const GRAMMAR: Record<string, GrammarConfig> = {
    ecommerce: {
        leadins: ['Deal', 'Save', 'Fresh Drop', 'Flash Sale', 'Just In', 'Only Today', 'Weekend Sale', 'Limited'],
        verbs: ['Save', 'Grab', 'Unlock', 'Shop', 'Snag', 'Claim', 'Score'],
        nouns: ['Up to {num}% Off', '{num}% Off', 'Free Shipping', 'New Arrivals', 'Bundle & Save'],
        tails: ['Ends Soon', 'While Stocks Last', 'Online Only', 'Members Only', 'Today Only'],
        nums: [20, 25, 30, 35, 40, 45, 50, 60, 70],
    },
    business: {
        leadins: ['Grow', 'Launch', 'Elevate', 'Scale', 'Refine', 'Simplify', 'Automate'],
        tails: ['Your Strategy', 'Your Team', 'Your Workflow', 'Your Pitch', 'Your Brand'],
    },
    resume: {
        leadins: ['Hire Me', 'Open to Work', 'Now Available', 'Let’s Talk', 'Ready to Lead'],
        tails: ['Product Manager', 'Designer', 'Engineer', 'Marketer', 'Analyst'],
    },
    presentations: {
        leadins: ['Q{q} Review', 'All Hands', 'Roadmap', 'Launch Plan', 'Strategy Deck'],
        tails: ['2025', 'Highlights', 'Metrics', 'What’s Next', 'Decisions'],
        q: [1, 2, 3, 4],
    },
    marketing: {
        leadins: ['New Collection', 'Spring Drop', 'Summer Heat', 'Holiday Sale', 'Back to School'],
        tails: ['Shop Now', 'Explore', 'Limited', 'Just Landed', 'Trending'],
    },
    invoices: {
        leadins: ['Invoice', 'Receipt', 'Statement', 'Quote', 'Pro-Forma'],
        tails: ['Paid', 'Due', 'Overdue', 'Draft', 'Approved'],
    },
    education: {
        leadins: ['Study Guide', 'Lesson Plan', 'Quiz Time', 'Exam Prep', 'Class Notes'],
        tails: ['Week {num}', 'Module {num}', 'Grade A Tips', 'For Teachers', 'For Students'],
        nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    realestate: {
        leadins: ['Open House', 'Just Listed', 'Move-In Ready', 'Luxury Living', 'New Build'],
        tails: ['Sat 11–2', 'Sun 1–4', 'Virtual Tour', 'View Today', 'Downtown'],
    },
    food: {
        leadins: ['Fresh Daily', 'Chef’s Special', '2 for 1', 'Happy Hour', 'New Menu'],
        tails: ['Order Now', 'Dine-In', 'Takeaway', 'Limited', 'Family Pack'],
    },
    medical: {
        leadins: ['Stay Healthy', 'Check-Up', 'Flu Shots', 'Dental Care', 'Wellness'],
        tails: ['Book Today', 'Walk-Ins Welcome', 'Open Late', 'Call Now', 'Insurance OK'],
    },
    travel: {
        leadins: ['Explore Bali', 'Paris Getaway', 'Tokyo Nights', 'Desert Escape', 'Island Hopping'],
        tails: ['Book Now', 'All-Inclusive', 'Early Bird', 'Last Minute', 'Guide Inside'],
    },
    photography: {
        leadins: ['Capture Life', 'Studio Ready', 'Golden Hour', 'Black & White', 'Portrait Set'],
        tails: ['Book a Shoot', 'Prints Available', 'Gallery Inside', 'New Series', 'Limited Edition'],
    },
    campaigns: {
        leadins: ['Be the Change', 'Act Now', 'Vote Today', 'Plant a Tree', 'Save the Ocean'],
        tails: ['Join Us', 'Volunteer', 'Share This', 'Spread the Word', 'Donate'],
    },
    tech: {
        leadins: ['AI Inside', 'Now Shipping', 'Beta Access', 'Developer Preview', 'v2.0'],
        tails: ['Try It', 'Docs Inside', 'Changelog', 'Open Source', 'Launch'],
    },
    logistics: {
        leadins: ['Fast Delivery', 'Global Reach', 'Track & Trace', 'Freight Ready', '24/7 Support'],
        tails: ['Get a Quote', 'Book Today', 'Express', 'Same-Day', 'Next-Day'],
    },
};

function buildLabel(category: string, rand: () => number): string {
    const g = GRAMMAR[category] ?? { leadins: ['Create'], tails: ['With Dropple'] };
    const lead = pick(rand, g.leadins);
    const tail = pick(rand, g.tails);

    if (category === 'ecommerce' && g.verbs && g.nouns) {
        const verb = pick(rand, g.verbs);
        const num = g.nums ? String(pick(rand, g.nums)) : '30';
        const noun = pick(rand, g.nouns).replace('{num}', num);
        return `${verb} ${noun}`;
    }

    if (category === 'presentations' && g.q) {
        const quarter = String(pick(rand, g.q));
        const base = lead.replace('{q}', quarter);
        return `${base} • ${pick(rand, g.tails)}`;
    }

    if (category === 'invoices') {
        return `${lead} • ${tail}`;
    }

    if (category === 'education' && g.nums) {
        const num = String(pick(rand, g.nums));
        return `${lead} • ${tail.replace('{num}', num)}`;
    }

    if (category === 'resume') {
        return `${lead} • ${tail}`;
    }

    return `${lead} • ${tail}`;
}

function pickPalette(category: string, rand: () => number) {
    const normalized = category.toLowerCase().replace(/\s+/g, '');
    const options = PALETTES[normalized] ?? PALETTES[category] ?? PALETTES.business;
    return pick(rand, options);
}

export function attachThumbnailsAndLabels<T extends TemplateMetaRecord>(templates: readonly T[]): T[] {
    return templates.map((t, index) => {
        const normalizedCategory = (t.category || 'business').toLowerCase().replace(/\s+/g, '');
        const seed = hash32(`${t.slug || t.title}-${index}`);
        const rand = rng(seed);

        const style =
            t.thumbnail && typeof t.thumbnail === 'object' && t.thumbnail.type === 'css'
                ? t.thumbnail.style
                : pickPalette(normalizedCategory, rand);

        const label = t.thumbnailLabel ?? buildLabel(normalizedCategory, rand);

        return {
            ...t,
            thumbnail: { type: 'css', style },
            thumbnailLabel: label,
        };
    });
}
