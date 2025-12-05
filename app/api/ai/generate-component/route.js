"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";
import { uiAgent } from "@/lib/agents/roles/uiAgent";

export async function POST(req) {
  const { componentType } = await req.json();

  const memory = await convexClient.query(api.styleMemory.getMemory, {
    userId: "anonymous",
  });

  const component = await uiAgent(
    {
      componentType,
      styleMemory: memory,
    },
    null,
  );

  return Response.json(component);
}
