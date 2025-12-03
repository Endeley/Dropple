export function duplicateLayer(layer) {
  return { ...layer, id: crypto.randomUUID(), name: `${layer.name || "Layer"} Copy` };
}

export function addTag(template, tag) {
  const tags = Array.from(new Set([...(template.tags || []), tag]));
  return { ...template, tags };
}

export function generateThumbnail(template) {
  // Stub: replace with real render.
  return `/template-thumbnails/${template.id}.png`;
}
