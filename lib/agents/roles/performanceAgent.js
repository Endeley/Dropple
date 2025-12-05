import { runAgent } from "../baseAgent";

export async function performanceAgent(state, bus) {
  return runAgent({
    name: "Performance Agent",
    bus,
    input: state.codeAgent,
    rolePrompt: `
Optimize:
- code performance
- animation runtime
- DOM size
- expensive UI components

Return:
{
  "bottlenecks": [...],
  "optimizations": [...]
}
`
  });
}
