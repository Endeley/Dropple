import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const startProcess = mutation({
  args: {
    pid: v.number(),
    agent: v.string(),
    priority: v.string(),
    state: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async ({ db }, { pid, agent, priority, state, metadata }) => {
    const now = Date.now();
    return await db.insert("processes", {
      pid,
      agent,
      priority,
      state: state || "running",
      cpu: 0,
      memory: 0,
      metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProcess = mutation({
  args: {
    pid: v.number(),
    state: v.optional(v.string()),
    cpu: v.optional(v.number()),
    memory: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async ({ db }, { pid, state, cpu, memory, metadata }) => {
    const proc = await db
      .query("processes")
      .withIndex("by_pid", (q) => q.eq("pid", pid))
      .first();
    const target = proc || (await db.query("processes").collect()).find((p) => p.pid === pid);
    if (!target) return null;
    return await db.patch(target._id, {
      state,
      cpu,
      memory,
      metadata,
      updatedAt: Date.now(),
    });
  },
});

export const emitEvent = mutation({
  args: {
    type: v.string(),
    payload: v.optional(v.any()),
    actor: v.optional(v.string()),
  },
  handler: async ({ db }, { type, payload, actor }) => {
    return await db.insert("systemEvents", {
      type,
      payload,
      actor,
      timestamp: Date.now(),
    });
  },
});

export const listProcesses = query({
  args: { limit: v.optional(v.number()) },
  handler: async ({ db }, { limit = 100 }) => {
    return await db.query("processes").order("desc").take(limit);
  },
});

export const listEvents = query({
  args: { type: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async ({ db }, { type, limit = 100 }) => {
    const base = type
      ? db.query("systemEvents").withIndex("by_type", (idx) => idx.eq("type", type))
      : db.query("systemEvents");
    return await base.order("desc").take(limit);
  },
});
