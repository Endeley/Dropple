export function insertNode(nodeTree, node, parentId = null, index = null) {
  const nextTree = { ...nodeTree };
  node.parent = parentId;

  if (parentId) {
    const parent = nextTree[parentId];
    const nextChildren = [...(parent?.children || [])];
    if (index !== null && index >= 0) {
      nextChildren.splice(index, 0, node.id);
    } else {
      nextChildren.push(node.id);
    }
    nextTree[parentId] = { ...parent, children: nextChildren };
  } else {
    // root-level managed separately in store
  }

  nextTree[node.id] = node;
  return nextTree;
}

export function reorderNode(nodeTree, parentId, nodeId, newIndex) {
  const nextTree = { ...nodeTree };
  const parent = nextTree[parentId];
  if (!parent) return nextTree;
  const filtered = (parent.children || []).filter((id) => id !== nodeId);
  filtered.splice(newIndex, 0, nodeId);
  nextTree[parentId] = { ...parent, children: filtered };
  return nextTree;
}

export function groupNodes(nodeTree, nodeIds, groupId) {
  const nextTree = { ...nodeTree };
  const group = {
    id: groupId,
    type: "group",
    name: "Group",
    children: nodeIds,
    parent: null,
    locked: false,
    hidden: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1,
  };
  nextTree[groupId] = group;
  nodeIds.forEach((id) => {
    if (nextTree[id]) {
      nextTree[id] = { ...nextTree[id], parent: groupId };
    }
  });
  return nextTree;
}

export function lockNode(nodeTree, id) {
  const nextTree = { ...nodeTree };
  if (nextTree[id]) nextTree[id] = { ...nextTree[id], locked: true };
  return nextTree;
}

export function hideNode(nodeTree, id) {
  const nextTree = { ...nodeTree };
  if (nextTree[id]) nextTree[id] = { ...nextTree[id], hidden: true };
  return nextTree;
}
