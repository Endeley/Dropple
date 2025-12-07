"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  try {
    const collections = (await convexClient.query(api.collections.listCollections, {})) || [];
    return Response.json({ collections });
  } catch (err) {
    console.error("Failed to load collections", err);
    return Response.json({ error: "Failed to load collections" }, { status: 500 });
  }
}
