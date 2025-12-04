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
    name: v.string(),
    fileId: v.string(),
    url: v.string(),
    filename: v.optional(v.string()),
    type: v.optional(v.string()),
    size: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    tags: v.array(v.string()),
    folder: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  presence: defineTable({
    userId: v.string(),
    projectId: v.string(),
    cursor: v.object({
      x: v.number(),
      y: v.number(),
    }),
    selection: v.array(v.string()),
    lastActive: v.number(),
  }).index("by_project", ["projectId"]),
  assetLibrary: defineTable({
    userId: v.string(),
    type: v.string(), // image | icon | svg | 3d | illustration | texture | lottie
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    fileUrl: v.string(),
    previewUrl: v.string(),
    fileType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    packId: v.optional(v.string()),
    isPremium: v.boolean(),
    price: v.optional(v.number()),
    downloads: v.number(),
    favorites: v.number(),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_user", ["userId"]),
  assetPacks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    coverImage: v.string(),
    price: v.optional(v.number()),
    isPremium: v.boolean(),
    assets: v.array(v.string()),
    downloads: v.number(),
    favorites: v.number(),
    createdAt: v.number(),
  }).index("by_category", ["category"]),
  comments: defineTable({
    userId: v.string(),
    projectId: v.string(),
    layerId: v.optional(v.string()),
    x: v.number(),
    y: v.number(),
    message: v.string(),
    replies: v.array(
      v.object({
        userId: v.string(),
        message: v.string(),
        createdAt: v.number(),
      }),
    ),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),
  components: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    previewImage: v.optional(v.string()),
    componentJSON: v.optional(v.string()),
    nodes: v.array(v.any()),
    variants: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        nodes: v.array(v.any()),
      }),
    ),
    isPremium: v.optional(v.boolean()),
    price: v.optional(v.number()),
    downloads: v.optional(v.number()),
    favorites: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"]),
  styles: defineTable({
    userId: v.string(),
    type: v.string(), // "color" | "text" | "effect"
    name: v.string(),
    value: v.any(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  themes: defineTable({
    userId: v.string(),
    name: v.string(),
    tokens: v.object({
      colors: v.object({
        primary: v.string(),
        secondary: v.string(),
        surface: v.string(),
        text: v.string(),
        background: v.string(),
        success: v.string(),
        danger: v.string(),
        warning: v.string(),
      }),
    }),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  userBehavior: defineTable({
    userId: v.string(),
    action: v.string(), // viewed_template, used_template, viewed_asset, used_component, etc.
    targetId: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  embeddings: defineTable({
    itemId: v.string(), // templateId | componentId | assetId
    itemType: v.string(),
    vector: v.array(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_item", ["itemId"]),
  userEmbeddings: defineTable({
    userId: v.string(),
    vector: v.array(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
