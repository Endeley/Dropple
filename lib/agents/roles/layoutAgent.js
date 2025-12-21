import { runAgent } from "../shared/baseAgent";

export async function layoutAgent(state, bus) {
  return runAgent({
    name: "Layout Agent",
    bus,
    input: state.uxAgent,
    rolePrompt: `
You are the Layout Designer.
Refine wireframes into:
- grids
- spacing rules
- alignment
- auto-layout rules
- responsive layout

Return:
{
  "layout": {...}
}
`
  });
}
