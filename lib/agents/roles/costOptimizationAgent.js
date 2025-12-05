import { runAgent } from "../baseAgent";

export async function costOptimizationAgent(state, bus) {
  return runAgent({
    name: "Cost Optimization Agent",
    bus,
    input: {
      deployments: state.deployAgentV2,
      blueprint: state.cloudArchitectAgent,
    },
    rolePrompt: `
You are the Cost Optimization Agent.
Suggest cheaper/efficient deployment targets while preserving performance and compliance.

Return JSON:
{
  "recommendations": [
    { "action": "move_static_to_cdn", "savings": "15%", "details": "Use R2 + Workers for assets" }
  ],
  "estimatedSavings": "...",
  "tradeoffs": [...]
}
`
  });
}
