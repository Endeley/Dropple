export const TrackTypes = ["audio", "video", "animation", "effect", "state"];

export const createTrack = (overrides = {}) => ({
  id: overrides.id || crypto.randomUUID?.() || `track_${Date.now()}`,
  type: overrides.type || "animation",
  name: overrides.name || "Track",
  clips: overrides.clips || [],
  keyframes: overrides.keyframes || [],
  muted: overrides.muted || false,
  hidden: overrides.hidden || false,
});

export const createClip = (overrides = {}) => ({
  id: overrides.id || crypto.randomUUID?.() || `clip_${Date.now()}`,
  start: overrides.start || 0,
  duration: overrides.duration || 1000,
  src: overrides.src || null,
  waveform: overrides.waveform || null,
  thumbnails: overrides.thumbnails || null,
});

export const createKeyframe = (overrides = {}) => ({
  id: overrides.id || crypto.randomUUID?.() || `kf_${Date.now()}`,
  time: overrides.time || 0,
  value: overrides.value ?? 0,
  easing: overrides.easing || "linear",
});

export const createMarker = (overrides = {}) => ({
  id: overrides.id || crypto.randomUUID?.() || `marker_${Date.now()}`,
  time: overrides.time || 0,
  label: overrides.label || "Marker",
  color: overrides.color || "#ffffff",
});
