import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const cosineSimilarity = (a: number[], b: number[]) => {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const logBehavior = mutation({
  args: {
    action: v.string(),
    targetId: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async ({ db, auth }, { action, targetId, metadata }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    await db.insert("userBehavior", {
      userId,
      action,
      targetId,
      metadata,
      createdAt: Date.now(),
    });
  },
});

export const recommendTemplates = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    const userPref = await db
      .query("userEmbeddings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const templates = await db
      .query("templates")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const templateEmbeddings = await db
      .query("embeddings")
      .withIndex("by_item", (q) => q.gt("itemId", "")) // force use index
      .collect();

    if (!userPref) {
      return templates.slice(0, 12);
    }

    const scores = templateEmbeddings
      .filter((emb) => emb.itemType === "template")
      .map((emb) => ({
        id: emb.itemId,
        score: cosineSimilarity(userPref.vector, emb.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((s) => templates.find((t) => t._id === s.id))
      .filter(Boolean);

    if (scores.length < 4) {
      const filler = templates
        .filter((t) => !scores.find((s) => s?._id === t._id))
        .slice(0, 12 - scores.length);
      return [...scores, ...filler];
    }

    return scores;
  },
});
