import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLibraryAssets = query({
  args: {
    type: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let assets = await ctx.db.query("assetLibrary").collect();
    if (args.type) assets = assets.filter((a) => a.type === args.type);
    if (args.search) {
      const s = args.search.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          (a.description || "").toLowerCase().includes(s) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(s)),
      );
    }
    if (args.limit && args.limit > 0) {
      assets = assets.slice(0, args.limit);
    }
    return assets;
  },
});

export const createLibraryAsset = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    fileUrl: v.string(),
    previewUrl: v.string(),
    fileType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    packId: v.optional(v.string()),
    isPremium: v.boolean(),
    price: v.number(),
    source: v.optional(v.string()),
    license: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity?.();
    const userId = identity?.tokenIdentifier || "anonymous";
    return ctx.db.insert("assetLibrary", {
      ...args,
      userId,
      tags: args.tags || [],
      downloads: 0,
      favorites: 0,
      createdAt: Date.now(),
      isPremium: args.isPremium ?? false,
      price: args.price ?? 0,
      source: args.source,
      license: args.license,
    });
  },
});
