import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertPolicy = mutation({
  args: {
    orgId: v.string(),
    rules: v.any(),
  },
  handler: async ({ db }, { orgId, rules }) => {
    const existing = await db
      .query("aiPolicies")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .first();
    const now = Date.now();
    if (existing) {
      await db.patch(existing._id, { rules, updatedAt: now });
      return existing._id;
    }
    return await db.insert("aiPolicies", {
      orgId,
      rules,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getPolicy = query({
  args: { orgId: v.string() },
  handler: async ({ db }, { orgId }) => {
    return await db
      .query("aiPolicies")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .first();
  },
});
