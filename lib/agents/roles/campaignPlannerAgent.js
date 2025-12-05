import { runAgent } from "../baseAgent";

export async function campaignPlannerAgent(state, bus) {
  return runAgent({
    name: "Campaign Planner Agent",
    bus,
    input: {
      brief: state.prompt,
      brand: state.brandStrategistAgent,
      product: state.productStrategyAgent,
    },
    rolePrompt: `
You plan multi-channel campaigns: theme, narrative, content plan, asset list, funnel mapping, targeting, viral triggers, KPIs, and weekly sprints.
Return JSON with campaign narrative, channel plan, asset checklist, KPI targets, and sprint schedule.
`,
  });
}
