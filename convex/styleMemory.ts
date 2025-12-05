import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertMemory = mutation({
  args: {
    userId: v.string(),
    tokens: v.optional(v.any()),
    patterns: v.optional(v.any()),
    componentStyles: v.optional(v.any()),
    animationPrefs: v.optional(v.any()),
    interactionPrefs: v.optional(v.any()),
  },
  handler: async ({ db }, { userId, ...rest }) => {
    const existing = await db
      .query("style_memory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await db.patch(existing._id, { ...rest, lastUpdated: Date.now() });
      return existing._id;
    }

    return await db.insert("style_memory", {
      userId,
      ...rest,
      lastUpdated: Date.now(),
    });
  },
});

export const getMemory = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    return await db
      .query("style_memory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const logStyleEvent = mutation({
  args: {
    userId: v.string(),
    eventType: v.string(),
    data: v.any(),
  },
  handler: async ({ db }, { userId, eventType, data }) => {
    return await db.insert("style_events", {
      userId,
      eventType,
      data,
      timestamp: Date.now(),
    });
  },
});

export const listStyleEvents = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { userId, limit = 200 }) => {
    return await db
      .query("style_events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});
