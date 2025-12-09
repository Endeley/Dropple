import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const layerSchema = v.object({
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
});

export const saveTemplate = mutation({
  args: {
    id: v.optional(v.id("templates")),
    name: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    authorId: v.optional(v.string()),
    templateData: v.any(),
    thumbnail: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    mode: v.string(),
    description: v.optional(v.string()),
    visibility: v.optional(v.string()),
    thumbnailBytes: v.optional(v.array(v.number())),
    templateJsonString: v.optional(v.string()),
    creatorName: v.optional(v.string()),
    creatorAvatar: v.optional(v.string()),
    license: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    const userId = identity?.subject ?? "system";
    const now = Date.now();
    const makePublished = args.visibility === "public";

    let thumbnailUrl: string | undefined = args.thumbnailUrl || args.thumbnail || undefined;
    let templateJsonUrl: string | undefined = undefined;

    // Store blobs if storage is available; otherwise skip
    if (storage && typeof (storage as any).store === "function") {
      try {
        if (args.thumbnailBytes) {
          const buf = new Uint8Array(args.thumbnailBytes);
          const blob = new Blob([buf], { type: "image/png" });
          const storageId = await (storage as any).store(blob);
          if (storageId) thumbnailUrl = ((await storage.getUrl(storageId)) as string | null) || undefined;
        }
      } catch (err) {
        console.warn("thumbnail store failed, skipping", err);
      }

      try {
        if (args.templateJsonString) {
          const encoder = new TextEncoder();
          const bytes = encoder.encode(args.templateJsonString);
          const blob = new Blob([bytes], { type: "application/json" });
          const storageId = await (storage as any).store(blob);
          if (storageId) templateJsonUrl = ((await storage.getUrl(storageId)) as string | null) || undefined;
        }
      } catch (err) {
        console.warn("template JSON store failed, skipping", err);
      }
    }

    if (args.id) {
      const existing = await db.get(args.id);
      if (!existing) throw new Error("Template not found");
      const nextVersion = (existing.version ?? 1) + 1;
      const versions = existing.versions || [];
      if (templateJsonUrl || thumbnailUrl) {
        versions.push({
          version: nextVersion,
          templateJsonUrl: templateJsonUrl ?? existing.templateJsonUrl,
          thumbnailUrl: thumbnailUrl ?? existing.thumbnailUrl,
          createdAt: now,
        });
      }
      return await db.patch(args.id, {
        name: args.name,
        category: args.category,
        tags: args.tags ?? [],
        authorId: args.authorId ?? userId,
        templateData: args.templateData,
        thumbnail: args.thumbnail ?? existing.thumbnail,
        thumbnailUrl: thumbnailUrl ?? existing.thumbnailUrl,
        templateJsonUrl: templateJsonUrl ?? existing.templateJsonUrl,
        mode: args.mode,
        description: args.description,
        version: nextVersion,
        versions,
        updatedAt: now,
        isPublished: makePublished ? true : existing.isPublished,
        publishedAt: makePublished && !existing.isPublished ? now : existing.publishedAt,
        creatorName: args.creatorName ?? existing.creatorName,
        creatorAvatar: args.creatorAvatar ?? existing.creatorAvatar,
        license: args.license ?? existing.license ?? "free",
        price: args.price ?? existing.price,
      });
    }

    const insertedId = await db.insert("templates", {
      name: args.name,
      mode: args.mode,
      category: args.category,
      tags: args.tags ?? [],
      authorId: args.authorId ?? userId,
      userId,
      templateData: args.templateData,
      thumbnail: args.thumbnail ?? undefined,
      thumbnailUrl,
      templateJsonUrl,
      description: args.description,
      isPublished: makePublished,
      version: 1,
      versions: [
        {
          version: 1,
          templateJsonUrl,
          thumbnailUrl,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
      publishedAt: makePublished ? now : undefined,
      width: args.templateData?.width ?? 1080,
      height: args.templateData?.height ?? 1080,
      layers: normalizeLayers(args.templateData?.nodes || []),
      price: args.price ?? args.templateData?.price,
      purchases: 0,
      insertCount: 0,
      viewCount: 0,
      favoriteCount: 0,
      searchClicks: 0,
      score: 0,
      creatorName: args.creatorName,
      creatorAvatar: args.creatorAvatar,
      license: args.license ?? "free",
    });

    return insertedId;
  },
});

export const publishTemplate = mutation({
  args: { id: v.id("templates") },
  handler: async ({ db }, { id }) => {
    return await db.patch(id, {
      isPublished: true,
      updatedAt: Date.now(),
    });
  },
});

export const getTemplate = query({
  args: { id: v.id("templates") },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const listTemplates = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("templates").order("desc").collect();
  },
});

export const getMarketplaceTemplates = query({
  args: {},
  handler: async ({ db }) => {
    return await db
      .query("templates")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
  },
});

export const getRecommendedTemplates = query({
  args: { limit: v.optional(v.number()) },
  handler: async ({ db }, { limit }) => {
    const max = limit && limit > 0 ? limit : 16;
    // Simple heuristic fallback until personalization is wired:
    // prioritize published templates with higher score/engagement, then recent.
    const published = await db
      .query("templates")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
    const sorted = [...published].sort((a, b) => {
      const scoreA = (a.score || 0) + (a.insertCount || 0) * 0.5 + (a.favoriteCount || 0) * 1.5 + (a.viewCount || 0) * 0.1;
      const scoreB = (b.score || 0) + (b.insertCount || 0) * 0.5 + (b.favoriteCount || 0) * 1.5 + (b.viewCount || 0) * 0.1;
      if (scoreA === scoreB) {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      }
      return scoreB - scoreA;
    });
    return sorted.slice(0, max);
  },
});

// Minimal createTemplate for clients expecting templates:createTemplate
export const createTemplate = mutation({
  args: {
    name: v.string(),
    mode: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    styles: v.optional(v.array(v.string())),
    formats: v.optional(v.array(v.string())),
    templateData: v.optional(v.any()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    thumbnail: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    pageTransitions: v.optional(v.any()),
    animation: v.optional(v.any()),
    isPublished: v.optional(v.boolean()),
    price: v.optional(v.number()),
    license: v.optional(v.string()),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    const userId = identity?.subject ?? "system";
    const now = Date.now();
    const templateData = args.templateData || {};
    return await db.insert("templates", {
      name: args.name,
      mode: args.mode,
      category: args.category,
      tags: args.tags ?? [],
      styles: args.styles ?? [],
      formats: args.formats ?? [],
      authorId: userId,
      userId,
      templateData,
      thumbnail: args.thumbnail,
      thumbnailUrl: args.thumbnailUrl,
      templateJsonUrl: templateData.templateJsonUrl,
      description: args.description,
      isPublished: args.isPublished ?? false,
      version: 1,
      versions: [],
      createdAt: now,
      updatedAt: now,
      publishedAt: args.isPublished ? now : undefined,
      width: args.width ?? templateData.width ?? 1080,
      height: args.height ?? templateData.height ?? 1080,
      layers: normalizeLayers(templateData.nodes || templateData.layers || []),
      price: args.price ?? templateData.price,
      purchases: 0,
      insertCount: 0,
      viewCount: 0,
      favoriteCount: 0,
      searchClicks: 0,
      score: 0,
      creatorName: templateData.creatorName,
      creatorAvatar: templateData.creatorAvatar,
      license: args.license ?? templateData.license ?? "free",
    });
  },
});

function normalizeLayers(layers: any[] = []) {
  return (layers || []).map((l) => {
    const { parentId, ...rest } = l;
    const cleanedParent =
      typeof parentId === "string" && parentId.length
        ? parentId
        : undefined;
    return {
      ...rest,
      ...(cleanedParent ? { parentId: cleanedParent } : {}),
    };
  });
}

export const getTrendingTemplates = query({
  args: { days: v.optional(v.number()) },
  handler: async ({ db }, { days }) => {
    const windowMs = (days ?? 7) * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const events = await db.query("templateEvents").collect();
    const windowed = events.filter((e) => e.createdAt >= now - windowMs);
    const scores: Record<string, number> = {};
    windowed.forEach((e) => {
      const w =
        e.type === "insert"
          ? 4
          : e.type === "favorite"
            ? 6
            : e.type === "search_select"
              ? 1
              : e.type === "preview"
                ? 0.5
                : 1.5; // view
      scores[e.templateId] = (scores[e.templateId] || 0) + w;
    });
    const templates = await db.query("templates").withIndex("by_published", (q) => q.eq("isPublished", true)).collect();
    return templates
      .map((t) => ({ ...t, score: scores[t._id as Id<"templates">] || 0 }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 20);
  },
});

export const getPopularTemplates = query({
  args: {},
  handler: async ({ db }) => {
    const templates = await db.query("templates").withIndex("by_published", (q) => q.eq("isPublished", true)).collect();
    return templates.sort((a, b) => (b.insertCount || 0) - (a.insertCount || 0)).slice(0, 20);
  },
});

export const getRecentTemplates = query({
  args: {},
  handler: async ({ db }) => {
    return await db
      .query("templates")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();
  },
});

export const updateTemplate = mutation({
  args: { id: v.id("templates"), data: v.any() },
  handler: async ({ db, auth }, { id, data }) => {
    const identity = await auth.getUserIdentity();
    const userId = identity?.subject ?? "system";
    const existing = await db.get(id);
    if (!existing) throw new Error("Template not found");
    await db.patch(id, { ...data, userId, updatedAt: Date.now() });
    return id;
  },
});
