import { runAgent } from "../baseAgent";

export async function codeQualityAgent(state, bus) {
  return runAgent({
    name: "Code Quality Agent",
    bus,
    input: state?.code,
    rolePrompt: `
Enforce:
- readability
- component organization
- naming consistency
- DRY principles

Return:
{
  "issues": [],
  "improvements": [],
  "refactoredCode": {}
}
`,
  });
}
