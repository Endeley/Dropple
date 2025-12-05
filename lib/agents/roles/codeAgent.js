import { runAgent } from "../baseAgent";

export async function codeAgent(state, bus) {
  return runAgent({
    name: "Code Agent",
    bus,
    input: state.uiAgent,
    rolePrompt: `
You are the Code Engineer.
Generate Next.js App Router + Tailwind + Motion blueprint.

Return:
{
  "code": {
    "components": {...},
    "pages": {...},
    "styles": {...},
    "tokens": {...}
  }
}
`
  });
}
