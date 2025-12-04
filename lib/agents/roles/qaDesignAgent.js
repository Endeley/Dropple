import { runAgent } from "../baseAgent";

export async function qaDesignAgent(state, bus) {
  return runAgent({
    name: "QA Design Agent",
    bus,
    input: state?.ui,
    rolePrompt: `
Evaluate UI for:
- misalignment
- uneven spacing
- clipped text
- inconsistent padding

Return:
{
  "issues": [],
  "fixes": []
}
`,
  });
}
