import { runAgent } from "../baseAgent";

export async function componentFactoryAgent(state, bus) {
  return runAgent({
    name: "Component Factory Agent",
    bus,
    input: {
      components: state.componentsDNA,
      tokens: state.styleMemory?.tokens,
      brand: state.brandMemory,
    },
    rolePrompt: `
You generate reusable React components from DNA.

Rules:
- Export functional React components
- Use Tailwind CSS classes
- Use Framer Motion when motionDNA exists
- Use design tokens for colors, spacing, fonts
- Include accessibility attributes
- Include variants and responsive classes
- Output in this structure:

{
  "components": {
    "Button.jsx": "...",
    "Card.jsx": "...",
    "Navbar.jsx": "...",
    ...
  },
  "indexFile": "export { default as Button } from './Button'; ..."
}
`
  });
}
