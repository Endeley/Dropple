import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const registerNewUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        picture: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('email'), args.email))
            .collect();

        if (existingUser.length === 0) {
            const userId = await ctx.db.insert('users', {
                name: args.name,
                email: args.email,
                picture: args.picture,
            });

            return {
                status: 'created',
                userId,
            };
        }

        return {
            status: 'exists',
            user: existingUser[0],
        };
    },
});
