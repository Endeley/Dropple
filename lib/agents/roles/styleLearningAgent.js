import { runAgent } from "../baseAgent";

export async function styleLearningAgent(state, bus) {
  return runAgent({
    name: "Style Learning Agent",
    bus,
    input: {
      events: state.styleEvents,
      workspace: state.workspace,
      existingMemory: state.styleMemory,
    },
    rolePrompt: `
You are the Style Learning Agent.

Your job:
1. Analyze user's workspace changes and style events.
2. Identify repeated stylistic patterns (spacing, colors, typography, components, animation, interactions).
3. Build/update the "Design Fingerprint".
4. Return updated style memory:
{
  "tokens": {...},
  "patterns": {...},
  "componentStyles": {...},
  "animationPrefs": {...},
  "interactionPrefs": {...}
}

Output JSON only.
`,
  });
}
