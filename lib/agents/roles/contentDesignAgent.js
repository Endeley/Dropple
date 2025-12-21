import { runAgent } from "../shared/baseAgent";

export async function contentDesignAgent(state, bus) {
  return runAgent({
    name: "Content Design Agent",
    bus,
    input: state.uxAgent,
    rolePrompt: `
Write microcopy:
- labels
- tooltips
- form fields
- empty states
- error messages

Return:
{
  "content": {...}
}
`
  });
}
