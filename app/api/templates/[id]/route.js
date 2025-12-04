"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(_request, { params }) {
  const { id } = params;
  if (!id) {
    return Response.json({ error: "Missing template id" }, { status: 400 });
  }

  try {
    const template = await convexClient.query(api.templates.getTemplate, {
      id,
    });

    if (!template) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ template });
  } catch (err) {
    console.error("Failed to fetch template", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
