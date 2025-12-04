"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  try {
    const recs = await convexClient.query(api.recommendations.recommendTemplates, {}); // placeholder
    return Response.json(recs || []);
  } catch (err) {
    console.error("Failed to load recommendations", err);
    return Response.json([], { status: 200 });
  }
}
