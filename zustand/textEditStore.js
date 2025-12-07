"use client";

import { create } from "zustand";

export const useTextEditStore = create((set) => ({
  editingId: null,
  caretIndex: 0,
  selectionStart: null,
  selectionEnd: null,
  isSelecting: false,
  pendingStyle: {},

  startEditing: (id, caretIndex = 0) =>
    set({
      editingId: id,
      caretIndex,
      selectionStart: caretIndex,
      selectionEnd: caretIndex,
      isSelecting: false,
    }),
  stopEditing: () =>
    set({
      editingId: null,
      caretIndex: 0,
      selectionStart: null,
      selectionEnd: null,
      isSelecting: false,
      pendingStyle: {},
    }),
  setCaretIndex: (i) => set({ caretIndex: i, selectionStart: i, selectionEnd: i }),
  beginSelection: (i) => set({ selectionStart: i, selectionEnd: i, isSelecting: true }),
  updateSelection: (i) => set({ selectionEnd: i }),
  endSelection: () => set({ isSelecting: false }),
  setPendingStyle: (style) => set((state) => ({ pendingStyle: { ...(state.pendingStyle || {}), ...style } })),
}));
