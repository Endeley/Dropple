import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTheme = mutation({
  args: {
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
  },
  handler: async ({ db, auth }, { name, tokens }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    return await db.insert("themes", {
      userId,
      name,
      tokens,
      createdAt: Date.now(),
    });
  },
});

export const updateTheme = mutation({
  args: {
    themeId: v.id("themes"),
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
  },
  handler: async ({ db }, { themeId, tokens }) => {
    await db.patch(themeId, { tokens });
    return true;
  },
});

export const getThemes = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    return await db
      .query("themes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
