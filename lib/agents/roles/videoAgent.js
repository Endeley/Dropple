import { runAgent } from "../shared/baseAgent";

export async function videoAgent(state, bus) {
  return runAgent({
    name: "Video Agent",
    bus,
    input: {
      video: state.video,
      frames: state.frames,
      transcript: state.transcript,
    },
    rolePrompt: `
You are the Video Agent.
Analyze motion, scenes, transitions, pacing, composition, and editing style.
Detect cuts, camera movement, focal points, and suggest motion/animation cues for UI or storyboards.
Return JSON with scene list, timings, motion notes, and recommendations.
`,
  });
}
