import { runAgent } from "../baseAgent";

export async function spatialUIAgent(state, bus) {
  return runAgent({
    name: "Spatial UI Agent",
    bus,
    input: { world: state.worldArchitectAgent, visual: state.visualStyleAgent },
    rolePrompt: `
You design AR/VR UI: floating panels, HUDs, anchored cards, contextual overlays, and 3D navigation cues.
Return JSON with UI components, placement rules, aspect/orientation hints, and accessibility considerations in 3D space.
`,
  });
}
