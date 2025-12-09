"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function GET() {
  try {
    let kits = [];
    if (api.brandkits?.list) {
      kits = (await convexClient.query(api.brandkits.list, {})) || [];
    } else {
      // Fallback: pull from asset library tagged as brandkit
      const assets =
        (await convexClient.query(
          api.assetLibrary?.getLibraryAssets || api.assets?.getLibraryAssets || api.assets?.list,
          {},
        )) || [];
      kits = assets
        .filter((a) => (a.tags || []).includes("brandkit") || a.type === "brandkit")
        .map((a) => normalizeKit(a))
        .filter(Boolean);
    }
    const normalized = kits.map((kit) => normalizeKit(kit)).filter(Boolean);
    return Response.json({ brandkits: normalized });
  } catch (err) {
    console.error("Failed to load brandkits", err);
    return Response.json({ brandkits: [] });
  }
}

function normalizeKit(raw) {
  if (!raw) return null;
  if (raw.theme || raw.tokens || raw.colors) return raw;
  // If stored as generic asset, try to parse metadata
  try {
    if (raw.metadata && typeof raw.metadata === "string") {
      return JSON.parse(raw.metadata);
    }
    if (raw.metadata && typeof raw.metadata === "object") return raw.metadata;
  } catch (err) {
    return null;
  }
  return null;
}
