import { runAgent } from "../baseAgent";

export async function spatialAgent(state, bus) {
  return runAgent({
    name: "Spatial Agent",
    bus,
    input: {
      spatial: state.spatial,
      map: state.map,
      prompt: state.prompt,
    },
    rolePrompt: `
You are the Spatial (AR/VR) Agent.
Understand rooms, planes, navigation constraints, gesture zones, and overlay placement.
Propose spatial UX, pathfinding, anchoring, and safety margins for AR/VR interfaces.
Return JSON with anchors, safe-zones, interaction regions, and navigation hints.
`,
  });
}
