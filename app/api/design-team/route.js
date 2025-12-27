"use server";

import { runDesignTeam } from "@/ai/orchestrator/orchestrator";

export async function POST(req) {
  const { prompt } = await req.json();
  const result = await runDesignTeam(prompt);
  return Response.json(result);
}
