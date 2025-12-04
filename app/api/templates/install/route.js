"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  const body = await request.json();
  const { id } = body || {};

  if (!id) {
    return Response.json({ error: "Missing template id" }, { status: 400 });
  }

  try {
    await convexClient.mutation(api.templates.incrementDownload, { id });
  } catch (err) {
    console.error("Failed to record template install", err);
  }

  return Response.json({ success: true });
}
