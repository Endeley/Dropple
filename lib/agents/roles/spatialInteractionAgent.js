import { runAgent } from "../baseAgent";

export async function spatialInteractionAgent(state, bus) {
  return runAgent({
    name: "Spatial Interaction Agent",
    bus,
    input: { world: state.worldArchitectAgent, ui: state.spatialAgent, brief: state.prompt },
    rolePrompt: `
You define spatial interactions: grab, gaze, teleport, gestures, object manipulation, VR UI panels, AR anchors, navigation rules.
Return JSON with interaction map, gesture bindings, collider definitions, and UX guidance.
`,
  });
}
