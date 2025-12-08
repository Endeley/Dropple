"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  try {
    const body = await request.json();
    const { projectId, templateId, pages, layers, instanceRegistry } = body;
    if (!projectId) return Response.json({ error: "projectId required" }, { status: 400 });
    await convexClient.mutation(api.editorStates.saveState, {
      projectId,
      templateId: templateId || null,
      pages: pages || null,
      layers: layers || null,
      instanceRegistry: instanceRegistry || null,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("save editor state failed", err);
    return Response.json({ error: "failed to save" }, { status: 500 });
  }
}
