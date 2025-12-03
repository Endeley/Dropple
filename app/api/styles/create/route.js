"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  const { name, type, value } = await request.json();

  if (!name || !type || !value) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const styleId = await convexClient.mutation(api.styles.createStyle, {
    name,
    type,
    value,
  });

  return Response.json({ styleId });
}
