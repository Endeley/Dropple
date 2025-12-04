import { action, mutation, query, type ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

type UploadFile = {
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer;
};

type UploadImageResult = {
  assetId: Id<"assets">;
  url: string;
  size: number;
  type: string;
};

type UploadImageArgs = {
  file: UploadFile;
};

const uploadImageHandler = async (
  ctx: ActionCtx,
  { file }: UploadImageArgs,
): Promise<UploadImageResult> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const userId = identity.subject;

  const blob = new Blob([file.data], { type: file.type });
  const fileId = await ctx.storage.store(blob);
  const url = await ctx.storage.getUrl(fileId);
  if (!url) throw new Error("Failed to generate file URL");

  const assetId = (await ctx.runMutation(api.assets.recordAsset, {
    userId,
    fileId,
    url,
    filename: file.name,
    type: file.type,
    size: file.size,
  })) as Id<"assets">;

  return { assetId, url, size: file.size, type: file.type };
};

export const uploadImage = action({
  args: {
    file: v.object({
      name: v.string(),
      type: v.string(),
      size: v.number(),
      data: v.bytes(),
    }),
  },
  returns: v.object({
    assetId: v.id("assets"),
    url: v.string(),
  }),
  handler: uploadImageHandler,
});

export const recordAsset = mutation({
  args: {
    userId: v.string(),
    fileId: v.string(),
    url: v.string(),
    name: v.optional(v.string()),
    filename: v.string(),
    type: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    folder: v.optional(v.string()),
  },
  handler: async (
    { db },
    { userId, fileId, url, filename, type, size, name, width, height, tags, folder },
  ) => {
    return await db.insert("assets", {
      userId,
      fileId,
      url,
      name: name ?? filename,
      filename,
      type,
      size,
      width,
      height,
      tags: tags ?? [],
      folder,
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

export const createLibraryAsset = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    fileUrl: v.string(),
    previewUrl: v.string(),
    fileType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    packId: v.optional(v.string()),
    isPremium: v.optional(v.boolean()),
    price: v.optional(v.number()),
  },
  handler: async ({ db, auth }, payload) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const now = Date.now();

    return await db.insert("assetLibrary", {
      userId,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      tags: payload.tags || [],
      fileUrl: payload.fileUrl,
      previewUrl: payload.previewUrl,
      fileType: payload.fileType,
      size: payload.size,
      width: payload.width,
      height: payload.height,
      packId: payload.packId,
      isPremium: payload.isPremium ?? false,
      price: payload.price ?? 0,
      downloads: 0,
      favorites: 0,
      createdAt: now,
    });
  },
});

export const getLibraryAssets = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("assetLibrary").collect();
  },
});

export const getLibraryAsset = query({
  args: { id: v.id("assetLibrary") },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const incrementLibraryDownload = mutation({
  args: { id: v.id("assetLibrary") },
  handler: async ({ db }, { id }) => {
    const asset = await db.get(id);
    if (!asset) throw new Error("Asset not found");
    const downloads = asset.downloads ?? 0;
    await db.patch(id, { downloads: downloads + 1 });
  },
});

export const createAssetPack = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    coverImage: v.string(),
    price: v.optional(v.number()),
    isPremium: v.optional(v.boolean()),
    assets: v.array(v.string()),
  },
  handler: async ({ db, auth }, payload) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const now = Date.now();

    return await db.insert("assetPacks", {
      userId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      tags: payload.tags || [],
      coverImage: payload.coverImage,
      price: payload.price ?? 0,
      isPremium: payload.isPremium ?? false,
      assets: payload.assets || [],
      downloads: 0,
      favorites: 0,
      createdAt: now,
    });
  },
});

export const getAssetPack = query({
  args: { id: v.id("assetPacks") },
  handler: async ({ db }, { id }) => db.get(id),
});

export const getAssetPacks = query({
  args: {},
  handler: async ({ db }) => db.query("assetPacks").collect(),
});
