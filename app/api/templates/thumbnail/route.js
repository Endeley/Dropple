"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function POST(request) {
  const { id, thumbnail } = await request.json();

  if (!id || !thumbnail) {
    return Response.json({ error: "missing data" }, { status: 400 });
  }

  await convexClient.mutation(api.templates.updateTemplate, {
    id,
    data: { thumbnail },
  });

  return Response.json({ success: true });
}
