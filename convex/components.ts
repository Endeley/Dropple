import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createComponent = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    nodes: v.array(v.any()),
    variants: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          nodes: v.array(v.any()),
        }),
      ),
    ),
  },
  handler: async ({ db, auth }, data) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db.insert("components", {
      userId,
      ...data,
      variants: data.variants ?? [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const addVariant = mutation({
  args: {
    componentId: v.id("components"),
    name: v.string(),
    nodes: v.array(v.any()),
    variantId: v.string(),
  },
  handler: async ({ db }, { componentId, name, nodes, variantId }) => {
    const component = await db.get(componentId);
    if (!component) {
      throw new Error("Component not found");
    }

    const newVariant = {
      id: variantId,
      name,
      nodes,
    };

    await db.patch(componentId, {
      variants: [...(component.variants || []), newVariant],
      updatedAt: Date.now(),
    });

    return newVariant;
  },
});

export const getUserComponents = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db
      .query("components")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
