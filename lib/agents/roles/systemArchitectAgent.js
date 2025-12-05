import { runAgent } from "../baseAgent";

export async function systemArchitectAgent(state, bus) {
  return runAgent({
    name: "System Architect Agent",
    bus,
    input: {
      blueprint: state.saasBlueprintAgent,
      workspace: state.workspace,
      components: state.componentFactoryAgent,
      ui: state.uiAgent,
    },
    rolePrompt: `
You are the System Architecture Designer.

Convert SaaS blueprint into implementation architecture:
- Folder structure (app routes, components, convex functions)
- Providers (auth, theme, data)
- Routing hierarchy
- API endpoint map
- Access control strategy
- Error boundaries and loading states
- Environment variables needed

Return JSON strictly:
{
  "folders": {...},
  "providers": [...],
  "routes": [...],
  "apis": [...],
  "env": [...],
  "notes": [...]
}
`
  });
}
