import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateAssetMetadata = mutation({
  args: {
    id: v.id("assets"),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    waveform: v.optional(v.array(v.number())),
    thumbnail: v.optional(v.string()),
    thumbnails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...meta } = args;
    await ctx.db.patch(id, {
      ...meta,
      updatedAt: Date.now(),
    });
    return true;
  },
});
