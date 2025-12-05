import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTeam = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    members: v.optional(v.any()),
    aiAgents: v.optional(v.any()),
    permissions: v.optional(v.any()),
  },
  handler: async ({ db }, { orgId, name, members, aiAgents, permissions }) => {
    return await db.insert("teams", {
      orgId,
      name,
      members: members || {},
      aiAgents: aiAgents || [],
      permissions: permissions || {},
      createdAt: Date.now(),
    });
  },
});

export const getTeams = query({
  args: { orgId: v.string() },
  handler: async ({ db }, { orgId }) => {
    return await db.query("teams").withIndex("by_org", (q) => q.eq("orgId", orgId)).collect();
  },
});
