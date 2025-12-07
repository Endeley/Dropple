"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(req) {
  const url = new URL(req.url);
  const creatorId = url.searchParams.get("creatorId");
  if (!creatorId) return Response.json({ error: "Missing creatorId" }, { status: 400 });
  try {
    const templates = (await convexClient.query(api.templates.listTemplates, {})) || [];
    const filtered = templates.filter((t) => t.authorId === creatorId || t.userId === creatorId);
    return Response.json({ templates: filtered });
  } catch (err) {
    console.error("Failed to load creator templates", err);
    return Response.json({ error: "Failed to load" }, { status: 500 });
  }
}
