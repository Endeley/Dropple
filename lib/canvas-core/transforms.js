export function applyTranslate(node, dx, dy) {
  node.x += dx;
  node.y += dy;
}

export function calculateAngle(center, point) {
  return (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
}

export function applyRotate(node, angle) {
  node.rotation = angle;
}

export function applyResize(node, handle, dx, dy) {
  switch (handle) {
    case "right":
      node.width += dx;
      break;
    case "left":
      node.x += dx;
      node.width -= dx;
      break;
    case "bottom":
      node.height += dy;
      break;
    case "top":
      node.y += dy;
      node.height -= dy;
      break;
    case "top-left":
      node.x += dx;
      node.width -= dx;
      node.y += dy;
      node.height -= dy;
      break;
    case "top-right":
      node.width += dx;
      node.y += dy;
      node.height -= dy;
      break;
    case "bottom-left":
      node.x += dx;
      node.width -= dx;
      node.height += dy;
      break;
    case "bottom-right":
      node.width += dx;
      node.height += dy;
      break;
    default:
      break;
  }
}
