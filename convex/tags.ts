import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTagsByGroup = query({
  args: { group: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.query("tags").withIndex("by_group", (q) => q.eq("group", args.group)).collect();
  },
});

export const addTag = mutation({
  args: {
    id: v.string(),
    group: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("tags", args);
  },
});
