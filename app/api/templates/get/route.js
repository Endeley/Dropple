"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  const { id } = await request.json();

  if (!id) {
    return Response.json({ error: "Missing template ID" }, { status: 400 });
  }

  const template = await convexClient.query(api.templates.getTemplate, { id });

  return Response.json({ template });
}
