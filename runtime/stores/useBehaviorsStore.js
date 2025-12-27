"use client";

import { create } from "zustand";
import { convexClient } from "@/lib/convex/client";
import { useStateMachine } from "./useStateMachine";
import { useTimelineStore } from "./useTimelineStore";

export const useBehaviorsStore = create((set, get) => ({
  behaviors: {},

  register: (componentId, behaviorList) =>
    set((state) => ({
      behaviors: { ...state.behaviors, [componentId]: behaviorList || [] },
    })),

  loadBehaviors: async (componentId) => {
    if (!componentId) return;
    try {
      const data = await convexClient.query("componentBehaviors:getComponentBehaviors", {
        componentId,
      });
      if (data?.behaviors) {
        get().register(componentId, data.behaviors);
      }
    } catch (err) {
      console.warn("Failed to load behaviors", err);
    }
  },

  trigger: async (componentId, eventName, data) => {
    const list = get().behaviors[componentId] || [];
    for (const b of list) {
      if (b.type !== eventName) continue;
      if (b.onTrigger) {
        useStateMachine.getState().triggerEvent(componentId, b.onTrigger);
      }
      if (b.timelineId) {
        // For now reuse timeline store loader; you can swap for targeted playback.
        await useTimelineStore.getState().loadFromServer(b.timelineId, componentId, data);
      }
    }
  },
}));
