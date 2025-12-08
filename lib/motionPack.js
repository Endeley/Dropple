import { motionThemes } from "./motionThemes";
import { motionPresets } from "./motionPresets";

/**
 * Minimal motion pack schema helper.
 * A pack bundles themes, presets, transitions, and timelines for reuse/export.
 */
export function createMotionPack({
  id,
  name,
  version = "1.0.0",
  author = "system",
  themes = [],
  presets = [],
  transitions = [],
  timelines = [],
  meta = {},
}) {
  return {
    id: id || `pack_${crypto.randomUUID()}`,
    name: name || "Motion Pack",
    version,
    author,
    contents: {
      themes,
      presets,
      transitions,
      timelines,
    },
    meta: {
      category: meta.category || "general",
      tags: meta.tags || [],
      motionIntensity: meta.motionIntensity ?? null,
    },
  };
}

/**
 * Build a starter pack from existing in-memory libraries.
 */
export function buildStarterPack() {
  return createMotionPack({
    id: "starter_pack",
    name: "Starter Motion Pack",
    themes: motionThemes,
    presets: motionPresets,
    transitions: [],
    timelines: [],
    meta: { category: "starter", tags: ["starter", "default"], motionIntensity: 0.6 },
  });
}

/**
 * Validate a motion pack shape (lightweight check).
 */
export function validateMotionPack(pack = {}) {
  const errors = [];
  if (!pack.id) errors.push("id required");
  if (!pack.name) errors.push("name required");
  if (!pack.contents) errors.push("contents missing");
  const c = pack.contents || {};
  ["themes", "presets", "transitions", "timelines"].forEach((k) => {
    if (!Array.isArray(c[k])) errors.push(`${k} must be array`);
  });
  return { valid: errors.length === 0, errors };
}

/**
 * Import a pack into local libraries (in-memory merge).
 * Callers should persist the returned collections to the store/db.
 */
export function mergeMotionPack(pack, { existingThemes = [], existingPresets = [] } = {}) {
  const contents = pack?.contents || {};
  const themes = mergeById(existingThemes, contents.themes || []);
  const presets = mergeById(existingPresets, contents.presets || []);
  return { themes, presets, transitions: contents.transitions || [], timelines: contents.timelines || [] };
}

function mergeById(base = [], incoming = []) {
  const map = new Map(base.map((item) => [item.id, item]));
  incoming.forEach((item) => {
    if (!item?.id) return;
    map.set(item.id, item);
  });
  return Array.from(map.values());
}
