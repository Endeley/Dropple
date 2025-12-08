"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  const { name, type, value } = await request.json();

  if (!name || !type || !value) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const styleId = await convexClient.mutation(api.styles.createStyle, {
      name,
      type,
      value,
    });
    return Response.json({ styleId });
  } catch (err) {
    console.error("Failed to create style", err);
    const status = err?.message === "Not authenticated" ? 401 : 500;
    return Response.json({ error: err?.message || "Failed to create style" }, { status });
  }
}
