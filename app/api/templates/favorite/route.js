"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function POST(req) {
  try {
    const body = await req.json();
    const { templateId } = body || {};
    if (!templateId) return Response.json({ error: "Missing templateId" }, { status: 400 });
    await convexClient.mutation(api.templateEvents.logTemplateEvent, { templateId, type: "favorite" });
    return Response.json({ success: true });
  } catch (err) {
    console.error("Favorite toggle failed", err);
    return Response.json({ error: "Failed to favorite" }, { status: 500 });
  }
}
