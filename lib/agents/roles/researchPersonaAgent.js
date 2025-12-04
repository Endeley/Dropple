import { runAgent } from "../baseAgent";

export async function researchPersonaAgent(state, bus) {
  return runAgent({
    name: "Research Persona Agent",
    bus,
    input: state?.structure,
    rolePrompt: `
You are the Research Persona Agent.
Create:
- personas
- motivations
- pain points
- behavior patterns
- goals

Return:
{
  "personas": [],
  "scenarios": [],
  "journeys": []
}
`,
  });
}
