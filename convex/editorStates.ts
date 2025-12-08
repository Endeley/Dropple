import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveState = mutation({
  args: {
    projectId: v.string(),
    templateId: v.optional(v.string()),
    pages: v.optional(v.any()),
    layers: v.optional(v.any()),
    instanceRegistry: v.optional(v.any()),
  },
  handler: async ({ db }, { projectId, templateId, pages, layers, instanceRegistry }) => {
    const existing = await db
      .query("editorStates")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();
    const now = Date.now();
    if (existing?._id) {
      await db.patch(existing._id, {
        pages,
        layers,
        instanceRegistry,
        updatedAt: now,
      });
      return existing._id;
    }
    return await db.insert("editorStates", {
      projectId,
      templateId,
      pages,
      layers,
      instanceRegistry,
      updatedAt: now,
    });
  },
});

export const loadState = query({
  args: { projectId: v.string() },
  handler: async ({ db }, { projectId }) => {
    return (
      (await db.query("editorStates").withIndex("by_project", (q) => q.eq("projectId", projectId)).first()) ||
      null
    );
  },
});
