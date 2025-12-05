export function snapToGrid(value, grid = 4) {
  return Math.round(value / grid) * grid;
}

export function computeSnapping(activeNode, allNodes) {
  const guides = [];
  let snappedX = activeNode.x;
  let snappedY = activeNode.y;
  const SNAP_DISTANCE = 5;

  allNodes.forEach((other) => {
    if (other.id === activeNode.id) return;

    // Centers
    const activeCenterX = activeNode.x + activeNode.width / 2;
    const otherCenterX = other.x + other.width / 2;
    if (Math.abs(activeCenterX - otherCenterX) < SNAP_DISTANCE) {
      snappedX = otherCenterX - activeNode.width / 2;
      guides.push({ type: "vertical", x: otherCenterX });
    }

    // Left edges
    if (Math.abs(activeNode.x - other.x) < SNAP_DISTANCE) {
      snappedX = other.x;
      guides.push({ type: "vertical", x: other.x });
    }

    // Right edges
    const activeRight = activeNode.x + activeNode.width;
    const otherRight = other.x + other.width;
    if (Math.abs(activeRight - otherRight) < SNAP_DISTANCE) {
      snappedX = otherRight - activeNode.width;
      guides.push({ type: "vertical", x: otherRight });
    }

    // Top edges
    if (Math.abs(activeNode.y - other.y) < SNAP_DISTANCE) {
      snappedY = other.y;
      guides.push({ type: "horizontal", y: other.y });
    }

    // Bottom edges
    const activeBottom = activeNode.y + activeNode.height;
    const otherBottom = other.y + other.height;
    if (Math.abs(activeBottom - otherBottom) < SNAP_DISTANCE) {
      snappedY = otherBottom - activeNode.height;
      guides.push({ type: "horizontal", y: otherBottom });
    }

    // Horizontal centers
    const activeCenterY = activeNode.y + activeNode.height / 2;
    const otherCenterY = other.y + other.height / 2;
    if (Math.abs(activeCenterY - otherCenterY) < SNAP_DISTANCE) {
      snappedY = otherCenterY - activeNode.height / 2;
      guides.push({ type: "horizontal", y: otherCenterY });
    }
  });

  return { snappedX, snappedY, guides };
}
