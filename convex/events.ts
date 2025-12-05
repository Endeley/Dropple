import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addEvent = mutation({
  args: {
    type: v.string(),
    actor: v.string(),
    layerId: v.optional(v.string()),
    payload: v.optional(v.any()),
  },
  handler: async ({ db }, evt) => {
    await db.insert("events", {
      ...evt,
      timestamp: Date.now(),
    });
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async ({ db }, { limit = 100 }) => {
    return await db
      .query("events")
      .withIndex("by_time")
      .order("desc")
      .take(limit);
  },
});
