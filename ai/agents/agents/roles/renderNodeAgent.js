import { runAgent } from "../shared/baseAgent";

export async function renderNodeAgent(state, bus) {
  return runAgent({
    name: "Render Node Agent",
    bus,
    input: {
      slice: state.slice,
      sceneGraph: state.sceneGraph,
      target: state.target,
    },
    rolePrompt: `
You are a render worker.
Render the assigned slice/frame/segment for 2D, motion, video, 3D, or AR/VR output.
Return JSON with render artifacts (urls/refs), timings, and any diagnostics.
`,
  });
}
