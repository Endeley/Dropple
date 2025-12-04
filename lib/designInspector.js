export function inspectDesign(pages = []) {
  const analysis = [];

  pages.forEach((page) => {
    (page.layers || []).forEach((layer) => {
      analysis.push(extractLayerInfo(layer));
    });
  });

  return analysis;
}

function extractLayerInfo(layer) {
  return {
    id: layer.id,
    type: layer.type,
    name: layer.name,
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    fill: layer.props?.fill || layer.style?.fill,
    radius: layer.props?.borderRadius || layer.style?.radius,
    fontSize: layer.props?.fontSize || layer.style?.fontSize,
    color: layer.props?.color || layer.style?.color,
    gap: layer.autoLayout?.gap,
    padding: layer.autoLayout?.padding,
    children: (layer.children || []).map((childId) => {
      // Children references are IDs; embedded child data may be available on the layer object
      const child =
        (layer.nodes || []).find((n) => n.id === childId) ||
        (layer.childrenData || []).find((n) => n.id === childId) ||
        null;
      return child ? extractLayerInfo(child) : { id: childId };
    }),
  };
}
