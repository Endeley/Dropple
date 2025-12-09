"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const search = url.searchParams.get("q")?.toLowerCase() || "";

  let assets = [];
  try {
    assets =
      (await convexClient.query(
        api.assetLibrary?.getLibraryAssets || api.assets?.getLibraryAssets || api.assets?.list,
        {},
      )) || [];
  } catch (err) {
    console.warn("Asset library fetch skipped (Convex fn missing?)", err?.message || err);
    // fallback: empty list instead of 500 to avoid noisy errors
    return Response.json([]);
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
