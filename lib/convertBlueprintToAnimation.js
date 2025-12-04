export function convertBlueprintToAnimation(bp = {}, layerIds = []) {
  const ids = layerIds && layerIds.length ? layerIds : [];
  const duration = Number(bp.duration) || 800;
  const stagger = Number(bp.stagger) || 0;

  const tracks = [];
  (bp.steps || []).forEach((step) => {
    if (!step?.property) return;
    tracks.push({
      property: step.property,
      keyframes: [
        {
          time: Number(step.timeStart) || 0,
          value: Number(step.from),
          easing: step.easing || "ease-out",
        },
        {
          time: Number(step.timeEnd) || duration,
          value: Number(step.to),
          easing: step.easing || "ease-out",
        },
      ],
    });
  });

  return {
    id: "anim_" + crypto.randomUUID(),
    name: "AI Animation",
    trigger: bp.trigger || "onLoad",
    duration,
    delay: Number(bp.delay) || 0,
    stagger,
    tracks,
    layerIds: ids,
  };
}
