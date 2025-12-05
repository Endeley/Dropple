import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addToDebateRoom = mutation({
  args: {
    room: v.string(),
    message: v.object({
      agent: v.string(),
      content: v.string(),
    }),
  },
  handler: async ({ db }, { room, message }) => {
    await db.insert("messages", {
      agent: message.agent,
      content: message.content,
      room,
      timestamp: Date.now(),
    });
  },
});

export const getRoom = query({
  args: { room: v.string() },
  handler: async ({ db }, { room }) => {
    return await db
      .query("messages")
      .filter((q) => q.eq(q.field("room"), room))
      .collect();
  },
});
