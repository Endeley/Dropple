import { runAgent } from "../baseAgent";

export async function qaDesignAgent(state, bus) {
  return runAgent({
    name: "QA Design Agent",
    bus,
    input: state.uiAgent,
    rolePrompt: `
Find visual defects:
- misalignment
- spacing errors
- overlapping
- clipping
- inconsistent sizes

Return:
{
  "issues": [...],
  "fixes": [...]
}
`
  });
}
