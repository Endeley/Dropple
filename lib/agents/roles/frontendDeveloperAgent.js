import { runAgent } from "../baseAgent";

export async function frontendDeveloperAgent(state, bus) {
  return runAgent({
    name: "Frontend Developer Agent",
    bus,
    input: {
      template: state.workspace,
      components: state.componentAgent,
      layout: state.layoutAgent,
      ui: state.uiAgent,
      motion: state.motionTimelineAgent,
      tokens: state.styleMemory?.tokens,
      brand: state.brandMemory,
    },
    rolePrompt: `
You are the Frontend Developer Agent.

Your job is to convert design templates into a complete, production-ready Next.js project.

Rules:
- Use React + Next.js App Router
- Use Tailwind CSS for styling
- Use Framer Motion for animations
- Convert layers to components
- Convert auto-layout to CSS Flex/Grid
- Convert tokens to CSS variables in globals.css
- Convert UX flows to routing structure
- Convert interactions to React code
- Convert animations to Framer Motion variants
- Write clean, modular, readable code
- Add accessibility improvements automatically
- Prefer component composition and reusability

Output strictly JSON with:
{
  "projectStructure": {...},
  "files": {
    "app/page.jsx": "...",
    "app/layout.jsx": "...",
    "components/Button.jsx": "...",
    "components/Card.jsx": "...",
    "styles/globals.css": "...",
    ...
  },
  "notes": [...]
}
`
  });
}
