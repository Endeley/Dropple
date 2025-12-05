import { create } from "zustand";

const defaultWorkspace = {
  pages: [],
  components: {},
  tokens: {},
  animations: {},
};

export const useWorkspaceStore = create((set, get) => ({
  workspace: defaultWorkspace,
  selectedLayer: null,
  snapshots: [],
  lockedLayers: {},

  setWorkspace: (ws) =>
    set({
      workspace: ws || defaultWorkspace,
    }),

  setSelectedLayer: (id) => set({ selectedLayer: id }),

  updateLayer: (layerId, updates, actor = "human") =>
    set((s) => {
      if (isLocked(s.lockedLayers, layerId) && actor !== "human") {
        return {};
      }
      const updated = applyLayerUpdate(s.workspace, layerId, updates);
      const locks = actor === "human" ? lockLayer(s.lockedLayers, layerId) : s.lockedLayers;
      notifyAIEvent({
        type: "layerUpdated",
        layerId,
        updates,
        workspace: updated,
        actor,
      });
      return { workspace: updated, lockedLayers: locks };
    }),

  addSnapshot: (snapshot) =>
    set((s) => ({ snapshots: [...s.snapshots, snapshot] })),

  syncToBackend: async () => {
    const ws = get().workspace;
    try {
      await fetch("/api/workspace/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ws),
      });
      await fetch("/api/events/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "workspaceSaved",
          actor: "human",
          payload: { workspace: ws },
        }),
      });
    } catch (err) {
      console.error("Failed to sync workspace", err);
    }
  },

  reset: () =>
    set({
      workspace: defaultWorkspace,
      selectedLayer: null,
      snapshots: [],
      lockedLayers: {},
    }),
}));

function applyLayerUpdate(ws, id, updates) {
  if (!ws || !ws.pages) return ws;

  function walk(nodes) {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return { ...node, children: walk(node.children) };
      }
      return node;
    });
  }

  return {
    ...ws,
    pages: ws.pages.map((p) => ({
      ...p,
      layers: p.layers ? walk(p.layers) : [],
    })),
  };
}

function notifyAIEvent(evt) {
  try {
    fetch("/api/events/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: evt.type,
        actor: evt.actor || "human",
        layerId: evt.layerId,
        payload: evt,
      }),
    });
  } catch (err) {
    console.warn("Failed to notify AI event", err);
  }
}

function lockLayer(locks, id, duration = 2000) {
  const next = { ...locks };
  next[id] = Date.now() + duration;
  return next;
}

function isLocked(locks, id) {
  if (!locks || !locks[id]) return false;
  const expires = locks[id];
  if (Date.now() > expires) return false;
  return true;
}
