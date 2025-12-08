import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRootCategories = query({
  handler: async (ctx) => {
    return ctx.db.query("categories").withIndex("by_parent", (q) => q.eq("parentId", undefined)).collect();
  },
});

export const getSubcategories = query({
  args: { parentId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.query("categories").withIndex("by_parent", (q) => q.eq("parentId", args.parentId)).collect();
  },
});

export const addCategory = mutation({
  args: {
    id: v.string(),
    label: v.string(),
    parentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("categories", { ...args, createdAt: now, updatedAt: now });
  },
});
