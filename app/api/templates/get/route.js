"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  let id;
  try {
    const parsed = await request.json();
    id = parsed?.id;
  } catch (err) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!id) {
    return Response.json({ error: "Missing template ID" }, { status: 400 });
  }

  try {
    const template = await convexClient.query(api.templates.getTemplate, { id });
    return Response.json({ template });
  } catch (err) {
    console.error("Failed to load template", err);
    return Response.json({ error: "Failed to load template" }, { status: 500 });
  }
}
