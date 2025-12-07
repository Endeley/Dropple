import { nanoid } from "nanoid";

const pickProps = (node) => {
  const {
    id,
    type,
    name,
    children = [],
    interactions = [],
    layout,
    constraints,
    transform3d,
    responsive,
    aspectRatio,
    ...rest
  } = node;

  return {
    id,
    type,
    name,
    children,
    interactions,
    layout,
    constraints,
    transform3d,
    responsive,
    aspectRatio,
    props: rest,
  };
};

export function exportTemplate(rootId, nodes, metadata = {}) {
  if (!rootId || !nodes[rootId]) return null;
  const toVisit = [rootId];
  const collected = [];
  const seen = new Set();

  while (toVisit.length) {
    const current = toVisit.pop();
    if (seen.has(current)) continue;
    const node = nodes[current];
    if (!node) continue;
    seen.add(current);
    collected.push(pickProps(node));
    (node.children || []).forEach((cid) => toVisit.push(cid));
  }

  const frame = nodes[rootId];
  const frameMeta = {
    width: frame.width || 1440,
    height: frame.height || 900,
    background: frame.background || frame.fill || "#ffffff",
  };

  return {
    id: nanoid(),
    name: metadata.name || frame.name || "Untitled Template",
    description: metadata.description || "",
    category: metadata.category || "General",
    tags: metadata.tags || [],
    visibility: metadata.visibility || "private",
    frame: frameMeta,
    nodes: collected,
    createdAt: Date.now(),
  };
}

export async function generateTemplateThumbnail(template, color = "#f8f9fb") {
  const canvas = document.createElement("canvas");
  const frameWidth = template?.frame?.width || 800;
  const frameHeight = template?.frame?.height || 600;
  const scale = Math.min(1, 480 / frameWidth, 320 / frameHeight);
  canvas.width = Math.max(320, frameWidth * scale);
  canvas.height = Math.max(220, frameHeight * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawNode = (node, nodes) => {
    if (!node) return;
    const x = (node.x || 0) * scale + 12;
    const y = (node.y || 0) * scale + 12;
    const w = (node.width || 0) * scale;
    const h = (node.height || 0) * scale;
    if (w <= 0 || h <= 0) return;
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    (node.children || []).forEach((cid) => drawNode(nodes.find((n) => n.id === cid), nodes));
  };

  (template?.nodes || []).forEach((n) => {
    if (!n.parent) drawNode(n, template.nodes || []);
  });

  ctx.fillStyle = "#1f2937";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText(template?.name || "Template", 16, canvas.height - 24);
  ctx.fillStyle = "#6b7280";
  ctx.font = "11px Inter, sans-serif";
  ctx.fillText(`${Math.round(frameWidth)}x${Math.round(frameHeight)}`, 16, canvas.height - 8);
  return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}
