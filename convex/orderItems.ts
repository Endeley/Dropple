import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query('orderItems').collect();
    },
});

export const getById = query({
    args: { id: v.id('orderItems') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: { values: v.any() },
    handler: async (ctx, args) => {
        return await ctx.db.insert('orderItems', args.values);
    },
});

export const update = mutation({
    args: { id: v.id('orderItems'), patch: v.any() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, args.patch);
        return args.id;
    },
});

export const remove = mutation({
    args: { id: v.id('orderItems') },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
