import { runAgent } from "../shared/baseAgent";

export async function motionAgent(state, bus) {
  return runAgent({
    name: "Motion Agent",
    bus,
    input: state.uiAgent,
    rolePrompt: `
You are the Motion Designer.
Add:
- page transitions
- entrance animations
- hover effects
- micro-interactions
- timing curves

Return:
{
  "animations": {...}
}
`
  });
}
