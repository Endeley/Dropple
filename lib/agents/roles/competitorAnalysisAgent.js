import { runAgent } from "../baseAgent";

export async function competitorAnalysisAgent(state, bus) {
  return runAgent({
    name: "Competitor Analysis Agent",
    bus,
    input: state?.structure,
    rolePrompt: `
Identify top competitors.
Analyze patterns.
Recommend UI/UX improvements.

Return:
{
  "competitors": [],
  "patterns": [],
  "opportunities": []
}
`,
  });
}
