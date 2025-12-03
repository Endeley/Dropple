"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  const components = await convexClient.query(api.components.getUserComponents, {});
  return Response.json({ components });
}
