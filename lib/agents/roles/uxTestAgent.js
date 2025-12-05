import { runAgent } from "../baseAgent";

export async function uxTestAgent(state, bus) {
  return runAgent({
    name: "UX Test Agent",
    bus,
    input: {
      simulation: state.scenarioSimulationAgent,
      workspace: state.workspace,
    },
    rolePrompt: `
You are the UX Test Agent.

Analyze simulation results.
Identify UX issues such as:
- unclear navigation
- missing onboarding steps
- low visibility of CTAs
- confusing text
- accessibility failures
- layout inconsistencies

Return:
{
  "issues": [...],
  "severityScores": [...],
  "recommendedFixes": [...]
}
`
  });
}
