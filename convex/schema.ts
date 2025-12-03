import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    stackUserId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_stack_user", ["stackUserId"])
    .index("by_email", ["email"]),
  templates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    mode: v.string(),
    userId: v.string(),
    thumbnail: v.optional(v.string()),
    tags: v.array(v.string()),
    category: v.optional(v.string()),
    width: v.number(),
    height: v.number(),
    layers: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        rotation: v.optional(v.number()),
        url: v.optional(v.string()),
        content: v.optional(v.string()),
        props: v.optional(v.any()),
      }),
    ),
    isPublished: v.boolean(),
    price: v.optional(v.number()),
    purchases: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    version: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_mode", ["mode"])
    .index("by_published", ["isPublished"])
    .index("by_category", ["category"]),
  assets: defineTable({
    userId: v.string(),
    fileId: v.string(),
    url: v.string(),
    filename: v.string(),
    type: v.string(),
    size: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  components: defineTable({
    userId: v.string(),
    name: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    nodes: v.array(v.any()),
    variants: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
