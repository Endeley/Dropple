import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const enqueueRender = mutation({
  args: {
    type: v.string(),
    target: v.optional(v.string()),
    priority: v.optional(v.string()),
    sceneRef: v.optional(v.string()),
    payload: v.optional(v.any()),
  },
  handler: async ({ db }, args) => {
    const now = Date.now();
    return await db.insert("renderJobs", {
      ...args,
      status: "queued",
      result: null,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const takeNext = mutation({
  args: {},
  handler: async ({ db }) => {
    const job = await db
      .query("renderJobs")
      .withIndex("by_status", (q) => q.eq("status", "queued"))
      .order("asc")
      .first();
    if (!job) return null;
    await db.patch(job._id, { status: "rendering", updatedAt: Date.now() });
    return job;
  },
});

export const completeRender = mutation({
  args: {
    jobId: v.id("renderJobs"),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async ({ db }, { jobId, result, error }) => {
    await db.patch(jobId, {
      status: error ? "failed" : "completed",
      result: error ? { error } : result,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const listRenders = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async ({ db }, { status, limit = 50 }) => {
    const base = status
      ? db.query("renderJobs").withIndex("by_status", (q) => q.eq("status", status))
      : db.query("renderJobs");
    return await base.order("desc").take(limit);
  },
});
