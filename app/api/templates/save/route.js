"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function POST(request) {
  const template = await request.json();

  if (!template?.id) {
    return Response.json({ error: "Missing template ID" }, { status: 400 });
  }

  await convexClient.mutation(api.templates.updateTemplate, {
    id: template.id,
    data: template,
  });

  return Response.json({ success: true });
}
