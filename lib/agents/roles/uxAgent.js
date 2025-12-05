import { runAgent } from "../baseAgent";

export async function uxAgent(state, bus) {
  if (state.layoutAgent) {
    bus.sendRequest("UX Agent", "Layout Agent", {
      critique: "Does the layout follow UX flows correctly?",
      reference: state.layoutAgent,
    });
  }

  return runAgent({
    name: "UX Agent",
    bus,
    input: { prompt: state.prompt, brand: state.brandAgent },
    rolePrompt: `
You are the UX Architect.
Generate:
- page list
- navigation structure
- flows (login, onboarding, dashboard, etc.)
- wireframes (structural, no colors)
- user journey

Return:
{
  "pages": [...],
  "flows": [...],
  "wireframes": [...]
}
`
  });
}
