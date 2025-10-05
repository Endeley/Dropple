import { mutation } from './_generated/server';
import { v } from 'convex/values';

import { ensureTemplateData, validateTemplateData } from './templateData';

export const seedOneTemplate = mutation({
    args: {
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const title = args.title ?? 'IG Minimal Promo';
        const slug = args.slug ?? 'ig-minimal-promo';
        const category = args.category ?? 'social/instagram-post';

        const existing = await ctx.db
            .query('templates')
            .withIndex('by_slug', (q) => q.eq('slug', slug))
            .first();
        if (existing) {
            return existing._id;
        }

        const now = Date.now();
        const data = ensureTemplateData(
            {
                version: 1,
                canvas: { width: 1080, height: 1080 },
                background: '#ffffff',
                elements: [
                    {
                        id: 'rect-hero',
                        type: 'rect',
                        position: { x: 80, y: 80 },
                        size: { width: 920, height: 400 },
                        fill: { type: 'solid', color: '#EEF2FF' },
                    },
                    {
                        id: 'headline',
                        type: 'text',
                        text: 'Weekend Sale',
                        position: { x: 120, y: 140 },
                        size: { width: 800, height: 80 },
                        fontFamily: 'Inter',
                        fontSize: 72,
                        color: '#111827',
                    },
                    {
                        id: 'subhead',
                        type: 'text',
                        text: 'Up to 40% off',
                        position: { x: 120, y: 230 },
                        size: { width: 600, height: 56 },
                        fontFamily: 'Inter',
                        fontSize: 48,
                        color: '#4F46E5',
                    },
                ],
            },
            { artboardId: 'ab-default', artboardName: '1080x1080' }
        );
        validateTemplateData(data);

        return await ctx.db.insert('templates', {
            title,
            slug,
            category,
            data,
            thumbnailUrl: undefined,
            tags: ['sale', 'instagram', 'promo'],
            status: 'active',
            isFeatured: true,
            isPremium: false,
            createdAt: now,
            updatedAt: now,
        });
    },
});
