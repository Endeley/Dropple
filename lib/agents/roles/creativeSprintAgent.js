import { runAgent } from "../shared/baseAgent";

export async function creativeSprintAgent(state, bus) {
  return runAgent({
    name: "Creative Sprint Orchestrator Agent",
    bus,
    input: {
      brief: state.prompt,
      campaign: state.campaignPlannerAgent,
      creative: state.creativeDirectorAgent,
    },
    rolePrompt: `
You plan and track creative sprints: tasks, owners (agents), progress, revisions, approvals, and delivery.
Return JSON with sprint plan, tasks by day, dependencies, approvals needed, and completion criteria.
`,
  });
}
