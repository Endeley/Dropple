import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getByStackUserId = query({
    args: { stackUserId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('users')
            .withIndex('by_stack_user', (q) => q.eq('stackUserId', args.stackUserId))
            .unique();
    },
});

export const listRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;

        return await ctx.db
            .query('users')
            .withIndex('by_last_seen')
            .order('desc')
            .take(limit);
    },
});

export const upsert = mutation({
    args: {
        stackUserId: v.string(),
        displayName: v.string(),
        primaryEmail: v.string(),
        profileImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const existing = await ctx.db
            .query('users')
            .withIndex('by_stack_user', (q) => q.eq('stackUserId', args.stackUserId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                displayName: args.displayName,
                primaryEmail: args.primaryEmail,
                profileImageUrl: args.profileImageUrl,
                lastSeenAt: now,
                updatedAt: now,
                email: args.primaryEmail,
                name: args.displayName,
            });
            return existing._id;
        }

        return await ctx.db.insert('users', {
            stackUserId: args.stackUserId,
            displayName: args.displayName,
            primaryEmail: args.primaryEmail,
            profileImageUrl: args.profileImageUrl,
            lastSeenAt: now,
            createdAt: now,
            updatedAt: now,
            email: args.primaryEmail,
            name: args.displayName,
        });
    },
});
