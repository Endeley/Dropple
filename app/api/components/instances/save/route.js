"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  try {
    const body = await request.json();
    const { projectId, instance } = body;
    if (!projectId || !instance) {
      return Response.json({ error: "projectId and instance required" }, { status: 400 });
    }
    const id = await convexClient.mutation(api.componentInstances.upsertInstance, {
      projectId,
      componentId: instance.componentId,
      instanceId: instance.instanceId,
      overrides: instance.overrides || {},
      slotData: instance.slotData || {},
      variant: instance.variant || null,
      useMasterMotion: instance.useMasterMotion,
      frame: instance.frame || null,
    });
    return Response.json({ id });
  } catch (err) {
    console.error("save instance failed", err);
    return Response.json({ error: "save instance failed" }, { status: 500 });
  }
}
