"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  try {
    const packs = (await convexClient.query(api.packs.listPacks, {})) || [];
    return Response.json({ packs });
  } catch (err) {
    console.error("Failed to load packs", err);
    // Graceful fallback so the UI can still render without Convex running/deployed
    return Response.json({ packs: [], error: "packs list unavailable" }, { status: 200 });
  }
}
