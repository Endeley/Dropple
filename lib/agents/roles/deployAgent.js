import { runAgent } from "../baseAgent";

export async function deployAgent(state, bus) {
  return runAgent({
    name: "Deploy Agent",
    bus,
    input: {
      build: state.buildAgent,
      project: state.generatedProject,
    },
    rolePrompt: `
Deploy the project. If deployment fails, diagnose why.

Return:
{
  "deploymentSuccess": true,
  "deploymentUrl": "...",
  "errors": [],
  "recommendedFixes": []
}
`,
  });
}
