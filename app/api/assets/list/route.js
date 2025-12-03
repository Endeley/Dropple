"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  const assets = await convexClient.query(api.assets.getUserAssets, {});
  return Response.json({ assets });
}
