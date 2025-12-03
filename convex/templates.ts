import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const layerSchema = v.object({
  id: v.string(),
  type: v.string(),
  x: v.number(),
  y: v.number(),
  width: v.number(),
  height: v.number(),
  rotation: v.optional(v.number()),
  url: v.optional(v.string()),
  content: v.optional(v.string()),
  props: v.optional(v.any()),
});

export const createTemplate = mutation({
  args: {
    templateData: v.object({
      name: v.string(),
      mode: v.string(),
      thumbnail: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      width: v.number(),
      height: v.number(),
      layers: v.array(layerSchema),
      price: v.optional(v.number()),
    }),
  },
  handler: async ({ db, auth }, { templateData }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const now = Date.now();

    return await db.insert("templates", {
      ...templateData,
      userId,
      tags: templateData.tags ?? [],
      createdAt: now,
      updatedAt: now,
      version: 1,
      isPublished: false,
    });
  },
});

export const updateTemplate = mutation({
  args: {
    id: v.id("templates"),
    data: v.any(),
  },
  handler: async ({ db }, { id, data }) => {
    return await db.patch(id, {
      ...data,
      updatedAt: Date.now(),
      version: (data?.version ?? 1) + 1,
    });
  },
});

export const updateLayers = mutation({
  args: {
    id: v.id("templates"),
    layers: v.array(layerSchema),
  },
  handler: async ({ db }, { id, layers }) => {
    return await db.patch(id, {
      layers,
      updatedAt: Date.now(),
    });
  },
});

export const publishTemplate = mutation({
  args: {
    id: v.id("templates"),
    price: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async ({ db }, { id, price, tags }) => {
    return await db.patch(id, {
      isPublished: true,
      price: price ?? 0,
      tags: tags ?? [],
      updatedAt: Date.now(),
    });
  },
});

export const getTemplate = query({
  args: { id: v.id("templates") },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const getUserTemplates = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db
      .query("templates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getMarketplaceTemplates = query({
  args: {},
  handler: async ({ db }) => {
    return await db
      .query("templates")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
  },
});
