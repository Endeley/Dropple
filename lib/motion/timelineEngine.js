const clamp01 = (v) => Math.min(1, Math.max(0, v));

const easingFns = {
  linear: (t) => t,
  "ease-in": (t) => t * t,
  "ease-out": (t) => 1 - (1 - t) * (1 - t),
  "ease-in-out": (t) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

function cubicBezierEase([p1x, p1y, p2x, p2y]) {
  // Lightweight cubic-bezier implementation for runtime interpolation.
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDx = (t) => (3 * ax * t + 2 * bx) * t + cx;

  const solveX = (x) => {
    let t = x;
    for (let i = 0; i < 6; i += 1) {
      const x2 = sampleX(t) - x;
      if (Math.abs(x2) < 1e-4) return t;
      const d = sampleDx(t);
      if (Math.abs(d) < 1e-4) break;
      t -= x2 / d;
    }
    // Fallback to bisection.
    let t0 = 0;
    let t1 = 1;
    t = x;
    while (t0 < t1) {
      const x2 = sampleX(t);
      if (Math.abs(x2 - x) < 1e-4) return t;
      if (x > x2) t0 = t;
      else t1 = t;
      t = (t1 - t0) * 0.5 + t0;
    }
    return t;
  };

  return (t) => sampleY(solveX(t));
}

export function getEasingFn(ease) {
  if (!ease) return easingFns.linear;
  const normalized = ease.toLowerCase();
  if (easingFns[normalized]) return easingFns[normalized];
  if (normalized.startsWith("cubic-bezier")) {
    const match = normalized.match(/cubic-bezier\(([^)]+)\)/);
    if (match?.[1]) {
      const points = match[1]
        .split(",")
        .map((n) => parseFloat(n.trim()))
        .filter((n) => Number.isFinite(n));
      if (points.length === 4) {
        return cubicBezierEase(points);
      }
    }
  }
  return easingFns.linear;
}

const interpolateNumbers = (a, b, t) => a + (b - a) * t;

const HEX_COLOR = /^#([0-9a-f]{3,8})$/i;
const RGB_COLOR = /^rgba?\(([^)]+)\)$/i;
const HSL_COLOR = /^hsla?\(([^)]+)\)$/i;

const parseHex = (hex) => {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b, a: 1 };
  }
  if (clean.length === 6 || clean.length === 8) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a =
      clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  return null;
};

const parseRgb = (value) => {
  const match = value.match(RGB_COLOR);
  if (!match?.[1]) return null;
  const parts = match[1]
    .split(",")
    .map((p) => p.trim())
    .map((p) => parseFloat(p));
  if (parts.length < 3) return null;
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
};

const parseHsl = (value) => {
  const match = value.match(HSL_COLOR);
  if (!match?.[1]) return null;
  const parts = match[1]
    .split(",")
    .map((p) => p.trim().replace("%", ""))
    .map((p) => parseFloat(p));
  if (parts.length < 3) return null;
  return { h: parts[0], s: parts[1] / 100, l: parts[2] / 100, a: parts[3] ?? 1 };
};

const hslToRgb = ({ h, s, l, a = 1 }) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  };
};

const rgbToString = ({ r, g, b, a = 1 }) =>
  `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;

const parseColor = (value) => {
  if (typeof value !== "string") return null;
  if (HEX_COLOR.test(value)) return parseHex(value);
  if (RGB_COLOR.test(value)) return parseRgb(value);
  if (HSL_COLOR.test(value)) return hslToRgb(parseHsl(value));
  return null;
};

const interpolateColor = (a, b, t) => {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return t < 0.5 ? a : b;
  return rgbToString({
    r: interpolateNumbers(ca.r, cb.r, t),
    g: interpolateNumbers(ca.g, cb.g, t),
    b: interpolateNumbers(ca.b, cb.b, t),
    a: interpolateNumbers(ca.a ?? 1, cb.a ?? 1, t),
  });
};

const isNumeric = (v) => typeof v === "number" && Number.isFinite(v);
const isColor = (v) => typeof v === "string" && parseColor(v);

const interpolateArray = (a, b, t) => {
  const len = Math.max(a.length, b.length);
  const result = [];
  for (let i = 0; i < len; i += 1) {
    const va = a[i];
    const vb = b[i];
    if (isNumeric(va) && isNumeric(vb)) {
      result[i] = interpolateNumbers(va, vb, t);
    } else if (isColor(va) && isColor(vb)) {
      result[i] = interpolateColor(va, vb, t);
    } else if (typeof va === "object" && typeof vb === "object") {
      result[i] = interpolateValues(va, vb, t);
    } else {
      result[i] = t < 0.5 ? va : vb;
    }
  }
  return result;
};

function interpolateValues(a, b, t) {
  if (isNumeric(a) && isNumeric(b)) {
    return interpolateNumbers(a, b, t);
  }

  if (isColor(a) && isColor(b)) {
    return interpolateColor(a, b, t);
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return interpolateArray(a, b, t);
  }

  if (typeof a === "object" && typeof b === "object") {
    const result = Array.isArray(a) ? [] : {};
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    keys.forEach((key) => {
      const va = a?.[key];
      const vb = b?.[key];
      if (isNumeric(va) && isNumeric(vb)) {
        result[key] = interpolateNumbers(va, vb, t);
      } else if (isColor(va) && isColor(vb)) {
        result[key] = interpolateColor(va, vb, t);
      } else if (typeof va === "object" && typeof vb === "object") {
        result[key] = interpolateValues(va, vb, t);
      } else {
        result[key] = t < 0.5 ? va : vb;
      }
    });
    return result;
  }

  return t < 0.5 ? a : b;
}

export function interpolateKeyframes(keyframes = [], timeMs = 0) {
  if (!keyframes.length) return null;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  if (timeMs <= sorted[0].time) return sorted[0].value;
  if (timeMs >= sorted[sorted.length - 1].time)
    return sorted[sorted.length - 1].value;

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const kf = sorted[i];
    const next = sorted[i + 1];
    if (timeMs >= kf.time && timeMs <= next.time) {
      const span = Math.max(1, next.time - kf.time);
      const rawT = (timeMs - kf.time) / span;
      const eased = getEasingFn(kf.easing || "linear")(clamp01(rawT));
      return interpolateValues(kf.value, next.value, eased);
    }
  }

  return sorted[sorted.length - 1].value;
}

export function evaluateTrack(track, timeMs) {
  if (!track) return null;
  return interpolateKeyframes(track.keyframes || [], timeMs);
}

export function evaluateAnimation(animation, timeMs) {
  if (!animation?.tracks) return {};
  const result = {};
  animation.tracks.forEach((track) => {
    result[track.property] = evaluateTrack(track, timeMs);
  });
  return result;
}
