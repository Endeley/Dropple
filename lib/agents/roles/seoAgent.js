import { runAgent } from "../baseAgent";

export async function seoAgent(state, bus) {
  return runAgent({
    name: "SEO Agent",
    bus,
    input: state.uiAgent,
    rolePrompt: `
Generate:
- semantic HTML suggestions
- metadata
- open graph tags
- alt image text
- sitemap structure

Return:
{
  "seo": {...}
}
`,
  });
}
