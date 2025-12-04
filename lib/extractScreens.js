export function extractScreens(pages = []) {
  return (pages || []).map((page) => ({
    id: page.id,
    name: page.name,
    layers: (page.layers || []).map((layer) => extractLayerInfo(layer)),
  }));
}

function extractLayerInfo(layer) {
  return {
    id: layer.id,
    type: layer.type,
    name: layer.name,
    text: layer.props?.text ?? layer.content ?? null,
    style: layer.props || layer.style || {},
    children: (layer.children || []).map((childId) => childId),
    bounds: {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    },
  };
}
