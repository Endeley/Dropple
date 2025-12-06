import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveStateMachine = mutation({
  args: {
    componentId: v.string(),
    states: v.array(v.string()),
    transitions: v.array(
      v.object({
        from: v.string(),
        to: v.string(),
        trigger: v.string(),
        condition: v.optional(v.string()),
        timelineId: v.optional(v.id("animations")),
      }),
    ),
    variables: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stateMachines")
      .withIndex("by_component", (q) => q.eq("componentId", args.componentId))
      .first();

    if (existing?._id) {
      await ctx.db.patch(existing._id, {
        states: args.states,
        transitions: args.transitions,
        variables: args.variables,
      });
      return existing._id;
    }

    return await ctx.db.insert("stateMachines", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getStateMachine = query({
  args: { componentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stateMachines")
      .withIndex("by_component", (q) => q.eq("componentId", args.componentId))
      .first();
  },
});
