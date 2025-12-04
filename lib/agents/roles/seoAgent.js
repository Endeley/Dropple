import { runAgent } from "../baseAgent";

export async function seoAgent(state, bus) {
  return runAgent({
    name: "SEO Agent",
    bus,
    input: state?.ui,
    rolePrompt: `
Generate:
- semantic HTML suggestions
- meta tags
- OG image specs
- alt text
- sitemaps

Return:
{
  "seo": {}
}
`,
  });
}
