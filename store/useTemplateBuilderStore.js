'use client';

import { create } from 'zustand';
import { deepClone as cloneDeep } from '@/lib/deepClone';

/* =========================
   DEFAULTS
========================= */

const defaultAutoLayout = {
    enabled: false,
    direction: 'vertical',
    padding: 16,
    gap: 12,
    align: 'start',
    hugging: false,
};

const defaultConstraints = {
    horizontal: 'left',
    vertical: 'top',
};

const defaultLayerMeta = {
    locked: false,
    hidden: false,
    expanded: true,
    name: 'Layer',
};

/* =========================
   STORE
========================= */

export const useTemplateBuilderStore = create((set, get) => {
    /* =========================
     HELPERS
  ========================= */

    const getActivePage = () => {
        const state = get();
        return state.pages.find((p) => p.id === state.activePageId);
    };

    const findLayer = (id, layers) => layers.find((l) => l.id === id) || null;

    const isDescendant = (layers, parentId, testId) => {
        const parent = findLayer(parentId, layers);
        if (!parent || !parent.children) return false;
        if (parent.children.includes(testId)) return true;
        return parent.children.some((cid) => isDescendant(layers, cid, testId));
    };

    const normalizeChildren = (layers) => {
        const map = new Map(layers.map((l) => [l.id, { ...l, children: [] }]));

        layers.forEach((l) => {
            if (l.parentId && map.has(l.parentId)) {
                map.get(l.parentId).children.push(l.id);
            }
        });

        return Array.from(map.values());
    };

    /* =========================
     HISTORY
  ========================= */

    const pushHistory = () => {
        const state = get();
        const snapshot = cloneDeep({
            pages: state.pages,
            activePageId: state.activePageId,
            currentTemplate: state.currentTemplate,
        });

        set((s) => ({
            history: {
                past: [...s.history.past, snapshot].slice(-100),
                future: [],
            },
        }));
    };

    const restoreSnapshot = (snapshot) => {
        if (!snapshot) return;
        set({
            pages: snapshot.pages,
            activePageId: snapshot.activePageId,
            currentTemplate: snapshot.currentTemplate,
        });
    };

    /* =========================
     CORE MOVE ENGINE
  ========================= */

    const moveNode = (id, newParentId = null, index = 0, opts = {}) => {
        const page = getActivePage();
        if (!page) return;

        let layers = cloneDeep(page.layers);
        const node = findLayer(id, layers);
        if (!node) return;

        // ❌ prevent moving into own subtree
        if (newParentId && isDescendant(layers, id, newParentId)) {
            return;
        }

        // remove from old parent
        layers.forEach((l) => {
            if (l.children?.includes(id)) {
                l.children = l.children.filter((c) => c !== id);
            }
        });

        node.parentId = newParentId;

        // insert into new parent
        if (newParentId) {
            const parent = findLayer(newParentId, layers);
            if (!parent) return;

            const next = [...(parent.children || [])];
            next.splice(index, 0, id);
            parent.children = next;
        }

        layers = normalizeChildren(layers);

        set((state) => ({
            pages: state.pages.map((p) => (p.id === state.activePageId ? { ...p, layers } : p)),
            currentTemplate: { ...state.currentTemplate, layers },
        }));

        if (opts.undoable !== false) {
            pushHistory();
        }
    };

    /* =========================
     STORE STATE + ACTIONS
  ========================= */

    return {
        /* ===== TEMPLATE ===== */

        currentTemplate: {
            id: null,
            name: 'Untitled Template',
            width: 1440,
            height: 1024,
            layers: [],
        },

        /* ===== COMPONENT LIBRARY ===== */

        components: [],

        createInstanceFromComponent: () => {
            /* placeholder until component library is wired */
        },

        /* ===== PRESENCE ===== */

        presence: [],

        setPresence: (presence = []) => set({ presence }),

        /* ===== PROJECT HYDRATION ===== */

        hydrateProjectFromConvex: async () => {
            /* placeholder until backend wiring is added */
        },

        pages: [{ id: 'page_1', name: 'Page 1', layers: [] }],
        activePageId: 'page_1',

        /* ===== SELECTION ===== */

        selectedLayers: [],
        selectedLayerId: null,

        setSelectedLayers: (ids) =>
            set({
                selectedLayers: ids,
                selectedLayerId: ids[0] ?? null,
            }),

        clearSelection: () => set({ selectedLayers: [], selectedLayerId: null }),

        /* ===== HISTORY ===== */

        history: {
            past: [],
            future: [],
        },

        undoHistory: () => {
            const { history } = get();
            if (!history.past.length) return;

            const previous = history.past[history.past.length - 1];

            const current = cloneDeep({
                pages: get().pages,
                activePageId: get().activePageId,
                currentTemplate: get().currentTemplate,
            });

            set({
                history: {
                    past: history.past.slice(0, -1),
                    future: [current, ...history.future],
                },
            });

            restoreSnapshot(previous);
        },

        redoHistory: () => {
            const { history } = get();
            if (!history.future.length) return;

            const next = history.future[0];

            const current = cloneDeep({
                pages: get().pages,
                activePageId: get().activePageId,
                currentTemplate: get().currentTemplate,
            });

            set({
                history: {
                    past: [...history.past, current],
                    future: history.future.slice(1),
                },
            });

            restoreSnapshot(next);
        },

        /* ===== CORE ACTIONS ===== */

        moveNode,

        addLayer: (layer, parentId = null) => {
            const page = getActivePage();
            if (!page) return;

            const layers = cloneDeep(page.layers);

            layers.push({
                ...layer,
                id: layer.id,
                parentId,
                children: [],
                autoLayout: defaultAutoLayout,
                constraints: defaultConstraints,
                ...defaultLayerMeta,
            });

            const next = normalizeChildren(layers);

            set((state) => ({
                pages: state.pages.map((p) => (p.id === state.activePageId ? { ...p, layers: next } : p)),
                currentTemplate: {
                    ...state.currentTemplate,
                    layers: next,
                },
            }));

            pushHistory();
        },

        updateLayer: (id, patch) => {
            const page = getActivePage();
            if (!page) return;

            const layers = page.layers.map((l) => (l.id === id ? { ...l, ...patch } : l));

            set((state) => ({
                pages: state.pages.map((p) => (p.id === state.activePageId ? { ...p, layers } : p)),
                currentTemplate: {
                    ...state.currentTemplate,
                    layers,
                },
            }));

            pushHistory();
        },

        deleteLayer: (id) => {
            const page = getActivePage();
            if (!page) return;

            const toRemove = new Set();

            const walk = (lid) => {
                toRemove.add(lid);
                page.layers.filter((l) => l.parentId === lid).forEach((c) => walk(c.id));
            };

            walk(id);

            const remaining = page.layers
                .filter((l) => !toRemove.has(l.id))
                .map((l) => ({
                    ...l,
                    children: (l.children || []).filter((cid) => !toRemove.has(cid)),
                }));

            set((state) => ({
                pages: state.pages.map((p) => (p.id === state.activePageId ? { ...p, layers: remaining } : p)),
                currentTemplate: {
                    ...state.currentTemplate,
                    layers: remaining,
                },
            }));

            pushHistory();
        },
    };
});
