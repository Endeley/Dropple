import { runAgent } from "../baseAgent";

export async function competitorAnalysisAgent(state, bus) {
  return runAgent({
    name: "Competitor Analysis Agent",
    bus,
    input: state.prompt,
    rolePrompt: `
Identify competitors.
Analyze:
- flows
- UI patterns
- strengths/weaknesses
- differentiation opportunities

Return:
{
  "competitors": [...],
  "patterns": [...],
  "opportunities": [...]
}
`
  });
}
