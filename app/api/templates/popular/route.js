"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  try {
    const templates = (await convexClient.query(api.templates.getPopularTemplates, {})) || [];
    return Response.json({ templates });
  } catch (err) {
    console.error("Failed to load popular templates", err);
    return Response.json({ error: "Failed to load popular" }, { status: 500 });
  }
}
