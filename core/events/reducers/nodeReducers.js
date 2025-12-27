// core/events/reducers/nodeReducers.js

/**
 * NODE REDUCERS
 * -------------
 * Pure functions
 * No Zustand
 * No side effects
 */

/* =========================
   CREATE
========================= */

export function applyNodeCreate(state, event) {
    const { node, index = null } = event.payload || {};
    if (!node || !node.id) return;

    const { id, parentId = null } = node;

    // Prevent accidental overwrite
    if (state.nodes[id]) return;

    const normalizedNode = {
        ...node,
        parentId,
        children: node.children || [],
    };

    state.nodes[id] = normalizedNode;

    if (parentId && state.nodes[parentId]) {
        const parent = state.nodes[parentId];
        const children = [...(parent.children || [])];

        if (typeof index === 'number' && index >= 0) {
            children.splice(index, 0, id);
        } else {
            children.push(id);
        }

        parent.children = children;
    } else {
        state.rootIds.push(id);
    }
}

/* =========================
   UPDATE
========================= */

export function applyNodeUpdate(state, event) {
    const { id, updates } = event.payload || {};
    const node = state.nodes[id];
    if (!node || !updates) return;

    Object.assign(node, updates);
}

/* =========================
   DELETE
========================= */

export function applyNodeDelete(state, event) {
    const { id } = event.payload || {};
    const node = state.nodes[id];
    if (!node) return;

    if (node.parentId) {
        const parent = state.nodes[node.parentId];
        if (parent) {
            parent.children = parent.children.filter((c) => c !== id);
        }
    } else {
        state.rootIds = state.rootIds.filter((r) => r !== id);
    }

    (node.children || []).forEach((childId) => {
        applyNodeDelete(state, { payload: { id: childId } });
    });

    delete state.nodes[id];
}

/* =========================
   PARENT SET
========================= */

export function applyNodeParentSet(state, event) {
    const { id, parentId } = event.payload || {};
    const node = state.nodes[id];
    if (!node) return;

    if (node.parentId) {
        const oldParent = state.nodes[node.parentId];
        if (oldParent) {
            oldParent.children = oldParent.children.filter((c) => c !== id);
        }
    } else {
        state.rootIds = state.rootIds.filter((r) => r !== id);
    }

    node.parentId = parentId || null;

    if (parentId && state.nodes[parentId]) {
        state.nodes[parentId].children.push(id);
    } else {
        state.rootIds.push(id);
    }
}
