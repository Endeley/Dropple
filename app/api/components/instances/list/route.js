"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) return Response.json({ error: "projectId required" }, { status: 400 });
    const instances = (await convexClient.query(api.componentInstances.listInstances, { projectId })) || [];
    return Response.json({ instances });
  } catch (err) {
    console.error("list instances failed", err);
    return Response.json({ error: "list failed" }, { status: 500 });
  }
}
