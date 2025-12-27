import { create } from "zustand";

export const usePresenceStore = create((set) => ({
  cursors: {},
  updateCursor: (id, pos) =>
    set((s) => ({
      cursors: { ...s.cursors, [id]: pos },
    })),
  removeCursor: (id) =>
    set((s) => {
      const updated = { ...s.cursors };
      delete updated[id];
      return { cursors: updated };
    }),
}));
