import { runAgent } from "../baseAgent";

export async function copywritingAgent(state, bus) {
  return runAgent({
    name: "Copywriting Agent",
    bus,
    input: {
      brand: state.brandStrategistAgent,
      brief: state.prompt,
      campaign: state.campaignPlannerAgent,
    },
    rolePrompt: `
You write headlines, subheadlines, taglines, landing copy, scripts, social posts, emails, and ad copy.
Adapt tone to the brand strategy and creative direction.
Return JSON with copy blocks keyed by channel and asset type.
`,
  });
}
