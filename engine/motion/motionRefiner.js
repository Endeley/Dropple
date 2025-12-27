import { deepClone } from "@/engine/utils/deepClone";

const DEFAULT_EASE = "easeOutCubic";
const TARGET_DURATION = 0.48; // seconds
const DURATION_TOLERANCE = 0.3;
const DISTANCE_TARGET = 32;
const DISTANCE_TOLERANCE = 0.35;

function collectDurations(anim) {
  const durations = [];
  const variants = anim?.variants || anim?.states || {};
  Object.values(variants || {}).forEach((v) => {
    if (v?.transition?.duration !== undefined) durations.push(Number(v.transition.duration));
    if (v?.duration !== undefined) durations.push(Number(v.duration));
  });
  (anim?.tracks || []).forEach((t) => {
    (t.keyframes || []).forEach((kf) => {
      if (kf.duration !== undefined) durations.push(Number(kf.duration) / 1000);
    });
  });
  return durations.filter((n) => !Number.isNaN(n) && n > 0);
}

function collectDistances(anim) {
  const vals = [];
  const variants = anim?.variants || anim?.states || {};
  Object.values(variants || {}).forEach((v) => {
    ["x", "y", "translateX", "translateY"].forEach((key) => {
      if (typeof v?.[key] === "number") vals.push(Math.abs(v[key]));
    });
  });
  (anim?.tracks || []).forEach((t) => {
    if (t.property === "x" || t.property === "y") {
      (t.keyframes || []).forEach((kf) => {
        if (typeof kf.value === "number") vals.push(Math.abs(kf.value));
      });
    }
  });
  return vals.filter((n) => !Number.isNaN(n));
}

function dominantEase(anim) {
  const variants = anim?.variants || anim?.states || {};
  const eases = [];
  Object.values(variants || {}).forEach((v) => {
    if (v?.transition?.ease) eases.push(v.transition.ease);
  });
  (anim?.tracks || []).forEach((t) => {
    (t.keyframes || []).forEach((kf) => {
      if (kf.easing || kf.ease) eases.push(kf.easing || kf.ease);
    });
  });
  return eases;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function analyzeMotion(template = {}) {
  const layers = template.layers || [];
  const durations = [];
  const distances = [];
  const easeUsage = {};
  layers.forEach((l) => {
    (l.animations || []).forEach((a) => {
      collectDurations(a).forEach((d) => durations.push(d));
      collectDistances(a).forEach((d) => distances.push(d));
      dominantEase(a).forEach((e) => {
        if (!e) return;
        easeUsage[e] = (easeUsage[e] || 0) + 1;
      });
    });
  });

  const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const avgDistance = distances.length ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;

  const issues = [];
  if (avgDuration && (avgDuration < TARGET_DURATION * (1 - DURATION_TOLERANCE) || avgDuration > TARGET_DURATION * (1 + DURATION_TOLERANCE))) {
    issues.push("Durations feel uneven");
  }
  if (avgDistance && (avgDistance < DISTANCE_TARGET * (1 - DISTANCE_TOLERANCE) || avgDistance > DISTANCE_TARGET * (1 + DISTANCE_TOLERANCE))) {
    issues.push("Motion distances vary widely");
  }
  if (Object.keys(easeUsage).length > 3) {
    issues.push("Easing curves are inconsistent");
  }

  return {
    avgDuration,
    medianDuration: median(durations),
    avgDistance,
    medianDistance: median(distances),
    easeUsage,
    issues,
  };
}

function normalizeAnimation(anim, durationTarget, distanceTarget, easeTarget) {
  const variants = anim.variants || anim.states || {};
  const nextVariants = {};
  Object.entries(variants).forEach(([key, v]) => {
    const next = { ...v };
    ["x", "y", "translateX", "translateY"].forEach((prop) => {
      if (typeof next[prop] === "number") {
        const sign = next[prop] >= 0 ? 1 : -1;
        next[prop] = sign * clamp(Math.abs(next[prop]), distanceTarget * 0.5, distanceTarget * 1.5);
      }
    });
    if (next.transition) {
      const t = { ...next.transition };
      if (t.duration !== undefined) t.duration = clamp(t.duration * 1, durationTarget * 0.5, durationTarget * 1.5);
      t.ease = easeTarget;
      next.transition = t;
    }
    nextVariants[key] = next;
  });

  const nextTracks = (anim.tracks || []).map((t) => ({
    ...t,
    keyframes: (t.keyframes || []).map((kf) => ({
      ...kf,
      easing: kf.easing || easeTarget,
      duration: kf.duration !== undefined ? clamp(kf.duration, durationTarget * 500, durationTarget * 1500) : kf.duration,
    })),
  }));

  return {
    ...anim,
    variants: nextVariants,
    tracks: nextTracks,
    scroll: anim.scroll,
  };
}

export function refineMotion(template = {}, options = {}) {
  const durationTarget = options.duration || TARGET_DURATION;
  const distanceTarget = options.distance || DISTANCE_TARGET;
  const easeTarget = options.ease || DEFAULT_EASE;

  const next = deepClone(template);
  const layers = next.layers || [];
  layers.forEach((l, idx) => {
    if (!l.animations?.length) return;
    next.layers[idx] = {
      ...l,
      animations: l.animations.map((a) => normalizeAnimation(a, durationTarget, distanceTarget, easeTarget)),
    };
  });

  const analysis = analyzeMotion(next);

  const suggestions = [];
  if (analysis.avgDuration > durationTarget * 1.2) suggestions.push("Animations were long; durations normalized.");
  if (analysis.avgDuration < durationTarget * 0.8) suggestions.push("Animations were short; durations smoothed.");
  if (analysis.avgDistance > distanceTarget * 1.2) suggestions.push("Large motion distances reduced.");
  if (analysis.avgDistance < distanceTarget * 0.8) suggestions.push("Motion distances slightly increased for readability.");
  if ((analysis.easeUsage && Object.keys(analysis.easeUsage).length > 3) || !analysis.easeUsage[easeTarget]) {
    suggestions.push(`Easing unified to ${easeTarget}.`);
  }

  return { template: next, analysis, suggestions };
}
