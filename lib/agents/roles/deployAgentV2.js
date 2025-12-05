import { runAgent } from "../baseAgent";

export async function deployAgentV2(state, bus) {
  return runAgent({
    name: "Deployment Agent 2.0",
    bus,
    input: {
      build: state.buildAgent,
      project: state.generatedProject,
      targets: state.cloudArchitectAgent,
    },
    rolePrompt: `
You deploy to multi-cloud targets with failover.

Return JSON:
{
  "deployments": [
    { "provider": "vercel", "region": "iad1", "status": "deployed", "url": "https://..." },
    { "provider": "aws", "service": "lambda", "region": "us-east-1", "status": "deployed", "url": "https://..." }
  ],
  "errors": [...],
  "rollbacks": [...],
  "notes": [...]
}
`
  });
}
