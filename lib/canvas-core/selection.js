export function isInsideBounds(x, y, bounds) {
  return (
    x >= bounds.x &&
    y >= bounds.y &&
    x <= bounds.x + bounds.width &&
    y <= bounds.y + bounds.height
  );
}

export function getSelectedBounds(selectedIds, nodeMap) {
  if (!selectedIds?.length) return null;
  const nodes = selectedIds.map((id) => nodeMap[id]).filter(Boolean);
  if (!nodes.length) return null;
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const ws = nodes.map((n) => n.x + n.width);
  const hs = nodes.map((n) => n.y + n.height);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...ws) - Math.min(...xs),
    height: Math.max(...hs) - Math.min(...ys),
  };
}
