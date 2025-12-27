import { create } from "zustand";

export const useAgentStore = create((set, get) => ({
  selectedAgent: null,
  messages: [],
  tasks: [],
  suggestions: [],
  dockOpen: true,
  typing: {},
  collabMode: "assist",

  setAgent: (agent) => set({ selectedAgent: agent }),

  setMessages: (messages = []) =>
    set(() => ({
      messages,
      suggestions: extractSuggestions(messages),
    })),

  setTasks: (tasks = []) => set({ tasks }),

  setSuggestions: (suggestions = []) => set({ suggestions }),

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, msg],
      suggestions: msg?.suggestions?.length
        ? [...s.suggestions, ...msg.suggestions]
        : s.suggestions,
    })),

  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),

  toggleDock: () => set((s) => ({ dockOpen: !s.dockOpen })),

  setTyping: (agent, value) =>
    set((s) => ({ typing: { ...s.typing, [agent]: value } })),

  setCollabMode: (mode) => set({ collabMode: mode }),

  reset: () =>
    set({ messages: [], tasks: [], selectedAgent: null, suggestions: [] }),
}));

function extractSuggestions(messages = []) {
  return messages.flatMap((m) => m?.suggestions || []);
}
