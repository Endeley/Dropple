import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const SCORE_WEIGHTS = {
  insert: 4,
  view: 1.5,
  favorite: 6,
  search_select: 1,
  preview: 0.5,
  publish: 2,
};

export const logTemplateEvent = mutation({
  args: {
    templateId: v.string(),
    type: v.string(),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    const userId = identity?.subject;
    const now = Date.now();

    await db.insert("templateEvents", {
      templateId: args.templateId,
      type: args.type,
      userId,
      createdAt: now,
    });

    // increment aggregates
    const tpl = await db.get(args.templateId as Id<"templates">);
    if (tpl) {
      const inc = (field: string) => ((tpl as any)[field] || 0) + 1;
      const next = {
        insertCount: args.type === "insert" ? inc("insertCount") : (tpl as any).insertCount || 0,
        viewCount: args.type === "view" ? inc("viewCount") : (tpl as any).viewCount || 0,
        favoriteCount: args.type === "favorite" ? inc("favoriteCount") : (tpl as any).favoriteCount || 0,
        searchClicks: args.type === "search_select" ? inc("searchClicks") : (tpl as any).searchClicks || 0,
      };
      const score =
        (next.insertCount || 0) * SCORE_WEIGHTS.insert +
        (next.viewCount || 0) * SCORE_WEIGHTS.view +
        (next.favoriteCount || 0) * SCORE_WEIGHTS.favorite +
        (next.searchClicks || 0) * SCORE_WEIGHTS.search_select;
      await db.patch(tpl._id, {
        ...next,
        score,
        updatedAt: now,
      });
    }
  },
});
