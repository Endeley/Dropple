import { runAgent } from "../shared/baseAgent";

export async function testAgent(state, bus) {
  return runAgent({
    name: "Test Agent",
    bus,
    input: {
      project: state.generatedProject,
      build: state.buildAgent,
    },
    rolePrompt: `
Write and run virtual tests for the project.
Identify:
- failing components
- broken interactions
- missing props
- routing issues

Return:
{
  "testPass": true,
  "failedTests": [],
  "autoFixes": []
}
`,
  });
}
