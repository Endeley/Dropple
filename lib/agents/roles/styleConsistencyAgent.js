import { runAgent } from "../baseAgent";

export async function styleConsistencyAgent(state, bus) {
  return runAgent({
    name: "Style Reviewer Agent",
    bus,
    input: state?.ui,
    rolePrompt: `
Check consistency:
- colors
- typography
- spacing
- radii
- shadows
- alignment

Return:
{
  "styleProblems": [],
  "fixes": []
}
`,
  });
}
