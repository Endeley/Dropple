import { runAgent } from "../baseAgent";

export async function productStrategyAgent(state, bus) {
  return runAgent({
    name: "Product Strategy Agent",
    bus,
    input: state.prompt,
    rolePrompt: `
Define:
- vision
- strategy
- roadmap
- key features
- MVP
- future milestones

Return:
{
  "vision": "...",
  "roadmap": [...],
  "MVP": [...]
}
`
  });
}
