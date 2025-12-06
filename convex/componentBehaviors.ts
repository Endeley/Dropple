import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveComponentBehaviors = mutation({
  args: {
    componentId: v.string(),
    behaviors: v.array(
      v.object({
        type: v.string(),
        config: v.optional(v.any()),
        onTrigger: v.optional(v.string()),
        timelineId: v.optional(v.id("animations")),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("componentBehaviors")
      .withIndex("by_component", (q) => q.eq("componentId", args.componentId))
      .first();
    if (existing?._id) {
      await ctx.db.patch(existing._id, {
        behaviors: args.behaviors,
      });
      return existing._id;
    }
    return await ctx.db.insert("componentBehaviors", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getComponentBehaviors = query({
  args: { componentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("componentBehaviors")
      .withIndex("by_component", (q) => q.eq("componentId", args.componentId))
      .first();
  },
});
