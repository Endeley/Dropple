import { runAgent } from "../baseAgent";

export async function audioAgent(state, bus) {
  return runAgent({
    name: "Audio Agent",
    bus,
    input: {
      audio: state.audio,
      transcript: state.transcript,
      prompt: state.prompt,
    },
    rolePrompt: `
You are the Audio Agent.
Understand speech, music, and soundscapes: tone, sentiment, tempo, key, mood, pacing, and structure.
Produce timelines, beat markers, suggested sound design for UI/animation, and summaries of spoken content.
Return JSON with analysis, mood tags, timing cues, and recommendations.
`,
  });
}
