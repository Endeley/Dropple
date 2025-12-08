"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  // Local/fallback templates don't exist in Convex
  if (id.startsWith("tpl-")) {
    return Response.json({ stats: { views: 0, inserts: 0, favorites: 0 } });
  }
  try {
    const stats = await convexClient.query(api.templateStats.getTemplateStats, { id });
    return Response.json({ stats });
  } catch (err) {
    console.error("Failed to fetch template stats", err);
    return Response.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
