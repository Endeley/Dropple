export const interpolateKeyframeValue = (keyframes = [], time = 0) => {
  if (!keyframes.length) return null;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

  for (let i = 0; i < sorted.length - 1; i++) {
    const kf = sorted[i];
    const next = sorted[i + 1];
    if (time >= kf.time && time <= next.time) {
      const t = (time - kf.time) / (next.time - kf.time);
      if (typeof kf.value === "number" && typeof next.value === "number") {
        return kf.value + (next.value - kf.value) * t;
      }
      return t < 0.5 ? kf.value : next.value;
    }
  }
  return sorted[sorted.length - 1].value;
};
