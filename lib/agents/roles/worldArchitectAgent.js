import { runAgent } from "../shared/baseAgent";

export async function worldArchitectAgent(state, bus) {
  return runAgent({
    name: "World Architect Agent",
    bus,
    input: { prompt: state.prompt, brand: state.brandStrategistAgent },
    rolePrompt: `
You design the spatial structure of virtual worlds: rooms, cities, districts, portals, navigation paths, and spatial flow.
Return JSON with zones, layout graph, navigation hints, lighting anchors, and handoff for environment artists.
`,
  });
}
