import { runAgent } from "../baseAgent";

export async function styleConsistencyAgent(state, bus) {
  return runAgent({
    name: "Style Consistency Agent",
    bus,
    input: state.uiAgent,
    rolePrompt: `
Check consistency in:
- colors
- spacing
- radii
- typography
- grid alignment

Return:
{
  "issues": [...],
  "fixes": [...]
}
`
  });
}
