import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertInstance = mutation({
  args: {
    projectId: v.string(),
    componentId: v.string(),
    instanceId: v.string(),
    overrides: v.optional(v.any()),
    slotData: v.optional(v.any()),
    variant: v.optional(v.string()),
    useMasterMotion: v.optional(v.boolean()),
    frame: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        parentId: v.optional(v.string()),
      }),
    ),
  },
  handler: async ({ db }, args) => {
    const existing = await db
      .query("componentInstances")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("instanceId"), args.instanceId))
      .first();

    const now = Date.now();
    if (existing?._id) {
      await db.patch(existing._id, {
        overrides: args.overrides ?? existing.overrides,
        slotData: args.slotData ?? existing.slotData,
        variant: args.variant ?? existing.variant,
        useMasterMotion: args.useMasterMotion ?? existing.useMasterMotion,
        frame: args.frame ?? existing.frame,
        updatedAt: now,
      });
      return existing._id;
    }

    return await db.insert("componentInstances", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteInstance = mutation({
  args: { projectId: v.string(), instanceId: v.string() },
  handler: async ({ db }, { projectId, instanceId }) => {
    const existing = await db
      .query("componentInstances")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .filter((q) => q.eq(q.field("instanceId"), instanceId))
      .first();
    if (existing?._id) {
      await db.delete(existing._id);
    }
  },
});

export const listInstances = query({
  args: { projectId: v.string() },
  handler: async ({ db }, { projectId }) => {
    return await db.query("componentInstances").withIndex("by_project", (q) => q.eq("projectId", projectId)).collect();
  },
});
