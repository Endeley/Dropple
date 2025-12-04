"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(_request, { params }) {
  const { id } = params;
  if (!id) {
    return Response.json({ error: "Missing component id" }, { status: 400 });
  }

  try {
    const component = await convexClient.query(api.components.getComponent, { id });
    if (!component) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(component);
  } catch (err) {
    console.error("Failed to fetch component", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
