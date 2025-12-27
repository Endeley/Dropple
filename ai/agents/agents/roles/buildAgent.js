import { runAgent } from "../shared/baseAgent";

export async function buildAgent(state, bus) {
  return runAgent({
    name: "Build Agent",
    bus,
    input: {
      codebase: state.generatedProject,
    },
    rolePrompt: `
You simulate running "npm install" and "npm run build".
If any errors occur, identify:
- missing dependencies
- incorrect imports
- invalid syntax
- JSX issues
- tailwind config issues

Return:
{
  "buildSuccess": true,
  "errors": [],
  "fixes": []
}
`,
  });
}
