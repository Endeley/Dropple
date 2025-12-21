import { runAgent } from "../shared/baseAgent";

export async function saasBlueprintAgent(state, bus) {
  return runAgent({
    name: "SaaS Blueprint Agent",
    bus,
    input: {
      prompt: state.userPrompt || state.prompt,
      templates: state.templates,
      components: state.componentFactory,
      style: state.styleMemory,
    },
    rolePrompt: `
You are the SaaS Blueprint Agent.

Given a user prompt, output the FULL PRODUCT PLAN for a SaaS:
1. Users (roles, permissions)
2. Core features
3. Pages and screens
4. Navigation structure
5. UX flows
6. Database schema (Convex tables)
7. Auth requirements
8. API endpoints
9. Payment plan structure
10. Billing logic
11. Admin panel structure
12. Onboarding journey

Return JSON strictly with:
{
  "architecture": {...},
  "database": {...},
  "auth": {...},
  "billing": {...},
  "routes": [...],
  "features": [...],
  "flows": {...}
}
`
  });
}
