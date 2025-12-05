import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertAgentMemory = mutation({
  args: {
    agentName: v.string(),
    runs: v.optional(v.number()),
    successes: v.optional(v.number()),
    failures: v.optional(v.number()),
    corrections: v.optional(v.any()),
    behaviorDeltas: v.optional(v.any()),
    skillWeights: v.optional(v.any()),
  },
  handler: async ({ db }, args) => {
    const existing = await db
      .query("agent_memory")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .first();

    if (existing) {
      const next = {
        runs: args.runs ?? existing.runs,
        successes: args.successes ?? existing.successes,
        failures: args.failures ?? existing.failures,
        corrections: args.corrections ?? existing.corrections,
        behaviorDeltas: args.behaviorDeltas ?? existing.behaviorDeltas,
        skillWeights: args.skillWeights ?? existing.skillWeights,
        lastUpdated: Date.now(),
      };
      await db.patch(existing._id, next);
      return existing._id;
    }

    return await db.insert("agent_memory", {
      agentName: args.agentName,
      runs: args.runs ?? 0,
      successes: args.successes ?? 0,
      failures: args.failures ?? 0,
      corrections: args.corrections ?? [],
      behaviorDeltas: args.behaviorDeltas ?? {},
      skillWeights: args.skillWeights ?? {},
      lastUpdated: Date.now(),
    });
  },
});

export const getAgentMemory = query({
  args: { agentName: v.string() },
  handler: async ({ db }, { agentName }) => {
    return await db
      .query("agent_memory")
      .withIndex("by_agent", (q) => q.eq("agentName", agentName))
      .first();
  },
});
