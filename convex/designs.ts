import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

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
