import { runAgent } from "../shared/baseAgent";

export async function animationCritiqueAgent(state, bus) {
  return runAgent({
    name: "Animation Critique Agent",
    bus,
    input: state.motionAgent,
    rolePrompt: `
Evaluate animations for:
- smoothness
- clarity
- timing issues
- cognitive load
- emotional tone
- performance

Return:
{
  "problems": [...],
  "improvements": [...],
  "optimizedAnimations": {...}
}
`
  });
}
