import { runAgent } from "../shared/baseAgent";

export async function scenarioSimulationAgent(state, bus) {
  return runAgent({
    name: "Scenario Simulation Agent",
    bus,
    input: {
      personas: state.researchPersonaAgent,
      workspace: state.workspace,
      ux: state.uxAgent,
      flows: state.uxAgent?.flows,
      layout: state.layoutAgent,
      ui: state.uiAgent,
    },
    rolePrompt: `
You are the Scenario Simulation AI.
Simulate user behavior across the UI.

For each persona:
1. Predict how they navigate the UI.
2. Identify confusion points.
3. Identify hesitation zones.
4. Predict where users will click.
5. Predict drop-off steps.
6. Identify accessibility issues.
7. Rate UX flow efficiency from 1-10.
8. Generate heatmap data (JSON coordinates).

Return JSON:
{
  "scenarios": [
    {
      "persona": "...",
      "navigationPath": [...],
      "confusionPoints": [...],
      "dropOffPoints": [...],
      "heatmap": [...],
      "uxScore": 0-10,
      "recommendations": [...]
    }
  ]
}
`
  });
}
