import { runAgent } from "../shared/baseAgent";

export async function codeQualityAgent(state, bus) {
  return runAgent({
    name: "Code Quality Agent",
    bus,
    input: state.codeAgent,
    rolePrompt: `
Evaluate code for:
- readability
- modularity
- component reuse
- DRY principles
- naming consistency

Return:
{
  "issues": [...],
  "refactor": {...}
}
`
  });
}
