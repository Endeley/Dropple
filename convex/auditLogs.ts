import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logAction = mutation({
  args: {
    orgId: v.string(),
    actor: v.string(),
    action: v.string(),
    data: v.optional(v.any()),
  },
  handler: async ({ db }, { orgId, actor, action, data }) => {
    return await db.insert("auditLogs", {
      orgId,
      actor,
      action,
      data,
      timestamp: Date.now(),
    });
  },
});

export const listByOrg = query({
  args: { orgId: v.string(), limit: v.optional(v.number()) },
  handler: async ({ db }, { orgId, limit = 200 }) => {
    return await db
      .query("auditLogs")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .take(limit);
  },
});
