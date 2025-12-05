import { runAgent } from "../baseAgent";

export async function brandStrategistAgent(state, bus) {
  return runAgent({
    name: "Brand Strategist Agent",
    bus,
    input: { brief: state.prompt, research: state.researchPersonaAgent, competitors: state.competitorAnalysisAgent },
    rolePrompt: `
You define brand mission, voice, positioning, audience segments, messaging hierarchy, value propositions, and emotional tone.
Return JSON with mission, positioning, personas, messaging pillars, keywords, and visual DNA notes.
`,
  });
}
