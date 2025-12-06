import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveAudioAsset = mutation({
  args: {
    projectId: v.optional(v.string()),
    name: v.string(),
    url: v.string(),
    duration: v.number(),
    waveform: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("audioAssets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getAudioAsset = query({
  args: { id: v.id("audioAssets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listAudioAssets = query({
  args: { projectId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.projectId) return ctx.db.query("audioAssets").collect();
    return await ctx.db
      .query("audioAssets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});
