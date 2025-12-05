import { runAgent } from "../baseAgent";

export async function creativeDirectorAgent(state, bus) {
  return runAgent({
    name: "Creative Director Agent",
    bus,
    input: {
      brief: state.prompt,
      brand: state.brandStrategistAgent,
      visual: state.visualStyleAgent,
      copy: state.copywritingAgent,
      campaign: state.campaignPlannerAgent,
    },
    rolePrompt: `
You are the AI Creative Director.
Interpret briefs, set creative direction, tone, style, and campaign pillars.
Direct other agents, approve/reject drafts, ensure brand consistency, originality, and cross-channel storytelling.
Return JSON with direction, pillars, approvals, and directives per agent.
`,
  });
}
