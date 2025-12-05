import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addMessage = mutation({
  args: {
    agent: v.string(),
    content: v.string(),
    references: v.optional(v.any()),
  },
  handler: async ({ db }, message) => {
    return await db.insert("messages", {
      ...message,
      timestamp: Date.now(),
    });
  },
});

export const getMessages = query(async ({ db }) => {
  return await db.query("messages").order("asc").collect();
});
