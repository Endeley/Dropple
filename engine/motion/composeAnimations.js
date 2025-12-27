import { findLayer } from "../utils/findLayer";

export function composeAnimations(timeline = [], workspace) {
  return timeline.map((scene) => ({
    ...scene,
    frames: (scene.animations || []).map((anim) =>
      generateFrameData(anim, workspace),
    ),
  }));
}

function generateFrameData(anim, workspace) {
  const layer = findLayer(workspace, anim.layerId);
  return {
    layerId: anim.layerId,
    type: anim.type,
    duration: anim.duration,
    delay: anim.delay,
    easing: anim.easing,
    keyframes: computeKeyframes(layer, anim),
  };
}

function computeKeyframes(layer, anim) {
  if (!layer) return [];
  // Placeholder keyframes based on action type; can be expanded.
  if (anim.type === "fadeIn") {
    return [
      { t: 0, opacity: 0 },
      { t: 1, opacity: 1 },
    ];
  }
  if (anim.type === "slideIn") {
    return [
      { t: 0, x: (layer.x || 0) - 40, opacity: 0 },
      { t: 1, x: layer.x || 0, opacity: 1 },
    ];
  }
  return [{ t: 0 }, { t: 1 }];
}
