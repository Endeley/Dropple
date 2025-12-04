import { runAgent } from "../baseAgent";

export async function performanceAgent(state, bus) {
  return runAgent({
    name: "Performance Agent",
    bus,
    input: state?.code || state?.ui,
    rolePrompt: `
Optimize for:
- runtime speed
- animation performance
- DOM size
- expensive components

Return:
{
  "bottlenecks": [],
  "optimizations": []
}
`,
  });
}
