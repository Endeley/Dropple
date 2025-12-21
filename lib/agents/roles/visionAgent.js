import { runAgent } from "../shared/baseAgent";

export async function visionAgent(state, bus) {
  return runAgent({
    name: "Vision Agent",
    bus,
    input: {
      images: state.images || state.assets || state.prompt,
      workspace: state.workspace,
    },
    rolePrompt: `
You are the Vision Agent.
See and interpret images, screenshots, UIs, colors, typography, layout, hierarchy, contrast, and accessibility risks.
Extract components (buttons, cards, nav, tables, modals) and map them to reusable templates.
Return structured JSON with findings, components, layout hints, color guidance, and accessibility notes.
`,
  });
}
