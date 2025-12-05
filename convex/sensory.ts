import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const ingestInput = mutation({
  args: {
    kind: v.string(),
    source: v.optional(v.string()),
    refId: v.optional(v.string()),
    url: v.optional(v.string()),
    metadata: v.optional(v.any()),
    embedding: v.optional(v.array(v.number())),
  },
  handler: async ({ db }, args) => {
    return await db.insert("sensoryInputs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getInputs = query({
  args: { kind: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async ({ db }, { kind, limit = 50 }) => {
    const base = kind
      ? db.query("sensoryInputs").withIndex("by_kind", (q) => q.eq("kind", kind))
      : db.query("sensoryInputs");
    return await base.order("desc").take(limit);
  },
});

export const upsertSpatialGraph = mutation({
  args: {
    contextId: v.string(),
    nodes: v.any(),
    edges: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async ({ db }, { contextId, nodes, edges, metadata }) => {
    const existing = await db
      .query("spatialGraphs")
      .withIndex("by_context", (q) => q.eq("contextId", contextId))
      .first();

    if (existing) {
      await db.patch(existing._id, {
        nodes,
        edges,
        metadata,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await db.insert("spatialGraphs", {
      contextId,
      nodes,
      edges,
      metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getSpatialGraph = query({
  args: { contextId: v.string() },
  handler: async ({ db }, { contextId }) => {
    return await db
      .query("spatialGraphs")
      .withIndex("by_context", (q) => q.eq("contextId", contextId))
      .order("desc")
      .first();
  },
});
