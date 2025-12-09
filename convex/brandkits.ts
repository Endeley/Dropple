import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("brandkits").order("desc").collect();
  },
});

export const upsert = mutation({
  args: {
    name: v.string(),
    tagline: v.optional(v.string()),
    personality: v.optional(v.array(v.string())),
    colorPalette: v.optional(
      v.object({
        primary: v.optional(v.array(v.string())),
        secondary: v.optional(v.array(v.string())),
        neutral: v.optional(v.array(v.string())),
        semantic: v.optional(
          v.object({
            success: v.optional(v.string()),
            warning: v.optional(v.string()),
            danger: v.optional(v.string()),
          }),
        ),
      }),
    ),
    typography: v.optional(
      v.object({
        headingFont: v.optional(v.string()),
        bodyFont: v.optional(v.string()),
        accentFont: v.optional(v.string()),
      }),
    ),
    logos: v.optional(v.array(v.string())),
    patterns: v.optional(v.array(v.string())),
    uiComponents: v.optional(v.array(v.string())),
    tokens: v.optional(v.any()),
    theme: v.optional(v.any()),
    icon: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity?.();
    const userId = identity?.tokenIdentifier || "anonymous";
    return ctx.db.insert("brandkits", {
      ...args,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
