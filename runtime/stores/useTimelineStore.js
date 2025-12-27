"use client";

import { create } from "zustand";
import { convexClient } from "@/lib/convex/client";

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2);

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

export const useTimelineStore = create((set, get) => ({
  duration: 5000,
  currentTime: 0,
  playing: false,
  zoom: 1,
  fps: 60,
  tracks: [],
  layers: [],
  curveEditor: {
    open: false,
    trackId: null,
    keyframeId: null,
    selectedKeyframe: null,
  },

  /* --- Actions --- */
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  togglePlay: () => set((state) => ({ playing: !state.playing })),

  setTime: (t) =>
    set((state) => ({
      currentTime: clamp(t, 0, state.duration),
    })),

  setDuration: (d) =>
    set((state) => ({
      duration: Math.max(200, d || 0),
      currentTime: Math.min(state.currentTime, Math.max(200, d || 0)),
    })),

  setZoom: (z) =>
    set(() => ({
      zoom: clamp(z || 1, 0.25, 4),
    })),

  setFps: (fps) =>
    set(() => ({
      fps: Math.max(1, fps || 1),
    })),

  setLayers: (layers) => set({ layers }),
  setTracks: (tracks) => set({ tracks }),

  updateClip: (trackId, clipId, updates) =>
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        return {
          ...t,
          clips: (t.clips || []).map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
        };
      }),
    })),

  addClip: (trackId, clip) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: [
                ...(t.clips || []),
                {
                  id: clip.id || generateId(),
                  start: clip.start ?? 0,
                  duration: clip.duration ?? 1000,
                  src: clip.src,
                  assetId: clip.assetId,
                  type: clip.type,
                  name: clip.name,
                  thumbnail: clip.thumbnail,
                  thumbnails: clip.thumbnails,
                  waveform: clip.waveform,
                },
              ],
            }
          : t,
      ),
    })),

  addTrack: ({ targetId, property, name, targetType = "node" }) => {
    const newTrack = {
      id: generateId(),
      targetId,
      property,
      name: name || property,
      targetType,
      keyframes: [],
    };
    set({ layers: [...get().layers, newTrack] });
  },

  addKeyframe: (trackId, time, value, ease = "linear") => {
    set({
      layers: get().layers.map((t) =>
        t.id === trackId
          ? {
              ...t,
              keyframes: [...t.keyframes, { id: generateId(), t: time, value, ease }].sort(
                (a, b) => a.t - b.t,
              ),
            }
          : t,
      ),
    });
  },

  moveKeyframe: (trackId, keyId, newTime) => {
    const duration = get().duration;
    set({
      layers: get().layers.map((t) => {
        if (t.id !== trackId) return t;
        const keyframes = t.keyframes
          .map((k) => (k.id === keyId ? { ...k, t: clamp(newTime, 0, duration) } : k))
          .sort((a, b) => a.t - b.t);
        return { ...t, keyframes };
      }),
    });
  },

  playTimelineForTarget: async (timelineId, targetId) => {
    // Placeholder hook for wiring timelines to state machines; currently reuse loadFromServer
    return get().loadFromServer(timelineId, targetId);
  },

  updateKeyframeEase: (trackId, keyId, handleType, point) => {
    set((state) => {
      const layers = state.layers.map((t) => {
        if (t.id !== trackId) return t;
        const keyframes = t.keyframes.map((k) => {
          if (k.id !== keyId) return k;
          const nextEase = {
            type: "bezier",
            in: k.ease?.in || { x: 0.25, y: 0.1 },
            out: k.ease?.out || { x: 0.25, y: 1 },
          };
          nextEase[handleType] = { ...(nextEase[handleType] || {}), ...point };
          return { ...k, ease: nextEase };
        });
        return { ...t, keyframes };
      });
      const editor = state.curveEditor;
      const selected =
        editor?.trackId && editor?.keyframeId
          ? layers
              .find((l) => l.id === editor.trackId)
              ?.keyframes.find((k) => k.id === editor.keyframeId) || null
          : null;
      return {
        layers,
        curveEditor: { ...(editor || {}), selectedKeyframe: selected },
      };
    });
  },

  openCurveEditor: (trackId, keyId) => {
    const layers = get().layers;
    const layer = layers.find((l) => l.id === trackId);
    const kf = layer?.keyframes?.find((k) => k.id === keyId) || null;
    set({
      curveEditor: {
        open: true,
        trackId,
        keyframeId: keyId,
        selectedKeyframe: kf,
      },
    });
  },

  closeCurveEditor: () =>
    set({
      curveEditor: {
        open: false,
        trackId: null,
        keyframeId: null,
        selectedKeyframe: null,
      },
    }),

  /* --- Persistence --- */
  saveToServer: async (projectId, sceneId) => {
    const state = get();
    if (!sceneId) return;
    try {
      await convexClient.mutation("animations:saveAnimation", {
        projectId: projectId || null,
        sceneId,
        duration: state.duration,
        fps: state.fps || 60,
        layers: state.layers,
      });
    } catch (err) {
      console.error("Failed to save animation", err);
    }
  },

  loadFromServer: async (sceneId) => {
    if (!sceneId) return;
    try {
      const data = await convexClient.query("animations:getAnimation", { sceneId });
      if (!data) return;
      set({
        duration: data.duration,
        fps: data.fps || 60,
        layers: data.layers || [],
        currentTime: 0,
        playing: false,
      });
    } catch (err) {
      console.error("Failed to load animation", err);
    }
  },
}));
