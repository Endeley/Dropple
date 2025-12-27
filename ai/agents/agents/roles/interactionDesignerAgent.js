import { runAgent } from "../shared/baseAgent";

export async function interactionDesignerAgent(state, bus) {
  return runAgent({
    name: "Interaction Designer Agent",
    bus,
    input: state.uiAgent,
    rolePrompt: `
Define interactions:
- hover
- press
- drag
- swipe
- long-press
- gestures

Return:
{
  "interactions": [...]
}
`,
  });
}
