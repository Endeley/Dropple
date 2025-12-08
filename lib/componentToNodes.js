// Convert a CE-1 component definition into canvas-ready nodes and component meta.
export function componentToNodes(def = {}, tokenMap = {}) {
  const idMap = {};

  const resolveTokens = (val) => {
    if (typeof val !== "string") return val;
    if (!val.startsWith("{")) return val;
    const key = val.replace("{", "").replace("}", "");
    return tokenMap[key] ?? def.tokens?.[key] ?? val;
  };

  const resolveStyleTokens = (style = {}) => {
    const out = { ...style };
    Object.keys(out).forEach((k) => {
      out[k] = resolveTokens(out[k]);
    });
    return out;
  };

  const hydrateSlot = (node) => {
    if (!node.slotId) return node;
    const slot = (def.slots || []).find((s) => s.slotId === node.slotId);
    if (!slot) return node;
    if (slot.type === "text") node.content = slot.default ?? node.content;
    if (slot.type === "icon") node.url = slot.default ?? node.url;
    if (slot.type === "image") node.url = slot.default ?? node.url;
    return node;
  };

  const layers = (def.nodes || []).map((n, idx) => {
    const oldId = n.id || `node_${idx}`;
    const id = `node_${idx}_${crypto.randomUUID()}`;
    idMap[oldId] = id;
    const props = { ...(n.props || {}) };
    const style = resolveStyleTokens(n.style || {});
    const autoLayout = n.layout
      ? {
          enabled: true,
          direction: n.layout.direction || "row",
          padding: n.layout.padding ?? 0,
          gap: n.layout.gap ?? 0,
          align: n.layout.align || "start",
          justify: n.layout.justify || "start",
        }
      : undefined;
    let node = {
      id,
      type: n.type || "frame",
      name: n.slotId ? `slot:${n.slotId}` : oldId,
      x: n.x ?? 0,
      y: n.y ?? 0,
      width: n.width ?? 200,
      height: n.height ?? 48,
      props,
      style,
      autoLayout,
      children: n.children || [],
      animations: n.animations || [],
      slotId: n.slotId,
      content: n.content,
    };
    node = hydrateSlot(node);
    return node;
  });

  // Remap children to new ids and set parentId
  layers.forEach((layer) => {
    if (layer.children?.length) {
      layer.children = layer.children.map((cid) => idMap[cid] || cid);
      layer.children.forEach((cid) => {
        const child = layers.find((l) => l.id === cid);
        if (child) child.parentId = layer.id;
      });
    }
  });

  // Attach animations defined at component level to layers if nodeId matches
  if (Array.isArray(def.animations)) {
    def.animations.forEach((anim) => {
      const targetId = anim.nodeId && idMap[anim.nodeId] ? idMap[anim.nodeId] : anim.nodeId;
      if (!targetId) return;
      const layer = layers.find((l) => l.id === targetId);
      if (!layer) return;
      layer.animations = [...(layer.animations || []), anim];
    });
  }

  return {
    _id: def.id || `comp_${crypto.randomUUID()}`,
    name: def.name || "Generated Component",
    metadata: def.metadata || {},
    tokens: def.tokens || {},
    slots: def.slots || [],
    nodes: layers,
    variants: def.variants || [],
  };
}
