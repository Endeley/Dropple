import { getSelectedBounds } from "./selection";

export function createGroup(nodeMap, selectedIds) {
  if (!selectedIds?.length) return null;
  const bounds = getSelectedBounds(selectedIds, nodeMap);
  if (!bounds) return null;
  const groupId = crypto.randomUUID();
  const group = {
    id: groupId,
    type: "group",
    name: "Group",
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    rotation: 0,
    parent: null,
    children: [...selectedIds],
  };

  const updated = { ...nodeMap, [groupId]: group };
  selectedIds.forEach((id) => {
    const node = updated[id];
    if (!node) return;
    updated[id] = { ...node, parent: groupId, x: node.x - bounds.x, y: node.y - bounds.y };
  });

  return { groupId, updated };
}

export function ungroup(nodeMap, groupId) {
  const group = nodeMap[groupId];
  if (!group || group.type !== "group") return { updated: nodeMap, children: [] };
  const updated = { ...nodeMap };
  const children = group.children || [];
  children.forEach((id) => {
    const node = updated[id];
    if (!node) return;
    updated[id] = { ...node, parent: null, x: node.x + group.x, y: node.y + group.y };
  });
  delete updated[groupId];
  return { updated, children };
}
