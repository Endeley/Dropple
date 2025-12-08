"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  try {
    const body = await request.json();
    const { component, projectId } = body;
    if (!component) {
      return Response.json({ error: "component missing" }, { status: 400 });
    }
    const id = await convexClient.mutation(api.components.saveComponent, {
      component,
      projectId: projectId || null,
    });
    return Response.json({ id });
  } catch (err) {
    console.error("save component failed", err);
    return Response.json({ error: "save failed" }, { status: 500 });
  }
}
