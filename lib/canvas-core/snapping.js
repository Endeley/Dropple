export function snapToGrid(value, gridSize = 8) {
  return Math.round(value / gridSize) * gridSize;
}

export function snapValue(value, targets, threshold = 6) {
  for (const t of targets) {
    if (Math.abs(value - t) <= threshold) return t;
  }
  return value;
}
