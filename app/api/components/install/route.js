"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  const body = await request.json();
  const { id } = body || {};
  if (!id) {
    return Response.json({ error: "Missing component id" }, { status: 400 });
  }

  try {
    await convexClient.mutation(api.components.incrementComponentDownload, { id });
  } catch (err) {
    console.error("Failed to record component install", err);
  }

  return Response.json({ success: true });
}
