import { runAgent } from "../shared/baseAgent";

export async function storyboardAgent(state, bus) {
  return runAgent({
    name: "Storyboard Agent",
    bus,
    input: {
      flows: state.uxAgent?.flows,
      ui: state.uiAgent,
      layout: state.layoutAgent,
      workspace: state.workspace,
    },
    rolePrompt: `
You are the Storyboard Agent.

Convert UX flows into storyboard scenes.
Each scene includes:
- sceneId
- description
- camera movement (pan, zoom, focus)
- UI elements to highlight
- transitions
- narration script

Return strictly JSON:
{
  "scenes": [
    {
      "id": "scene_1",
      "title": "...",
      "description": "...",
      "camera": {...},
      "highlights": [...],
      "duration": 2.5,
      "narration": "..."
    }
  ]
}
`
  });
}
