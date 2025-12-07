import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTemplateStats = query({
  args: { id: v.id("templates") },
  handler: async ({ db }, { id }) => {
    const tpl = await db.get(id);
    if (!tpl) return null;
    const events = await db
      .query("templateEvents")
      .withIndex("by_template", (q) => q.eq("templateId", id))
      .collect();
    const views = events.filter((e) => e.type === "view").length;
    const inserts = events.filter((e) => e.type === "insert").length;
    const favorites = events.filter((e) => e.type === "favorite").length;
    const searches = events.filter((e) => e.type === "search_select").length;
    const preview = events.filter((e) => e.type === "preview").length;
    const conversion = views ? Number(((inserts / views) * 100).toFixed(1)) : 0;
    return {
      id,
      views,
      inserts,
      favorites,
      searches,
      preview,
      conversion,
      updatedAt: tpl.updatedAt,
    };
  },
});
