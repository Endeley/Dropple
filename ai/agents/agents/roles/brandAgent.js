import { runAgent } from "../shared/baseAgent";

export async function brandAgent(state, bus) {
  return runAgent({
    name: "Brand Agent",
    bus,
    input: state.prompt,
    rolePrompt: `
You are the Brand Designer AI.
Create a complete brand identity including:

- brand name
- logo concepts (text descriptions)
- color palette (primary, secondary, neutrals)
- typography (heading, body)
- spacing system
- design tokens

Return:
{
  "brand": {...}
}
`
  });
}
