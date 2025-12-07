"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  try {
    const templates = (await convexClient.query(api.templates.getRecentTemplates, {})) || [];
    return Response.json({ templates });
  } catch (err) {
    console.error("Failed to load recent templates", err);
    return Response.json({ error: "Failed to load recent" }, { status: 500 });
  }
}
