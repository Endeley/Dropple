export function bezierPath(inHandle, outHandle) {
  const start = { x: 0, y: 1 };
  const end = { x: 1, y: 0 };
  const c1 = inHandle || { x: 0.25, y: 0.1 };
  const c2 = outHandle || { x: 0.25, y: 1 };
  return `M ${start.x} ${start.y} C ${c1.x} ${1 - c1.y} ${c2.x} ${1 - c2.y} ${end.x} ${end.y}`;
}
