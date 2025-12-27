import { runAgent } from "../shared/baseAgent";

export async function uiAgent(state, bus) {
  return runAgent({
    name: "UI Agent",
    bus,
    input: { layout: state.layoutAgent, brand: state.brandAgent },
    rolePrompt: `
You are the UI Designer.
Turn layout + brand into high-fidelity UI.

Generate:
- components
- section designs
- buttons
- cards
- hero sections
- navbars
- full UI pages

Return:
{
  "ui": {...}
}
`
  });
}
