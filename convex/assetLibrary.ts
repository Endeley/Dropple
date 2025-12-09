import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLibraryAssets = query({
  args: {
    type: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let assets = await ctx.db.query("assetLibrary").collect();
    if (args.type) assets = assets.filter((a) => a.type === args.type);
    if (args.search) {
      const s = args.search.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          (a.description || "").toLowerCase().includes(s) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(s)),
      );
    }
    if (args.limit && args.limit > 0) {
      assets = assets.slice(0, args.limit);
    }
    return assets;
  },
});
