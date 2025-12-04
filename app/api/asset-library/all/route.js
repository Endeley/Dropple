"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const search = url.searchParams.get("q")?.toLowerCase() || "";

  let assets = [];
  try {
    assets = (await convexClient.query(api.assets.getLibraryAssets, {})) || [];
  } catch (err) {
    console.error("Failed to fetch asset library", err);
    return Response.json({ error: "Failed to load assets" }, { status: 500 });
  }

  const filtered = assets.filter((asset) => {
    const matchesType = type ? asset.type === type : true;
    const matchesSearch =
      !search ||
      asset.title?.toLowerCase().includes(search) ||
      asset.description?.toLowerCase().includes(search) ||
      (asset.tags || []).some((t) => t.toLowerCase().includes(search));
    return matchesType && matchesSearch;
  });

  return Response.json(filtered);
}
