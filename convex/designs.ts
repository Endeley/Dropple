import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('designs')
            .withIndex('by_user', (q) => q.eq('userId', args.userId))
            .order('desc')
            .collect();
    },
});

export const create = mutation({
    args: {
        userId: v.id('users'),
        title: v.string(),
        pages: v.optional(v.array(v.any())),
        teamId: v.optional(v.id('teams')),
        layoutId: v.optional(v.id('layouts')),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        previewUrl: v.optional(v.string()),
        data: v.optional(v.any()),
        type: v.optional(v.string()),
        status: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        ownerUserId: v.optional(v.id('users')),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert('designs', {
            ...args,
            pages: args.pages ?? [],
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const getById = query({
    args: { id: v.id('designs') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const saveData = mutation({
    args: {
        id: v.id('designs'),
        data: v.any(),
        previewUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            data: args.data,
            previewUrl: args.previewUrl,
            updatedAt: Date.now(),
        });
        return args.id;
    },
});

export const update = mutation({
    args: {
        id: v.id('designs'),
        userId: v.optional(v.id('users')),
        title: v.optional(v.string()),
        pages: v.optional(v.array(v.any())),
        previewUrl: v.optional(v.string()),
        data: v.optional(v.any()),
        status: v.optional(v.string()),
        type: v.optional(v.string()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        thumbnailUrl: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        teamId: v.optional(v.id('teams')),
        layoutId: v.optional(v.id('layouts')),
        ownerUserId: v.optional(v.id('users')),
    },
    handler: async (ctx, args) => {
        const { id, ...changes } = args;
        await ctx.db.patch(id, { ...changes, updatedAt: Date.now() });
        return id;
    },
});

export const remove = mutation({
    args: {
        id: v.id('designs'),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
