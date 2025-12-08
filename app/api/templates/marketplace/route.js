"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";
import { mapTemplateDoc } from "../_mapTemplate";

export async function GET(request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("q")?.toLowerCase() || "";
  const sort = url.searchParams.get("sort") || "recent"; // recent | trending

  let templates = [];
  try {
    templates =
      (await convexClient.query(api.templates.getMarketplaceTemplates, {})) || [];
  } catch (err) {
    console.error("Failed to load marketplace templates", err);
    return Response.json({ error: "Failed to load marketplace templates" }, { status: 500 });
  }

  const filtered = templates.filter((tpl) => {
    const matchesCategory = category ? tpl.category === category : true;
    const matchesSearch =
      !search ||
      tpl.name?.toLowerCase().includes(search) ||
      tpl.description?.toLowerCase().includes(search) ||
      (tpl.tags || []).some((tag) => tag.toLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "trending") {
      const aScore = (a.purchases || 0) + (a.tags?.length || 0);
      const bScore = (b.purchases || 0) + (b.tags?.length || 0);
      return bScore - aScore;
    }
    // recent
    return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  });

  const mapped = sorted.map((tpl) => mapTemplateDoc(tpl)).filter(Boolean);

  return Response.json({ templates: mapped });
}
