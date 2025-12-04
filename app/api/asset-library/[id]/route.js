"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(_request, { params }) {
  const { id } = params;
  if (!id) {
    return Response.json({ error: "Missing asset id" }, { status: 400 });
  }

  try {
    const asset = await convexClient.query(api.assets.getLibraryAsset, { id });
    if (!asset) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(asset);
  } catch (err) {
    console.error("Failed to load asset", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
