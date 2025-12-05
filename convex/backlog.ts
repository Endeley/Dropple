import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addItem = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.number(),
    assignedTo: v.optional(v.string()),
  },
  handler: async ({ db }, item) => {
    return await db.insert("backlog", {
      ...item,
      status: "todo",
      createdAt: Date.now(),
    });
  },
});

export const getBacklog = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("backlog").withIndex("by_priority").collect();
  },
});
