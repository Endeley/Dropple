export function applyPrototypeBlueprint(bp = {}, store) {
  if (!store) return;
  const flows = bp.flows || [];
  const microInteractions = bp.microInteractions || [];

  flows.forEach((flow) => {
    if (!flow?.triggerLayerId) return;
    const interaction = {
      id: "int_" + crypto.randomUUID(),
      action: "navigate",
      target: flow.targetScreenId,
      transition: flow.transition || { type: "fade", duration: 400 },
    };
    store.addInteraction(flow.triggerLayerId, interaction);
  });

  microInteractions.forEach((mi) => {
    const anim = generateMicroInteraction(mi);
    if (!anim) return;
    store.addAnimation(anim, mi.layerId ? [mi.layerId] : null);
  });
}

function generateMicroInteraction(mi) {
  if (!mi?.interaction) return null;
  const layerId = mi.layerId;
  switch (mi.interaction) {
    case "tapBounce":
      return {
        id: "anim_" + crypto.randomUUID(),
        trigger: "onClick",
        duration: 400,
        tracks: [
          {
            property: "scale",
            keyframes: [
              { time: 0, value: 1 },
              { time: 120, value: 0.92, easing: "ease-out" },
              { time: 240, value: 1.04, easing: "ease-in" },
              { time: 400, value: 1, easing: "spring" },
            ],
          },
        ],
        layerIds: layerId ? [layerId] : [],
      };
    case "hoverGlow":
      return {
        id: "anim_" + crypto.randomUUID(),
        trigger: "onHover",
        duration: 300,
        tracks: [
          {
            property: "opacity",
            keyframes: [
              { time: 0, value: 1 },
              { time: 300, value: 1 },
            ],
          },
          {
            property: "blur",
            keyframes: [
              { time: 0, value: 0 },
              { time: 300, value: 6, easing: "ease-out" },
            ],
          },
        ],
        layerIds: layerId ? [layerId] : [],
      };
    default:
      return null;
  }
}
