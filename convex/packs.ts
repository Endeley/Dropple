import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertPack = mutation({
  args: {
    id: v.optional(v.id("templatePacks")),
    name: v.string(),
    thumbnailUrl: v.optional(v.string()),
    templateIds: v.array(v.string()),
    license: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const now = Date.now();
    if (args.id) {
      return await db.patch(args.id, {
        name: args.name,
        thumbnailUrl: args.thumbnailUrl,
        templateIds: args.templateIds,
        license: args.license,
        price: args.price,
        updatedAt: now,
      });
    }
    return await db.insert("templatePacks", {
      name: args.name,
      thumbnailUrl: args.thumbnailUrl,
      templateIds: args.templateIds,
      license: args.license,
      price: args.price,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listPacks = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("templatePacks").collect();
  },
});
