export function convertAIToComponent(aiObject = {}) {
  const remapAnimations = (anims = [], idMap = {}) =>
    anims.map((a) => ({
      ...a,
      id: a.id || "anim_" + crypto.randomUUID(),
      nodeId: idMap[a.nodeId] || a.nodeId,
      tracks: (a.tracks || []).map((t) => ({
        ...t,
        keyframes: (t.keyframes || []).map((kf) => ({ ...kf })),
      })),
    }));

  const attachAnimationsToNodes = (nodes = [], anims = []) => {
    if (!anims.length) return nodes;
    const map = new Map(nodes.map((n) => [n.id, { ...n, animations: n.animations || [] }]));
    anims.forEach((anim) => {
      if (!map.has(anim.nodeId)) return;
      const entry = map.get(anim.nodeId);
      entry.animations = [...(entry.animations || []), anim];
      map.set(anim.nodeId, entry);
    });
    return Array.from(map.values());
  };

  const normalizeLayer = (layer, idMap) => {
    if (!layer) return null;
    const id = layer.id || "lyr_" + crypto.randomUUID();
    idMap[layer.id || id] = id;
    const normalizedChildren = (layer.children || [])
      .map((child) => normalizeLayer(child, idMap))
      .filter(Boolean);
    const normalized = {
      id,
      type: layer.type || "frame",
      x: layer.x ?? 0,
      y: layer.y ?? 0,
      width: layer.width ?? 100,
      height: layer.height ?? 40,
      style: layer.style || {},
      props: layer.props || {},
      children: normalizedChildren,
      animations: remapAnimations(layer.animations || [], idMap),
    };
    return normalized;
  };

  const normalizeTree = (layers = []) => {
    const idMap = {};
    const normalized = (layers || []).map((layer) => normalizeLayer(layer, idMap)).filter(Boolean);
    const anims = remapAnimations(aiObject.animations || [], idMap);
    const withAnims = attachAnimationsToNodes(normalized, anims);
    return { nodes: withAnims, idMap };
  };

  const base = normalizeTree(aiObject.layers || aiObject.nodes || []);

  const normalizedVariants = (aiObject.variants || []).map((variant) => {
    const { nodes, idMap } = normalizeTree(variant.layers || variant.nodes || []);
    const variantAnims = remapAnimations(variant.animations || [], idMap);
    const mergedNodes = attachAnimationsToNodes(nodes, variantAnims);
    return {
      id: variant.id || "var_" + crypto.randomUUID(),
      name: variant.name || "Variant",
      props: variant.props || {},
      nodes: mergedNodes,
      animations: variantAnims,
    };
  });

  return {
    _id: aiObject._id || "comp_" + crypto.randomUUID(),
    name: aiObject.name || "Generated Component",
    props: aiObject.props || {},
    nodes: base.nodes,
    variants: normalizedVariants,
    slots: aiObject.slots || [],
    tokens: aiObject.tokens || {},
    metadata: aiObject.metadata || {},
  };
}
