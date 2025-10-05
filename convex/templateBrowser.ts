import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const categories = query({
    args: {},
    handler: async (ctx) => {
        const rows = await ctx.db.query('templateCategories').withIndex('by_sort').collect();
        const dynamic = rows
            .filter((row) => row.isVisible !== false)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((row) => ({ key: row.key, label: row.label, icon: row.icon ?? null }));

        const dedupe = new Map<string, { key: string; label: string; icon: string | null }>();

        const prepend = [
            { key: 'recent', label: 'Recently Added', icon: 'Clock' },
            { key: 'all', label: 'View All', icon: 'Rows3' },
        ];

        for (const item of [...prepend, ...dynamic]) {
            if (!dedupe.has(item.key)) {
                dedupe.set(item.key, item);
            }
        }

        return Array.from(dedupe.values());
    },
});

export const listByCategory = query({
    args: { key: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, { key, limit = 24 }) => {
        const items = await ctx.db
            .query('templates')
            .withIndex('by_category', (q) => q.eq('category', key))
            .collect();

        items.sort((a, b) => {
            const popDiff = (b.popularityScore ?? 0) - (a.popularityScore ?? 0);
            if (popDiff !== 0) return popDiff;
            const featuredDiff = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
            if (featuredDiff !== 0) return featuredDiff;
            return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
        });

        return items.slice(0, limit);
    },
});

export const listPopular = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 24 }) => {
        const items = await ctx.db.query('templates').withIndex('by_usage').collect();

        items.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));

        return items.slice(0, limit);
    },
});

export const listRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 24 }) => {
        const items = await ctx.db.query('templates').collect();
        items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        return items.slice(0, limit);
    },
});

export const listAll = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 48 }) => {
        const items = await ctx.db.query('templates').collect();
        items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        return limit ? items.slice(0, limit) : items;
    },
});

export const markTemplateUsed = mutation({
    args: { templateId: v.id('templates') },
    handler: async (ctx, { templateId }) => {
        const tpl = await ctx.db.get(templateId);
        if (!tpl) return;

        const usageCount = (tpl.usageCount ?? 0) + 1;
        const popularityScore = Math.round(usageCount * 0.7 + (tpl.isFeatured ? 10 : 0));

        await ctx.db.patch(templateId, {
            usageCount,
            popularityScore,
            updatedAt: Date.now(),
        });
    },
});
