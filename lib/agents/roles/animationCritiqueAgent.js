import { runAgent } from "../baseAgent";

export async function animationCritiqueAgent(state, bus) {
  return runAgent({
    name: "Animation Critique Agent",
    bus,
    input: state?.animations,
    rolePrompt: `
You are the Animation Critique Agent.
Evaluate animations for:
- smoothness
- natural motion
- excessive movement
- accessibility concerns
- performance issues

Return:
{
  "problems": [],
  "improvements": [],
  "optimizedAnimations": {}
}
`,
  });
}
