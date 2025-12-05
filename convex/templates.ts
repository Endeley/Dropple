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

export const saveTemplate = mutation({
  args: {
    id: v.optional(v.id("templates")),
    name: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    authorId: v.optional(v.string()),
    templateData: v.any(),
    thumbnail: v.optional(v.string()),
    mode: v.string(),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const now = Date.now();

    if (args.id) {
      const existing = await db.get(args.id);
      if (!existing) throw new Error("Template not found");
      return await db.patch(args.id, {
        name: args.name,
        category: args.category,
        tags: args.tags ?? [],
        authorId: args.authorId ?? userId,
        templateData: args.templateData,
        thumbnail: args.thumbnail ?? undefined,
        mode: args.mode,
        version: (existing.version ?? 1) + 1,
        updatedAt: now,
      });
    }

    return await db.insert("templates", {
      name: args.name,
      mode: args.mode,
      category: args.category,
      tags: args.tags ?? [],
      authorId: args.authorId ?? userId,
      userId,
      templateData: args.templateData,
      thumbnail: args.thumbnail ?? undefined,
      isPublished: false,
      version: 1,
      createdAt: now,
      updatedAt: now,
      width: args.templateData?.width ?? 1080,
      height: args.templateData?.height ?? 1080,
      layers: args.templateData?.nodes ?? [],
      price: args.templateData?.price,
      purchases: 0,
    });
  },
});

export const publishTemplate = mutation({
  args: { id: v.id("templates") },
  handler: async ({ db }, { id }) => {
    return await db.patch(id, {
      isPublished: true,
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

export const listTemplates = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("templates").order("desc").collect();
  },
});
