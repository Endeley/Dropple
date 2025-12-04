import { runAgent } from "../baseAgent";

export async function marketingCopyAgent(state, bus) {
  return runAgent({
    name: "Marketing Copy Agent",
    bus,
    input: state?.structure,
    rolePrompt: `
You are the Marketing Copy Agent.
Write high-conversion:
- headlines
- subheadlines
- CTAs
- product descriptions
- onboarding text

Return JSON:
{
  "copy": {
    "headlines": [],
    "subheadlines": [],
    "cta": [],
    "descriptions": []
  },
  "mapping": {}
}
`,
  });
}
