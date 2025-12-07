"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(req) {
  try {
    const body = await req.json();
    const { templateId, type } = body || {};
    if (!templateId || !type) return Response.json({ error: "Missing templateId or type" }, { status: 400 });
    await convexClient.mutation(api.templateEvents.logTemplateEvent, { templateId, type });
    return Response.json({ success: true });
  } catch (err) {
    console.error("Failed to log template event", err);
    return Response.json({ error: "Failed to log event" }, { status: 500 });
  }
}
