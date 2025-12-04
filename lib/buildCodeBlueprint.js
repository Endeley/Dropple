export function buildCodeBlueprint(workspace = {}) {
  const pages = (workspace.pages || []).map((page) => ({
    id: page.id,
    name: page.name,
    route: "/" + (page.name || "page").toString().toLowerCase().replace(/\s+/g, "-"),
    components: extractComponents(page.layers || []),
  }));

  const tokens = workspace.brand?.tokens || workspace.theme || {};
  const colors = workspace.brand?.colors || workspace.brand?.colorPalette || {};
  const typography = workspace.brand?.typography || workspace.brand?.fonts || {};

  return {
    pages,
    tokens,
    colors,
    typography,
    interactions: workspace.prototype || {},
    animations: workspace.animations || [],
    assets: workspace.assets || [],
  };
}

function extractComponents(layers = []) {
  return layers.map((layer) => ({
    id: layer.id,
    type: layer.type,
    name: layer.name,
    props: layer.props || {},
    style: layer.style || {},
    autoLayout: layer.autoLayout,
    children: extractComponents(layer.children || []),
  }));
}
