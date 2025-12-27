"use client";

import { create } from "zustand";

export const useCollaborationStore = create((set, get) => ({
  user: null,
  sessionId: null,
  connected: false,
  presence: {}, // userId -> { name, color, cursor, selectedNodes, editingTextNode }

  setUser: (user) => set({ user }),
  setSession: (sessionId) => set({ sessionId }),
  setConnected: (connected) => set({ connected }),

  updatePresence: (userId, data) =>
    set((state) => ({
      presence: { ...state.presence, [userId]: { ...(state.presence[userId] || {}), ...data } },
    })),

  removePresence: (userId) =>
    set((state) => {
      const next = { ...state.presence };
      delete next[userId];
      return { presence: next };
    }),
}));
