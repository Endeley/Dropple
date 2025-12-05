import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const publishModule = mutation({
  args: {
    name: v.string(),
    version: v.string(),
    json: v.any(),
    authorId: v.string(),
    type: v.string(),
  },
  handler: async ({ db }, args) => {
    const now = Date.now();
    const existing = await db
      .query("modules")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    }

    return await db.insert("modules", {
      ...args,
      createdAt: now,
      updatedAt: now,
      downloads: 0,
      rating: 0,
    });
  },
});

export const get = query({
  args: { id: v.id("modules") },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const list = query({
  args: {
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { type, limit = 50 }) => {
    const base = type
      ? db.query("modules").withIndex("by_type", (idx) => idx.eq("type", type))
      : db.query("modules");
    return await base.order("desc").take(limit);
  },
});
