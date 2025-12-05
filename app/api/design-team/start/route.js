"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";
import { AGENT_PIPELINE } from "@/lib/orchestrator/multiAgentConfig";

export async function POST(request) {
  const { prompt } = await request.json();

  for (const agentName of AGENT_PIPELINE) {
    await convexClient.mutation(api.agentQueue.enqueue, {
      agent: agentName,
      prompt,
      state: { prompt },
    });
  }

  return Response.json({ ok: true });
}
