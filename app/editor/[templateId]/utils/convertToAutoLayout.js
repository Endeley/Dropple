import { generateId } from "./generateId";

export function convertToAutoLayout(nodes) {
  if (!nodes || nodes.length === 0) return null;

  const minX = Math.min(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxX = Math.max(...nodes.map((n) => n.x + n.width));
  const maxY = Math.max(...nodes.map((n) => n.y + n.height));

  const frameId = generateId();

  const frame = {
    id: frameId,
    type: "frame",
    name: "Auto Layout",
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    layout: {
      enabled: true,
      direction: "vertical",
      gap: 12,
      padding: 16,
      alignment: "start",
    },
    children: nodes.map((n) => n.id),
    visible: true,
    locked: false,
  };

  const updatedChildren = nodes.map((node) => ({
    ...node,
    x: node.x - minX + frame.layout.padding,
    y: node.y - minY + frame.layout.padding,
    parentId: frameId,
  }));

  return { frame, children: updatedChildren };
}
