import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const updatePresence = mutation({
    args: {
        userId: v.optional(v.id('users')),
        userName: v.string(),
        userAvatar: v.optional(v.string()),
        designId: v.string(),
        cursor: v.optional(v.object({ x: v.number(), y: v.number() })),
        active: v.boolean(),
    },
    handler: async ({ db }, args) => {
        if (!args.userId) return;

        const existing = await db
            .query('presence')
            .withIndex('by_design', (q) => q.eq('designId', args.designId))
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .unique();

        if (existing) {
            await db.patch(existing._id, { ...args, updatedAt: Date.now() });
        } else {
            await db.insert('presence', { ...args, updatedAt: Date.now() });
        }
    },
});

export const list = query({
    args: { designId: v.string() },
    handler: async ({ db }, { designId }) => {
        const now = Date.now();
        const timeout = 10000;
        return await db
            .query('presence')
            .withIndex('by_design', (q) => q.eq('designId', designId))
            .filter((q) => q.gt(q.field('updatedAt'), now - timeout))
            .collect();
    },
});
