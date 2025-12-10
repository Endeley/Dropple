export function buildCodeBlueprint(workspace = {}) {
  const template = workspace.currentTemplate || {};
  const pages =
    (workspace.pages || []).length
      ? (workspace.pages || []).map((page) => ({
          id: page.id,
          name: page.name,
          route: "/" + (page.name || "page").toString().toLowerCase().replace(/\s+/g, "-"),
          components: extractComponents(page.layers || []),
        }))
      : [
          {
            id: "page_1",
            name: template.name || "Page",
            route: "/" + (template.name || "page").toString().toLowerCase().replace(/\s+/g, "-"),
            components: extractComponents(template.layers || []),
          },
        ];

  const tokens = workspace.brand?.theme?.tokens || workspace.brand?.tokens || workspace.theme || {};
  const colors =
    workspace.brand?.colors ||
    workspace.brand?.colorPalette ||
    workspace.brand?.theme?.tokens?.colors ||
    workspace.theme?.tokens?.colors ||
    {};
  const typography = workspace.brand?.typography || workspace.brand?.fonts || {};
  const motionThemeId = workspace.brand?.motionThemeId || workspace.motionThemeId || null;
  const motionTheme =
    (workspace.motionThemes && workspace.motionThemes.find?.((m) => m.id === motionThemeId)) ||
    null;

  return {
    template,
    pages,
    tokens,
    colors,
    typography,
    motionThemeId,
    motionTheme,
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
