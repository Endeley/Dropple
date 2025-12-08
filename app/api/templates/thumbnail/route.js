"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function POST(request) {
  const { id, thumbnail } = await request.json();

  if (!id || !thumbnail) {
    return Response.json({ error: "missing data" }, { status: 400 });
  }

  try {
    await convexClient.mutation(api.templates.updateTemplate, {
      id,
      data: { thumbnail },
    });
  } catch (err) {
    console.error("Convex updateTemplate failed", err);
    return Response.json({ error: "Update failed", success: false }, { status: 400 });
  }

  return Response.json({ success: true });
}
