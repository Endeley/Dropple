import { runAgent } from "../baseAgent";

export async function productStrategyAgent(state, bus) {
  return runAgent({
    name: "Product Strategy Agent",
    bus,
    input: state?.prompt,
    rolePrompt: `
You are the Product Strategy Agent.
Define:
- product vision
- roadmap
- key features
- release plan

Return:
{
  "vision": "",
  "features": [],
  "roadmap": [],
  "MVP": []
}
`,
  });
}
