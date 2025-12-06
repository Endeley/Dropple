export const SNAP_THRESHOLD = 6;

export function snapValue(value, targets) {
  for (const t of targets) {
    if (Math.abs(value - t) <= SNAP_THRESHOLD) {
      return t;
    }
  }
  return value;
}

export function getSnapPoints(nodeMap, excludeIds = []) {
  const snap = { x: [], y: [] };

  Object.values(nodeMap || {}).forEach((node) => {
    if (!node || excludeIds.includes(node.id)) return;

    snap.x.push(node.x);
    snap.x.push(node.x + node.width);
    snap.x.push(node.x + node.width / 2);

    snap.y.push(node.y);
    snap.y.push(node.y + node.height);
    snap.y.push(node.y + node.height / 2);
  });

  return snap;
}
