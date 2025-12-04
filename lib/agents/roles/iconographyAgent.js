import { runAgent } from "../baseAgent";

export async function iconographyAgent(state, bus) {
  return runAgent({
    name: "Iconography Agent",
    bus,
    input: state?.brand,
    rolePrompt: `
You are the Iconography Agent.
Generate a consistent icon system:
- style
- stroke style
- weight
- corner radius
- grid system

Return:
{
  "iconSet": [],
  "styleGuide": {}
}
`,
  });
}
