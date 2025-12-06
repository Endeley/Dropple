export function computeBoundingBox(nodes = []) {
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
