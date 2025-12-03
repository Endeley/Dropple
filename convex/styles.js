import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createStyle = mutation(async ({ db, auth }, { name, type, value }) => {
  const identity = await auth.getUserIdentity();
  const userId = identity.tokenIdentifier;

  return await db.insert("styles", {
    userId,
    name,
    type,
    value,
    createdAt: Date.now(),
  });
});

export const getStyles = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  const userId = identity.tokenIdentifier;

  return await db
    .query("styles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
});

export const updateStyle = mutation(async ({ db }, { styleId, value }) => {
  await db.patch(styleId, { value });
  return true;
});
