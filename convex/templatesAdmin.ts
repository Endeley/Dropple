import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        category: v.string(),
        description: v.optional(v.string()),
        data: v.any(),
        tags: v.optional(v.array(v.string())),
        isFeatured: v.optional(v.boolean()),
        thumbnailUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('templates')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug))
            .first();
        if (existing) {
            throw new Error('Slug already exists');
        }

        const now = Date.now();

        return await ctx.db.insert('templates', {
            title: args.title,
            slug: args.slug,
            category: args.category,
            description: args.description ?? undefined,
            data: args.data,
            tags: args.tags ?? [],
            isFeatured: args.isFeatured ?? false,
            isPremium: false,
            thumbnailUrl: args.thumbnailUrl ?? undefined,
            popularityScore: 0,
            usageCount: 0,
            status: 'active',
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        templateId: v.id('templates'),
        patch: v.object({
            title: v.optional(v.string()),
            slug: v.optional(v.string()),
            category: v.optional(v.string()),
            description: v.optional(v.string()),
            data: v.optional(v.any()),
            tags: v.optional(v.array(v.string())),
            isFeatured: v.optional(v.boolean()),
            thumbnailUrl: v.optional(v.string()),
            status: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { templateId, patch }) => {
        const tpl = await ctx.db.get(templateId);
        if (!tpl) {
            throw new Error('Template not found');
        }

        await ctx.db.patch(templateId, {
            ...(patch.title !== undefined ? { title: patch.title } : {}),
            ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
            ...(patch.category !== undefined ? { category: patch.category } : {}),
            ...(patch.description !== undefined ? { description: patch.description } : {}),
            ...(patch.data !== undefined ? { data: patch.data } : {}),
            ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
            ...(patch.isFeatured !== undefined ? { isFeatured: patch.isFeatured } : {}),
            ...(patch.thumbnailUrl !== undefined ? { thumbnailUrl: patch.thumbnailUrl } : {}),
            ...(patch.status !== undefined ? { status: patch.status } : {}),
            updatedAt: Date.now(),
        });
    },
});

export const promoteDesign = mutation({
    args: {
        designId: v.id('designs'),
        slug: v.string(),
        category: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        isFeatured: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const design = await ctx.db.get(args.designId);
        if (!design) {
            throw new Error('Design not found');
        }

        const existing = await ctx.db
            .query('templates')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug))
            .first();
        if (existing) {
            throw new Error('Slug already exists');
        }

        const now = Date.now();

        return await ctx.db.insert('templates', {
            title: args.title ?? design.title ?? 'Untitled Template',
            slug: args.slug,
            category: args.category,
            description: args.description ?? design.data?.description ?? undefined,
            data: design.data ?? {},
            tags: args.tags ?? design.tags ?? [],
            isFeatured: args.isFeatured ?? false,
            isPremium: false,
            thumbnailUrl: args.thumbnailUrl ?? design.previewUrl ?? undefined,
            popularityScore: 0,
            usageCount: 0,
            status: 'active',
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const get = query({
    args: { templateId: v.id('templates') },
    handler: async (ctx, { templateId }) => {
        return await ctx.db.get(templateId);
    },
});
