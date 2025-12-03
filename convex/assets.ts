import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const uploadImage = action({
  args: {
    file: v.object({
      name: v.string(),
      type: v.string(),
      size: v.number(),
      data: v.bytes(),
    }),
  },
  handler: async (ctx, { file }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const blob = new Blob([file.data], { type: file.type });
    const fileId = await ctx.storage.store(blob);
    const url = await ctx.storage.getUrl(fileId);
    if (!url) throw new Error("Failed to generate file URL");

    const assetId = await ctx.runMutation(api.assets.recordAsset, {
      userId,
      fileId,
      url,
      filename: file.name,
      type: file.type,
      size: file.size,
    });

    return { assetId, url };
  },
});

export const recordAsset = mutation({
  args: {
    userId: v.string(),
    fileId: v.string(),
    url: v.string(),
    filename: v.string(),
    type: v.string(),
    size: v.number(),
  },
  handler: async ({ db }, { userId, fileId, url, filename, type, size }) => {
    return await db.insert("assets", {
      userId,
      fileId,
      url,
      filename,
      type,
      size,
      createdAt: Date.now(),
    });
  },
});

export const getUserAssets = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db
      .query("assets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
