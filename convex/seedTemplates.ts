import { mutation } from './_generated/server';

import { ensureTemplateData, type LegacyTemplateLike, validateTemplateData } from './templateData';

type CategorySeed = {
    key: string;
    label: string;
    sortOrder: number;
    icon?: string | null;
};

type TemplateSeed = {
    slug: string;
    title: string;
    category: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    tags?: string[];
    isFeatured?: boolean;
    data: LegacyTemplateLike;
};

const CATEGORY_SEED: CategorySeed[] = [
    { key: 'popular', label: 'Popular', sortOrder: 0, icon: 'Sparkles' },
    { key: 'business', label: 'Business', sortOrder: 1, icon: 'Briefcase' },
    { key: 'enterprise', label: 'Enterprise', sortOrder: 2, icon: 'Building2' },
    { key: 'ecommerce', label: 'E-commerce', sortOrder: 3, icon: 'ShoppingCart' },
    { key: 'education', label: 'Education', sortOrder: 4, icon: 'GraduationCap' },
];

const TEMPLATE_SEED: TemplateSeed[] = [
    {
        slug: 'biz-pitch-deck-clean',
        title: 'Pitch Deck – Clean',
        category: 'business',
        description: 'Minimal, investor-friendly 12-slide deck.',
        tags: ['pitch', 'startup', 'deck'],
        isFeatured: true,
        data: {
            version: 1,
            canvas: { width: 1920, height: 1080 },
            elements: [],
        },
    },
    {
        slug: 'ent-report-annual',
        title: 'Annual Report – Enterprise',
        category: 'enterprise',
        description: 'Corporate report layout with robust typography.',
        tags: ['report', 'enterprise'],
        data: {
            version: 1,
            canvas: { width: 1920, height: 1080 },
            elements: [],
        },
    },
    {
        slug: 'ecom-ig-product-post',
        title: 'E-commerce Product Post',
        category: 'ecommerce',
        description: 'Instagram-ready product promo.',
        tags: ['product', 'instagram', 'promo'],
        isFeatured: true,
        data: {
            version: 1,
            canvas: { width: 1080, height: 1080 },
            elements: [],
        },
    },
    {
        slug: 'edu-webinar-invite',
        title: 'Webinar Invite – Education',
        category: 'education',
        description: 'Invite template for academic webinars.',
        tags: ['education', 'webinar'],
        data: {
            version: 1,
            canvas: { width: 1080, height: 1920 },
            elements: [],
        },
    },
    {
        slug: 'popular-minimal-promo',
        title: 'Minimal Promo',
        category: 'popular',
        description: 'Crowd-favourite minimal promo layout.',
        tags: ['promo', 'popular'],
        isFeatured: true,
        data: {
            version: 1,
            canvas: { width: 1080, height: 1080 },
            elements: [],
        },
    },
];

export const seedTemplateCategories = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        for (const cat of CATEGORY_SEED) {
            const existing = await ctx.db
                .query('templateCategories')
                .withIndex('by_key', (q: any) => q.eq('key', cat.key))
                .first();
            if (existing) {
                await ctx.db.patch(existing._id, {
                    label: cat.label,
                    sortOrder: cat.sortOrder,
                    icon: cat.icon ?? undefined,
                    isVisible: existing.isVisible ?? true,
                    updatedAt: now,
                });
            } else {
                await ctx.db.insert('templateCategories', {
                    key: cat.key,
                    label: cat.label,
                    sortOrder: cat.sortOrder,
                    icon: cat.icon ?? undefined,
                    description: undefined,
                    isVisible: true,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        return 'Template categories seeded';
    },
});

export const seedSampleTemplates = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        for (const tpl of TEMPLATE_SEED) {
            const normalizedData = ensureTemplateData(tpl.data, {
                artboardId: `ab-${tpl.slug}`,
                artboardName: tpl.title,
            });
            validateTemplateData(normalizedData);
            const existing = await ctx.db
                .query('templates')
                .withIndex('by_slug', (q: any) => q.eq('slug', tpl.slug))
                .first();
            if (existing) {
                await ctx.db.patch(existing._id, {
                    slug: tpl.slug,
                    title: tpl.title,
                    category: tpl.category,
                    description: tpl.description ?? undefined,
                    thumbnailUrl: tpl.thumbnailUrl ?? existing.thumbnailUrl,
                    tags: tpl.tags ?? existing.tags ?? [],
                    isFeatured: tpl.isFeatured ?? existing.isFeatured ?? false,
                    data: normalizedData,
                    updatedAt: now,
                });
            } else {
                await ctx.db.insert('templates', {
                    slug: tpl.slug,
                    title: tpl.title,
                    category: tpl.category,
                    description: tpl.description ?? undefined,
                    thumbnailUrl: tpl.thumbnailUrl ?? undefined,
                    tags: tpl.tags ?? [],
                    isFeatured: tpl.isFeatured ?? false,
                    data: normalizedData,
                    popularityScore: 0,
                    usageCount: 0,
                    isPremium: false,
                    status: 'active',
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        return 'Sample templates seeded';
    },
});
