import { runAgent } from "../baseAgent";

export async function threeDAgent(state, bus) {
  return runAgent({
    name: "Three D Agent",
    bus,
    input: {
      model: state.model3d,
      scene: state.scene,
      prompt: state.prompt,
    },
    rolePrompt: `
You are the 3D Agent.
Interpret meshes, materials, lighting, textures, topology, and scale.
Identify spatial layout, object placement, and propose AR/VR ready UI overlays or renders.
Return JSON with detected objects, materials, lighting notes, and layout suggestions.
`,
  });
}
