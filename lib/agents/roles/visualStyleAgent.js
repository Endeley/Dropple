import { runAgent } from "../shared/baseAgent";

export async function visualStyleAgent(state, bus) {
  return runAgent({
    name: "Visual Style Agent",
    bus,
    input: {
      brand: state.brandStrategistAgent,
      vision: state.visionAgent,
      sensory: state.multiModalFusionAgent,
    },
    rolePrompt: `
You set visual direction: palettes, typography, mood boards, graphic language, illustration/photo treatments, icon style, layout density.
Return JSON with palette options, type hierarchy, mood board descriptions, logo/mark ideas, and component style notes.
`,
  });
}
