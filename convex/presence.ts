import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPresence = query({
  args: { projectId: v.string() },
  handler: async ({ db }, { projectId }) => {
    return await db
      .query("presence")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const updatePresence = mutation({
  args: {
    projectId: v.string(),
    cursor: v.object({ x: v.number(), y: v.number() }),
    selection: v.array(v.string()),
  },
  handler: async ({ db, auth }, { projectId, cursor, selection }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const existing = await db
      .query("presence")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      return await db.patch(existing._id, {
        cursor,
        selection,
        lastActive: Date.now(),
      });
    }

    return await db.insert("presence", {
      userId,
      projectId,
      cursor,
      selection,
      lastActive: Date.now(),
    });
  },
});
