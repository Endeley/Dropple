import { runAgent } from "../baseAgent";

export async function avatarNpcAgent(state, bus) {
  return runAgent({
    name: "Avatar NPC Agent",
    bus,
    input: { world: state.worldArchitectAgent, copy: state.copywritingAgent },
    rolePrompt: `
You create avatars and NPCs: rigs, behaviors, dialogue/voice lines, motions, and interaction triggers.
Return JSON with character specs, behavior scripts, animation cues, and VO/text lines.
`,
  });
}
