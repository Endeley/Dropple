import { mutation } from './_generated/server';
import { TEMPLATE_META } from '../lib/templates/catalogData';

export const seedFromCatalog = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        for (const meta of TEMPLATE_META) {
            const existing = await ctx.db
                .query('templates')
                .withIndex('by_slug', (q) => q.eq('slug', meta.slug))
                .first();

            const defaultData = meta.defaultData ?? {
                title: meta.title,
                slug: meta.slug,
                category: meta.category,
            };

            if (existing) {
                const update: Record<string, unknown> = {
                    title: meta.title,
                    slug: meta.slug,
                    category: meta.category,
                    tags: meta.tags ?? existing.tags ?? [],
                    thumbnailUrl: meta.thumbnail ?? existing.thumbnailUrl,
                    updatedAt: now,
                };

                if (meta.defaultData) {
                    update.data = meta.defaultData;
                }

                await ctx.db.patch(existing._id, update);
            } else {
                await ctx.db.insert('templates', {
                    title: meta.title,
                    slug: meta.slug,
                    category: meta.category,
                    tags: meta.tags ?? [],
                    thumbnailUrl: meta.thumbnail ?? undefined,
                    data: defaultData,
                    createdAt: now,
                    updatedAt: now,
                    usageCount: 0,
                    popularityScore: 0,
                    isFeatured: false,
                    isPremium: false,
                    status: 'active',
                });
            }
        }

        return { processed: TEMPLATE_META.length };
    },
});
