import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createComponent = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    nodes: v.array(v.any()),
    variants: v.optional(v.any()),
  },
  handler: async ({ db, auth }, data) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db.insert("components", {
      userId,
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
