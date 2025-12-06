import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const savePageTransition = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    transitionIn: v.optional(v.any()),
    transitionOut: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pageTransitions")
      .withIndex("by_from_to", (q) => q.eq("from", args.from).eq("to", args.to))
      .first();

    if (existing?._id) {
      await ctx.db.patch(existing._id, {
        transitionIn: args.transitionIn,
        transitionOut: args.transitionOut,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("pageTransitions", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getPageTransition = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pageTransitions")
      .withIndex("by_from_to", (q) => q.eq("from", args.from).eq("to", args.to))
      .first();
  },
});
