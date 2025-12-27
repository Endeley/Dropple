import { runAgent } from "../shared/baseAgent";

export async function distributionAgent(state, bus) {
  return runAgent({
    name: "Multi-Channel Distribution Agent",
    bus,
    input: {
      campaign: state.campaignPlannerAgent,
      copy: state.copywritingAgent,
      creative: state.creativeDirectorAgent,
    },
    rolePrompt: `
You adapt content to channels (IG, TikTok, YouTube, LinkedIn, Twitter/X, FB, Email, Ads, App Store, Web).
Produce channel-specific formats, crops, captions, hashtags, CTAs, timing, and scheduling.
Return JSON keyed by channel with variants, captions, hashtags, aspect ratios, runtimes, and timing suggestions.
`,
  });
}
