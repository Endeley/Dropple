"use client";

import { create } from "zustand";
import { convexClient } from "@/lib/convex/client";

const toWebKeyframes = (timeline = {}) => {
  const duration = timeline.duration || 400;
  const keyframes = timeline.layers?.map((layer) => {
    const frames = (layer.keyframes || []).map((kf) => {
      const base = { offset: Math.max(0, Math.min(1, (kf.t || 0) / duration)) };
      if (layer.property === "opacity") base.opacity = kf.value;
      if (layer.property === "position" && kf.value) {
        base.transform = `translate(${kf.value.x || 0}px, ${kf.value.y || 0}px)`;
      }
      if (layer.property === "scale" && kf.value) {
        base.transform = `scale(${kf.value.x || 1}, ${kf.value.y || 1})`;
      }
      if (layer.property === "rotation") {
        base.transform = `rotate(${kf.value || 0}deg)`;
      }
      return base;
    });
    return { targetId: layer.targetId, frames, duration };
  });
  return keyframes || [];
};

export const usePageTransitions = create((set, get) => ({
  currentRef: null,
  nextRef: null,
  transitions: {},

  setCurrentRef: (ref) => set({ currentRef: ref }),
  setNextRef: (ref) => set({ nextRef: ref }),

  loadTransition: async (from, to) => {
    try {
      const data = await convexClient.query("pageTransitions:getPageTransition", { from, to });
      if (!data) return null;
      set((state) => ({
        transitions: {
          ...state.transitions,
          [`${from}->${to}`]: { transitionIn: data.transitionIn, transitionOut: data.transitionOut },
        },
      }));
      return data;
    } catch (err) {
      console.warn("Transition load failed", err);
      return null;
    }
  },

  saveTransition: async ({ from, to, transitionIn, transitionOut }) => {
    try {
      await convexClient.mutation("pageTransitions:savePageTransition", {
        from,
        to,
        transitionIn,
        transitionOut,
      });
    } catch (err) {
      console.error("Transition save failed", err);
    }
  },

  runPageTransition: async ({ from, to, push }) => {
    const key = `${from}->${to}`;
    const cached = get().transitions[key];
    const data = cached || (await get().loadTransition(from, to));
    const current = get().currentRef?.current;
    const next = get().nextRef?.current;

    const playTimeline = async (el, timeline) => {
      if (!el || !timeline) return;
      const kfs = toWebKeyframes(timeline).find((k) => k.targetId === "page");
      if (!kfs) return;
      const animation = el.animate(kfs.frames, { duration: timeline.duration || 400, fill: "both" });
      await animation.finished.catch(() => {});
    };

    await playTimeline(current, data?.transitionOut);
    if (typeof push === "function") await push();
    await playTimeline(next, data?.transitionIn);
  },
}));
