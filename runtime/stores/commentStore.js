"use client";

import { create } from "zustand";

export const useCommentStore = create((set, get) => ({
  threads: {}, // id -> thread
  addThread: (thread) =>
    set((state) => ({
      threads: { ...state.threads, [thread.id]: thread },
    })),
  addReply: (threadId, reply) =>
    set((state) => {
      const thread = state.threads[threadId];
      if (!thread) return state;
      const replies = [...(thread.replies || []), reply];
      return { threads: { ...state.threads, [threadId]: { ...thread, replies } } };
    }),
  setResolved: (threadId, resolved) =>
    set((state) => {
      const thread = state.threads[threadId];
      if (!thread) return state;
      return { threads: { ...state.threads, [threadId]: { ...thread, resolved } } };
    }),
}));
