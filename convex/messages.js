import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
    args: { threadId: v.string() },
    handler: async ({ db }, { threadId }) => {
        return await db
            .query('messages')
            .withIndex('by_thread_time', (q) => q.eq('threadId', threadId))
            .order('desc')
            .take(100);
    },
});

export const send = mutation({
    args: {
        threadId: v.string(),
        userId: v.optional(v.id('users')),
        userName: v.string(),
        userAvatar: v.optional(v.string()),
        text: v.string(),
    },
    handler: async ({ db }, args) => {
        if (!args.text?.trim()) return;
        await db.insert('messages', {
            ...args,
            createdAt: Date.now(),
        });
    },
});
