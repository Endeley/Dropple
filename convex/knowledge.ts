import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addNode = mutation({
  args: {
    nodeId: v.string(),
    category: v.string(),
    content: v.string(),
    embedding: v.optional(v.array(v.number())),
    confidence: v.number(),
    sourceAgent: v.string(),
    relations: v.optional(v.any()),
    projectsUsedIn: v.optional(v.any()),
  },
  handler: async ({ db }, args) => {
    const now = Date.now();
    const existing = await db
      .query("knowledge_nodes")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .first();

    if (existing) {
      await db.patch(existing._id, { ...args, lastUpdated: now });
      return existing._id;
    }

    return await db.insert("knowledge_nodes", {
      ...args,
      lastUpdated: now,
    });
  },
});

export const addRelation = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    relation: v.string(),
    weight: v.number(),
  },
  handler: async ({ db }, { from, to, relation, weight }) => {
    return await db.insert("knowledge_relations", {
      from,
      to,
      relation,
      weight,
      lastUpdated: Date.now(),
    });
  },
});

export const search = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { category, limit = 20 }) => {
    const base = category
      ? db.query("knowledge_nodes").withIndex("by_category", (idx) => idx.eq("category", category))
      : db.query("knowledge_nodes");
    return await base.order("desc").take(limit);
  },
});
