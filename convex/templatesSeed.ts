import { mutation } from './_generated/server';
import { TEMPLATE_META, type TemplateThumbnail } from '../lib/templates/catalogData';
import { ensureTemplateData, validateTemplateData } from './templateData';

export const seedFromCatalog = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        const resolveThumbnailUrl = (thumbnail: TemplateThumbnail | undefined): string | undefined => {
            if (!thumbnail) return undefined;
            if (typeof thumbnail === 'string') return thumbnail;
            if (thumbnail.type === 'image') return thumbnail.src;
            if (thumbnail.type === 'hybrid') return thumbnail.image?.src;
            return undefined;
        };

        for (const meta of TEMPLATE_META) {
            const existing = await ctx.db
                .query('templates')
                .withIndex('by_slug', (q) => q.eq('slug', meta.slug))
                .first();

            const rawData = (meta.defaultData as any) ?? {
                version: 1,
                title: meta.title,
                slug: meta.slug,
                category: meta.category,
                canvas: { width: 1080, height: 1080 },
                elements: [],
            };

            const normalizedData = ensureTemplateData(rawData, {
                artboardId: rawData?.defaultArtboardId ?? `ab-${meta.slug}`,
                artboardName: meta.title,
            });
            validateTemplateData(normalizedData);

            if (existing) {
                const update: Record<string, unknown> = {
                    title: meta.title,
                    slug: meta.slug,
                    category: meta.category,
                    tags: meta.tags ?? existing.tags ?? [],
                    thumbnailUrl: resolveThumbnailUrl(meta.thumbnail) ?? existing.thumbnailUrl,
                    data: normalizedData,
                    updatedAt: now,
                };

                await ctx.db.patch(existing._id, update);
            } else {
                await ctx.db.insert('templates', {
                    title: meta.title,
                    slug: meta.slug,
                    category: meta.category,
                    tags: meta.tags ?? [],
                    thumbnailUrl: resolveThumbnailUrl(meta.thumbnail),
                    data: normalizedData,
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
