import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveAnimation = mutation({
  args: {
    projectId: v.optional(v.string()),
    sceneId: v.string(),
    duration: v.number(),
    fps: v.number(),
    layers: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("animations")
      .withIndex("by_scene", (q) => q.eq("sceneId", args.sceneId))
      .first();

    if (existing?._id) {
      await ctx.db.patch(existing._id, {
        duration: args.duration,
        fps: args.fps,
        layers: args.layers,
        projectId: args.projectId ?? existing.projectId,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("animations", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getAnimation = query({
  args: { sceneId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("animations")
      .withIndex("by_scene", (q) => q.eq("sceneId", args.sceneId))
      .first();
  },
});
