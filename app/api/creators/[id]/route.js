"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(_req, { params }) {
  const { id } = params;
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  try {
    const user = await convexClient.query(api.users.getUserById, { id });
    const templates = (await convexClient.query(api.templates.listTemplates, {})) || [];
    const byCreator = templates.filter((t) => t.authorId === id || t.userId === id);
    return Response.json({
      creator: user || null,
      templates: byCreator,
    });
  } catch (err) {
    console.error("Failed to load creator profile", err);
    return Response.json({ error: "Failed to load creator" }, { status: 500 });
  }
}
