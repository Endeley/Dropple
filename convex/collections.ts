import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertCollection = mutation({
  args: {
    id: v.optional(v.id("templateCollections")),
    name: v.string(),
    thumbnailUrl: v.optional(v.string()),
    templateIds: v.array(v.string()),
    curated: v.optional(v.boolean()),
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
        curated: args.curated ?? false,
        updatedAt: now,
      });
    }
    return await db.insert("templateCollections", {
      name: args.name,
      thumbnailUrl: args.thumbnailUrl,
      templateIds: args.templateIds,
      curated: args.curated ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listCollections = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("templateCollections").collect();
  },
});
