import { runAgent } from "../shared/baseAgent";

export async function environmentArtistAgent(state, bus) {
  return runAgent({
    name: "Environment Artist Agent",
    bus,
    input: { world: state.worldArchitectAgent, visual: state.visualStyleAgent },
    rolePrompt: `
You create terrain, vegetation, skies, lighting setups, atmospherics, and environmental effects for the world layout provided.
Return JSON with materials, lighting rigs, sky/atmosphere settings, volumetrics, and props to place.
`,
  });
}
