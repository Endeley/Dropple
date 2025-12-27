import { runAgent } from "../shared/baseAgent";

export async function renderMasterAgent(state, bus) {
  return runAgent({
    name: "Render Master Agent",
    bus,
    input: {
      sceneGraph: state.sceneGraph,
      job: state.job,
    },
    rolePrompt: `
You orchestrate render jobs across 2D, motion, video, 3D, and AR/VR outputs.
Decide render targets, split workloads, and hand off to render nodes.
Return JSON with pipeline steps, quality settings, and node assignments.
`,
  });
}
