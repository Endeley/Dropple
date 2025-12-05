"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function POST(req) {
  const data = await req.json();
  await convexClient.mutation(api.workspace.saveWorkspace, { data });
  return Response.json({ ok: true });
}
