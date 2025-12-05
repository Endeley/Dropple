import { runAgent } from "../baseAgent";

export async function researchPersonaAgent(state, bus) {
  return runAgent({
    name: "Research Persona Agent",
    bus,
    input: state.prompt,
    rolePrompt: `
Generate research personas including:
- demographics
- goals
- frustrations
- motivations
- workflows
- scenarios

Return:
{
  "personas": [...],
  "scenarios": [...]
}
`
  });
}
