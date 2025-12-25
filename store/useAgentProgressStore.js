import { create } from "zustand";

export const useAgentProgressStore = create((set) => ({
  agents: {},

  update(event) {
    if (event.type !== "status") return;

    set((state) => ({
      agents: {
        ...state.agents,
        [event.source]: {
          status: event.payload.status,
          timestamp: event.timestamp,
        },
      },
    }));
  },

  reset() {
    set({ agents: {} });
  },
}));
