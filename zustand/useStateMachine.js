"use client";

import { create } from "zustand";
import { convexClient } from "@/lib/convex/client";
import { useTimelineStore } from "./useTimelineStore";

export const useStateMachine = create((set, get) => ({
  machines: {},

  registerMachine: (componentId, machine) =>
    set((state) => ({
      machines: { ...state.machines, [componentId]: { ...machine, activeState: machine.activeState || machine.states?.[0] || "idle" } },
    })),

  setState: (componentId, newState) =>
    set((state) => ({
      machines: {
        ...state.machines,
        [componentId]: {
          ...state.machines[componentId],
          activeState: newState,
        },
      },
    })),

  triggerEvent: async (componentId, eventName) => {
    const machine = get().machines[componentId];
    if (!machine) return;
    const { activeState, transitions } = machine;
    const possible = (transitions || []).filter(
      (t) => t.from === activeState && t.trigger === eventName,
    );

    for (const t of possible) {
      // Optional condition string eval (basic)
      if (t.condition) {
        try {
          if (!eval(t.condition)) continue;
        } catch (err) {
          console.warn("State condition eval failed", err);
          continue;
        }
      }

      get().setState(componentId, t.to);

      if (t.timelineId) {
        const playTimeline = useTimelineStore.getState().loadFromServer;
        // For demo purposes we just set active timeline state; playback hook would run separately
        await playTimeline(t.timelineId);
      }
    }
  },

  loadMachine: async (componentId) => {
    if (!componentId) return null;
    try {
      const data = await convexClient.query("stateMachines:getStateMachine", { componentId });
      if (!data) return null;
      get().registerMachine(componentId, data);
      return data;
    } catch (err) {
      console.error("Failed to load state machine", err);
      return null;
    }
  },

  saveMachine: async (machine) => {
    if (!machine?.componentId) return;
    try {
      await convexClient.mutation("stateMachines:saveStateMachine", {
        componentId: machine.componentId,
        states: machine.states || [],
        transitions: machine.transitions || [],
        variables: machine.variables || {},
      });
    } catch (err) {
      console.error("Failed to save state machine", err);
    }
  },
}));
