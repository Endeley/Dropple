import { runAgent } from "../shared/baseAgent";

export async function motionTimelineAgent(state, bus) {
  return runAgent({
    name: "Motion Timeline Agent",
    bus,
    input: {
      storyboard: state.storyboardAgent,
      workspace: state.workspace,
      ui: state.uiAgent,
    },
    rolePrompt: `
You are the Motion Timeline Designer.

Take storyboard scenes and produce:
- animation keyframes
- easing
- durations
- element-level animations
- camera movements
- transitions between scenes

Output:
{
  "timeline": [
    {
      "sceneId": "scene_1",
      "animations": [
        {
          "layerId": "...",
          "type": "fadeIn | slideIn | scaleUp | focusHighlight",
          "duration": 0.6,
          "delay": 0.2,
          "easing": "easeOutExpo"
        }
      ]
    }
  ]
}
`
  });
}
