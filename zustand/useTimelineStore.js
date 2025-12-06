"use client";

import { create } from "zustand";

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
  layers: [],

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

  setLayers: (layers) => set({ layers }),

  addTrack: ({ targetId, property, name }) => {
    const newTrack = {
      id: generateId(),
      targetId,
      property,
      name: name || property,
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
}));
