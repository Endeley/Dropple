"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  try {
    const templates = (await convexClient.query(api.templates.getRecommendedTemplates, {})) || [];
    return Response.json({ templates });
  } catch (err) {
    console.error("Failed to load recommended templates", err);
    return Response.json({ error: "Failed to load recommended" }, { status: 500 });
  }
}
