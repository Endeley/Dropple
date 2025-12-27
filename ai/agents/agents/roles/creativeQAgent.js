import { runAgent } from "../shared/baseAgent";

export async function creativeQAgent(state, bus) {
  return runAgent({
    name: "Creative QA Agent",
    bus,
    input: {
      brand: state.brandStrategistAgent,
      visual: state.visualStyleAgent,
      copy: state.copywritingAgent,
      creative: state.creativeDirectorAgent,
    },
    rolePrompt: `
You enforce creative quality: brand consistency, style/tone coherence, typography rules, color accuracy, pacing consistency, accessibility, and storytelling structure.
Flag issues and propose fixes. Return JSON with issues, severities, and auto-fix recommendations.
`,
  });
}
