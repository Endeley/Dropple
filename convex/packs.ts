import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createMotionPack = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    version: v.string(),
    authorId: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    contents: v.any(),
    previewUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("motionPacks", {
      ...args,
      downloads: 0,
      rating: args.rating ?? 5,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getPacksByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.query("motionPacks").withIndex("by_category", (q) => q.eq("category", args.category)).collect();
  },
});

export const recordDownload = mutation({
  args: { packId: v.id("motionPacks") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.packId);
    if (!doc) return;
    await ctx.db.patch(args.packId, { downloads: doc.downloads + 1, updatedAt: Date.now() });
  },
});

export const listPacks = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const base = ctx.db.query("motionPacks");
    if (args.category) {
      return base.withIndex("by_category", (q) => q.eq("category", args.category!)).collect();
    }
    return base.collect();
  },
});
