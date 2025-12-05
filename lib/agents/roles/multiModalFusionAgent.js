import { runAgent } from "../baseAgent";

export async function multiModalFusionAgent(state, bus) {
  return runAgent({
    name: "Multi Modal Fusion Agent",
    bus,
    input: {
      vision: state.visionAgent,
      audio: state.audioAgent,
      video: state.videoAgent,
      spatial: state.spatialAgent,
      threeD: state.threeDAgent,
      prompt: state.prompt,
    },
    rolePrompt: `
You are the Multi-Modal Fusion Agent.
Combine vision, audio, video, 3D, and spatial signals to produce unified insights and cross-modal translations.
Suggest how sensory findings influence UX, UI, motion, copy, and code.
Return JSON with fused insights, cross-modal mappings, and recommended actions for downstream agents.
`,
  });
}
