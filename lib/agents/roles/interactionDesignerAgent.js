import { runAgent } from "../baseAgent";

export async function interactionDesignerAgent(state, bus) {
  return runAgent({
    name: "Interaction Designer Agent",
    bus,
    input: state?.ui,
    rolePrompt: `
Define interactions:
- hover
- tap
- drag
- swipe
- long-press

Return:
{
  "interactions": []
}
`,
  });
}
