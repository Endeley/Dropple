export function convertAIToComponent(aiObject = {}) {
  const normalizeLayer = (layer) => {
    if (!layer) return null;
    return {
      id: "lyr_" + crypto.randomUUID(),
      type: layer.type || "frame",
      x: layer.x ?? 0,
      y: layer.y ?? 0,
      width: layer.width ?? 100,
      height: layer.height ?? 40,
      style: layer.style || {},
      props: layer.props || {},
      children: (layer.children || [])
        .map((child) => normalizeLayer(child))
        .filter(Boolean),
    };
  };

  const normalizedLayers = (aiObject.layers || [])
    .map((layer) => normalizeLayer(layer))
    .filter(Boolean);

  const normalizedVariants = (aiObject.variants || []).map((variant) => ({
    id: "var_" + crypto.randomUUID(),
    name: variant.name || "Variant",
    props: variant.props || {},
    layers: (variant.layers || [])
      .map((layer) => normalizeLayer(layer))
      .filter(Boolean),
  }));

  return {
    _id: "comp_" + crypto.randomUUID(),
    name: aiObject.name || "Generated Component",
    props: aiObject.props || {},
    nodes: normalizedLayers,
    variants: normalizedVariants,
  };
}
