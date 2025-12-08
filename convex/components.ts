import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createComponent = mutation({
  args: {
    name: v.string(),
    projectId: v.optional(v.string()),
    authorId: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    nodes: v.array(v.any()),
    props: v.optional(v.any()),
    variants: v.optional(v.any()),
  },
  handler: async ({ db, auth }, data) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db.insert("components", {
      userId,
      authorId: data.authorId ?? userId,
      projectId: data.projectId,
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
    if (!identity) return [];
    const userId = identity.subject;

    return await db
      .query("components")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const saveComponent = mutation({
  args: {
    component: v.any(),
    projectId: v.optional(v.string()),
  },
  handler: async ({ db, auth }, { component, projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const now = Date.now();
    const existing = projectId
      ? await db
          .query("components")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .filter((q) => q.eq(q.field("name"), component.name || component._id || "component"))
          .first()
      : null;

    if (existing?._id) {
      await db.patch(existing._id, {
        nodes: component.nodes || [],
        variants: component.variants || [],
        tags: component.metadata?.tags || existing.tags || [],
        category: component.metadata?.category || existing.category || "component",
        updatedAt: now,
      });
      return existing._id;
    }

    return await db.insert("components", {
      userId,
      projectId,
      name: component.name || component._id || "component",
      description: component.metadata?.description,
      category: component.metadata?.category || "component",
      tags: component.metadata?.tags || [],
      nodes: component.nodes || [],
      variants: component.variants || [],
      tokens: component.tokens || {},
      previewImage: component.metadata?.previewImage,
      createdAt: now,
      updatedAt: now,
    });
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

export const listComponents = query(async ({ db }) => {
  return await db.query("components").collect();
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
