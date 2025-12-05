import { runAgent } from "../baseAgent";

export async function physicsBehaviorAgent(state, bus) {
  return runAgent({
    name: "Physics Behavior Agent",
    bus,
    input: { world: state.worldArchitectAgent, interactions: state.spatialInteractionAgent },
    rolePrompt: `
You define physics and behaviors: rigid/soft bodies, gravity, collisions, constraints, particles, cloth/fluid approximations, and ECS-like behavior scripts.
Return JSON with physics config, entity behavior scripts, and simulation parameters.
`,
  });
}
