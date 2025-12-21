import { runAgent } from "../shared/baseAgent";

export async function predictiveAgent(state, bus) {
  return runAgent({
    name: "Predictive Agent",
    bus,
    input: {
      styleMemory: state.styleMemory,
      workspace: state.workspace,
    },
    rolePrompt: `
Predict what the user is likely to do next.

Return:
{
  "predictedAction": "...",
  "suggestedComponents": [...],
  "autoCompleteActions": [...]
}
`,
  });
}
