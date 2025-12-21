"use server";

import { runDroppleAgent } from "@/lib/agents/runDroppleAgent";
import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

const API_KEY = process.env.DROPPLE_API_KEY;

function validateApiKey(key) {
  if (!API_KEY) throw new Error("DROPPLE_API_KEY not configured");
  if (key !== API_KEY) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { agent, input, apiKey } = body || {};
    validateApiKey(apiKey);

    const result = await runDroppleAgent(agent, input);

    // Track API usage
    if (apiKey && agent) {
      await convexClient.mutation(api.apiUsage.increment, {
        key: apiKey,
        agent,
      });
    }

    return Response.json({ result });
  } catch (err) {
    const status = err.status || 500;
    return Response.json({ error: err.message || "Agent error" }, { status });
  }
}
