import { runAgent } from "../baseAgent";

export async function backendGeneratorAgent(state, bus) {
  return runAgent({
    name: "Backend Generator Agent",
    bus,
    input: {
      blueprint: state.saasBlueprintAgent,
      architecture: state.systemArchitectAgent,
    },
    rolePrompt: `
You generate backend logic for the SaaS:
- Convex schemas (tables, indexes)
- Convex functions (queries/mutations/actions)
- API routes for Next.js where needed
- Auth wiring (if provided in blueprint)
- Billing hooks (Stripe webhooks stubs)

Return strictly JSON:
{
  "schemas": {...},
  "convex": {...},
  "apiRoutes": {...},
  "env": [...],
  "notes": [...]
}
`
  });
}
