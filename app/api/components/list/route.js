"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const comps = (await convexClient.query(api.components.listComponents, {})) || [];
    if (!projectId) {
      return Response.json({ components: comps });
    }
    const filtered = comps.filter((c) => c.projectId === projectId);
    return Response.json({ components: filtered });
  } catch (err) {
    console.error("list components failed", err);
    return Response.json({ error: "list failed" }, { status: 500 });
  }
}
