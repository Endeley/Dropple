"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("q")?.toLowerCase() || "";

  let components = [];
  try {
    components = (await convexClient.query(api.components.getMarketplaceComponents, {})) || [];
  } catch (err) {
    console.error("Failed to fetch components", err);
    return Response.json({ error: "Failed to fetch components" }, { status: 500 });
  }

  const filtered = components.filter((comp) => {
    const matchesCategory = category ? comp.category === category : true;
    const matchesSearch =
      !search ||
      comp.name?.toLowerCase().includes(search) ||
      comp.description?.toLowerCase().includes(search) ||
      (comp.tags || []).some((t) => t.toLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  });

  return Response.json(filtered);
}
