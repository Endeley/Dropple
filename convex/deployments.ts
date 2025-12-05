import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const recordDeployment = mutation({
  args: {
    projectId: v.string(),
    target: v.string(),
    region: v.optional(v.string()),
    status: v.string(),
    url: v.optional(v.string()),
    error: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async ({ db }, args) => {
    const now = Date.now();
    return await db.insert("deployments", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDeployment = mutation({
  args: {
    id: v.id("deployments"),
    status: v.string(),
    url: v.optional(v.string()),
    error: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async ({ db }, { id, status, url, error, meta }) => {
    return await db.patch(id, {
      status,
      url,
      error,
      meta,
      updatedAt: Date.now(),
    });
  },
});

export const listByProject = query({
  args: { projectId: v.string(), limit: v.optional(v.number()) },
  handler: async ({ db }, { projectId, limit = 50 }) => {
    return await db
      .query("deployments")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .take(limit);
  },
});
