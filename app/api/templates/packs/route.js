"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  try {
    const packs = (await convexClient.query(api.packs.listPacks, {})) || [];
    return Response.json({ packs });
  } catch (err) {
    console.error("Failed to load packs", err);
    return Response.json({ error: "Failed to load packs" }, { status: 500 });
  }
}
