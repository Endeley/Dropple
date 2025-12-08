"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) return Response.json({ error: "projectId required" }, { status: 400 });
    const state = await convexClient.query(api.editorStates.loadState, { projectId });
    return Response.json({ state });
  } catch (err) {
    console.error("load editor state failed", err);
    return Response.json({ error: "failed to load" }, { status: 500 });
  }
}
