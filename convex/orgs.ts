import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrg = mutation({
  args: {
    name: v.string(),
    ownerId: v.string(),
  },
  handler: async ({ db }, { name, ownerId }) => {
    return await db.insert("orgs", {
      name,
      ownerId,
      members: { [ownerId]: "owner" },
      teams: [],
      settings: {},
      createdAt: Date.now(),
    });
  },
});

export const listOrgs = query({
  args: { ownerId: v.optional(v.string()) },
  handler: async ({ db }, { ownerId }) => {
    if (ownerId) {
      return await db
        .query("orgs")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .collect();
    }
    return await db.query("orgs").collect();
  },
});
