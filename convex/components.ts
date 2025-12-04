import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createComponent = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    nodes: v.array(v.any()),
    variants: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          nodes: v.array(v.any()),
        }),
      ),
    ),
  },
  handler: async ({ db, auth }, data) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db.insert("components", {
      userId,
      ...data,
      variants: data.variants ?? [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const addVariant = mutation({
  args: {
    componentId: v.id("components"),
    name: v.string(),
    nodes: v.array(v.any()),
    variantId: v.string(),
  },
  handler: async ({ db }, { componentId, name, nodes, variantId }) => {
    const component = await db.get(componentId);
    if (!component) {
      throw new Error("Component not found");
    }

    const newVariant = {
      id: variantId,
      name,
      nodes,
    };

    await db.patch(componentId, {
      variants: [...(component.variants || []), newVariant],
      updatedAt: Date.now(),
    });

    return newVariant;
  },
});

export const getUserComponents = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db
      .query("components")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getComponent = query({
  args: { id: v.id("components") },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const getMarketplaceComponents = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("components").collect();
  },
});

export const uploadComponent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    previewImage: v.optional(v.string()),
    componentJSON: v.optional(v.string()),
    nodes: v.optional(v.array(v.any())),
    variants: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          nodes: v.array(v.any()),
        }),
      ),
    ),
    isPremium: v.optional(v.boolean()),
    price: v.optional(v.number()),
  },
  handler: async ({ db, auth }, payload) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const now = Date.now();
    return await db.insert("components", {
      userId,
      name: payload.title,
      description: payload.description,
      category: payload.category,
      tags: payload.tags || [],
      previewImage: payload.previewImage,
      componentJSON: payload.componentJSON,
      nodes: payload.nodes || [],
      variants: payload.variants || [],
      isPremium: payload.isPremium ?? false,
      price: payload.price ?? 0,
      downloads: 0,
      favorites: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const incrementComponentDownload = mutation({
  args: { id: v.id("components") },
  handler: async ({ db }, { id }) => {
    const component = await db.get(id);
    if (!component) throw new Error("Component not found");

    const currentDownloads = component.downloads ?? 0;
    await db.patch(id, {
      downloads: currentDownloads + 1,
      updatedAt: Date.now(),
    });
  },
});
