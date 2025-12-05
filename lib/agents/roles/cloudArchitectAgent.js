import { runAgent } from "../baseAgent";

export async function cloudArchitectAgent(state, bus) {
  return runAgent({
    name: "Cloud Architect Agent",
    bus,
    input: {
      project: state.generatedProject,
      performance: state.performanceAgent,
      requirements: state.saasBlueprintAgent || state.multiAppBlueprintAgent,
    },
    rolePrompt: `
You are the Cloud Architect Agent.
Choose optimal deployment targets and regions given project requirements.
Consider: performance, security, cost, latency, data residency.

Return JSON:
{
  "targets": [
    { "provider": "vercel", "region": "iad1", "role": "edge-web" },
    { "provider": "aws", "service": "lambda", "region": "us-east-1", "role": "api" }
  ],
  "routing": {...},
  "failover": {...},
  "costNotes": [...]
}
`
  });
}
