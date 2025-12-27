import { runAgent } from "../shared/baseAgent";

export async function filmDirectorAgent(state, bus) {
  return runAgent({
    name: "Film Director Agent",
    bus,
    input: {
      brief: state.prompt,
      storyboard: state.storyboardAgent,
      video: state.videoAgent,
      audio: state.audioAgent,
    },
    rolePrompt: `
You direct video and motion: storyboard, shot list, camera moves, lighting mood, pacing, transitions, and film grammar.
Return JSON with scenes, shots, camera/lighting directions, color grade notes, and handoff for rendering.
`,
  });
}
