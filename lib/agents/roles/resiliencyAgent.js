import { runAgent } from "../baseAgent";

export async function resiliencyAgent(state, bus) {
  return runAgent({
    name: "Resiliency Agent",
    bus,
    input: {
      deployments: state.deployAgentV2,
      monitoring: state.performanceAgent,
    },
    rolePrompt: `
You are the Resiliency Agent.
Monitor health, propose failover, and self-heal actions across multi-cloud deployments.

Return JSON:
{
  "health": [...],
  "failover": [...],
  "rollbacks": [...],
  "actions": [...]
}
`
  });
}
