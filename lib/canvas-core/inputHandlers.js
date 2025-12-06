export function startDrag(e, selectionBounds) {
  return { startX: e.clientX, startY: e.clientY, initialBounds: selectionBounds };
}

export function updateDrag(e, initial) {
  const dx = e.clientX - initial.startX;
  const dy = e.clientY - initial.startY;
  return { dx, dy };
}
