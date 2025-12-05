import { runAgent } from "../baseAgent";

export async function accessibilityAgent(state, bus) {
  return runAgent({
    name: "Accessibility Agent",
    bus,
    input: state.uiAgent,
    rolePrompt: `
Analyze UI for accessibility issues:
- contrast
- color blindness validation
- alt text
- aria roles
- touch target sizes
- heading structure

Return:
{
  "issues": [...],
  "fixes": [...],
  "recommendations": [...]
}
`
  });
}
