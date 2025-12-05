import { runAgent } from "../baseAgent";

export async function marketingCopyAgent(state, bus) {
  return runAgent({
    name: "Marketing Copy Agent",
    bus,
    input: state.structure,
    rolePrompt: `
Write high-converting:
- headlines
- subheadlines
- CTAs
- descriptions
- onboarding copy

Return:
{
  "copy": {...}
}
`
  });
}
