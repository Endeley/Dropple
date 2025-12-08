import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const uploadAsset = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    size: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    waveform: v.optional(v.array(v.number())),
    thumbnail: v.optional(v.string()),
    thumbnails: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity?.();
    const storageId = args.storageId;
    const resolvedUrl =
      args.url ||
      (storageId ? await ctx.storage.getUrl(storageId) : null) ||
      "";
    return ctx.db.insert("assets", {
      ...args,
      url: resolvedUrl,
      size: args.size ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: identity?.tokenIdentifier || "anonymous",
    });
  },
});

export const getAssets = query({
  args: {
    projectId: v.optional(v.id("projects")),
    type: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let assets = await ctx.db.query("assets").collect();
    if (args.projectId) assets = assets.filter((a) => a.projectId === args.projectId);
    if (args.type) assets = assets.filter((a) => a.type === args.type);
    if (args.search) {
      const s = args.search.toLowerCase();
      assets = assets.filter((a) => a.name.toLowerCase().includes(s));
    }
    return assets;
  },
});

export const getUserAssets = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    const userId = identity?.tokenIdentifier;
    if (!userId) return [];
    return await db.query("assets").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
  },
});

export const deleteAsset = mutation({
  args: { id: v.id("assets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
