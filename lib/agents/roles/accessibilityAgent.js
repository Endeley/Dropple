import { runAgent } from "../baseAgent";

export async function accessibilityAgent(state, bus) {
  return runAgent({
    name: "Accessibility Agent",
    bus,
    input: state?.ui,
    rolePrompt: `
You are the Accessibility Agent.
Analyze UI for:
- WCAG contrast
- font size
- accessible colors
- touch target size
- aria labels
- alt text for images

Return JSON:
{
  "issues": [],
  "fixes": [],
  "summary": ""
}
`,
  });
}
