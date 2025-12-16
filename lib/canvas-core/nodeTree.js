/* =========================================
   NODE TREE OPERATIONS
   Pure immutable helpers
   (NO store access, NO side effects)
========================================= */

/**
 * Inserts a node into the tree.
 * - Returns a new tree
 * - Does NOT mutate inputs
 */
export function insertNode(nodeTree, node, parentId = null, index = null) {
    const nextTree = { ...nodeTree };

    const nextNode = {
        ...node,
        parent: parentId,
        children: node.children || [],
    };

    if (parentId) {
        const parent = nextTree[parentId];
        if (!parent) return nextTree;

        const nextChildren = [...(parent.children || [])];

        if (index !== null && index >= 0) {
            nextChildren.splice(index, 0, node.id);
        } else {
            nextChildren.push(node.id);
        }

        nextTree[parentId] = {
            ...parent,
            children: Array.from(new Set(nextChildren)),
        };
    }

    nextTree[node.id] = nextNode;
    return nextTree;
}

/**
 * Reorders a node within its parent.
 */
export function reorderNode(nodeTree, parentId, nodeId, newIndex) {
    const nextTree = { ...nodeTree };
    const parent = nextTree[parentId];
    if (!parent) return nextTree;

    const children = [...(parent.children || [])].filter((id) => id !== nodeId);

    children.splice(newIndex, 0, nodeId);

    nextTree[parentId] = {
        ...parent,
        children,
    };

    return nextTree;
}

/**
 * Groups nodes under a new group node.
 * NOTE:
 * - Group bounds are resolved later by layout engine
 * - This function only rewires hierarchy
 */
export function groupNodes(nodeTree, nodeIds, groupId) {
    const nextTree = { ...nodeTree };

    const group = {
        id: groupId,
        type: 'group',
        name: 'Group',
        parent: null,
        children: [...nodeIds],
        locked: false,
        hidden: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: 1,
    };

    // Detach nodes from previous parents
    nodeIds.forEach((id) => {
        const node = nextTree[id];
        if (!node) return;

        if (node.parent && nextTree[node.parent]) {
            nextTree[node.parent] = {
                ...nextTree[node.parent],
                children: (nextTree[node.parent].children || []).filter((cid) => cid !== id),
            };
        }

        nextTree[id] = {
            ...node,
            parent: groupId,
        };
    });

    nextTree[groupId] = group;
    return nextTree;
}

/**
 * Locks a node (non-destructive).
 */
export function lockNode(nodeTree, id) {
    const nextTree = { ...nodeTree };
    if (!nextTree[id]) return nextTree;

    nextTree[id] = {
        ...nextTree[id],
        locked: true,
    };

    return nextTree;
}

/**
 * Hides a node (non-destructive).
 */
export function hideNode(nodeTree, id) {
    const nextTree = { ...nodeTree };
    if (!nextTree[id]) return nextTree;

    nextTree[id] = {
        ...nextTree[id],
        hidden: true,
    };

    return nextTree;
}
