import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_stack_user", (q) =>
        q.eq("stackUserId", identity.subject),
      )
      .unique();

    const patch = {
      stackUserId: identity.subject,
      email: identity.email ?? undefined,
      displayName: identity.name ?? undefined,
      avatarUrl: identity.pictureUrl ?? undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...patch,
      createdAt: Date.now(),
    });
  },
});
