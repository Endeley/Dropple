import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveWorkspace = mutation({
  args: { data: v.any() },
  handler: async ({ db }, { data }) => {
    await db.insert("snapshots", {
      data,
      createdAt: Date.now(),
    });

    await db.insert("workspace", {
      data,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const getWorkspace = query(async ({ db }) => {
  const [ws] = await db
    .query("workspace")
    .withIndex("by_updated")
    .order("desc")
    .take(1);
  return ws?.data ?? null;
});

export const watchWorkspace = query(async ({ db }) => {
  const [ws] = await db
    .query("workspace")
    .withIndex("by_updated")
    .order("desc")
    .take(1);
  return ws || null;
});
