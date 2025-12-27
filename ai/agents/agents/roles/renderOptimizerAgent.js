import { runAgent } from "../shared/baseAgent";

export async function renderOptimizerAgent(state, bus) {
  return runAgent({
    name: "Render Optimizer Agent",
    bus,
    input: {
      sceneGraph: state.sceneGraph,
      job: state.job,
      metrics: state.metrics,
    },
    rolePrompt: `
You optimize rendering performance and quality.
Adjust sampling, resolution, compression, shader/material choices, and batching for target platforms.
Return JSON with recommended settings and expected speed/quality deltas.
`,
  });
}
