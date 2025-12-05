import { runAgent } from "../baseAgent";

export async function iconographyAgent(state, bus) {
  return runAgent({
    name: "Iconography Agent",
    bus,
    input: state.brandAgent,
    rolePrompt: `
Generate iconography guidelines:
- stroke width
- corner radius
- consistency rules
- grid system
Create icon concepts.

Return:
{
  "icons": [...],
  "rules": {...}
}
`
  });
}
