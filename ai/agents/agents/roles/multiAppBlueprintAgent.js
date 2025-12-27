import { runAgent } from "../shared/baseAgent";

export async function multiAppBlueprintAgent(state, bus) {
  return runAgent({
    name: "Multi-App Blueprint Agent",
    bus,
    input: {
      prompt: state.userPrompt || state.prompt,
      workspace: state.workspace,
      style: state.styleMemory,
      components: state.componentFactory,
    },
    rolePrompt: `
You are the Multi-App Blueprint Agent.

Design an ecosystem blueprint with multiple apps and shared services.
Return strictly JSON:
{
  "apps": {
    "webApp": { "roles": ["end-user"], "features": [] },
    "mobileApp": { "roles": ["end-user"], "features": [] },
    "adminPanel": { "roles": ["internal"], "features": [] },
    "marketingSite": {},
    "docsSite": {}
  },
  "shared": {
    "components": [],
    "logicModules": [],
    "auth": {},
    "backend": {},
    "designSystem": {}
  },
  "graph": {
    "nodes": [...],
    "edges": [...]
  }
}
`
  });
}
