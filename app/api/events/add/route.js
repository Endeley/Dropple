"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function POST(req) {
  const payload = await req.json();

  await convexClient.mutation(api.events.addEvent, {
    type: payload.type || "event",
    actor: payload.actor || "unknown",
    layerId: payload.layerId,
    payload: payload.payload,
  });

  return Response.json({ ok: true });
}
