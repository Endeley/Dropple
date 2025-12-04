"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("q")?.toLowerCase() || "";

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

  return Response.json({ templates: filtered });
}
