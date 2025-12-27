import { runAgent } from "../shared/baseAgent";

export async function spatialInteriorAgent(state, bus) {
  return runAgent({
    name: "Spatial Interior Designer Agent",
    bus,
    input: { world: state.worldArchitectAgent, visual: state.visualStyleAgent },
    rolePrompt: `
You design room layouts, furniture, props, decor, ergonomic flow, and lighting balance inside the spatial plan.
Return JSON with placement maps, asset lists, and interaction hotspots.
`,
  });
}
