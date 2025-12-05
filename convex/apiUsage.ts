import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const increment = mutation({
  args: { key: v.string(), agent: v.string() },
  handler: async ({ db }, { key, agent }) => {
    await db.insert("apiUsage", {
      key,
      agent,
      count: 1,
      timestamp: Date.now(),
    });
  },
});

export const getUsage = query({
  args: { key: v.string(), limit: v.optional(v.number()) },
  handler: async ({ db }, { key, limit = 100 }) => {
    return await db
      .query("apiUsage")
      .withIndex("by_key", (q) => q.eq("key", key))
      .order("desc")
      .take(limit);
  },
});
