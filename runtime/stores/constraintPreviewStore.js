import { create } from 'zustand';

/**
 * Constraint Preview Store
 * ------------------------
 * Owns temporary, non-committed layout previews.
 * Used during:
 * - parent resize (edge handles)
 * - constraint visualization
 *
 * This store should NEVER mutate real node data.
 */
export const useConstraintPreviewStore = create((set, get) => ({
    previewNodes: null,

    /**
     * Sets preview nodes map.
     * Expected shape:
     * {
     *   __parent?: Node,
     *   nodes: { [nodeId]: Partial<Node> }
     * }
     */
    setPreviewNodes: (map) => {
        const current = get().previewNodes;
        if (current === map) return;
        set({ previewNodes: map });
    },

    /**
     * Clears all constraint previews.
     */
    clearPreview: () => {
        if (get().previewNodes === null) return;
        set({ previewNodes: null });
    },
}));
