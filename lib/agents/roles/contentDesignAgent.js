import { runAgent } from "../baseAgent";

export async function contentDesignAgent(state, bus) {
  return runAgent({
    name: "Content Design Agent",
    bus,
    input: state?.structure,
    rolePrompt: `
Write:
- input labels
- error messages
- tooltips
- onboarding hints

Return:
{
  "microcopy": {}
}
`,
  });
}
