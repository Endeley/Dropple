export function convertBlueprintToDroppleTemplate(bp = {}) {
  const layers = [];

  (bp.sections || []).forEach((section, idx) => {
    const sectionId = "sec_" + crypto.randomUUID();
    const children = [];

    (section.components || []).forEach((c, cIdx) => {
      const compLayer = convertComponent(c, sectionId, cIdx);
      if (!compLayer) return;

      children.push(compLayer.id);
      layers.push(compLayer);
    });

    const layout = section.layout || {};
    layers.push({
      id: sectionId,
      type: "frame",
      name: section.name || `Section ${idx + 1}`,
      x: 80,
      y: 80 + idx * 420,
      width: 1280,
      height: 360,
      autoLayout: {
        enabled: true,
        direction: layout.direction || "vertical",
        gap: layout.gap ?? 16,
        padding: layout.padding ?? 32,
        align: layout.alignment || "start",
      },
      props: {
        fill: "#ffffff",
      },
      children,
    });
  });

  return {
    id: "tmpl_" + crypto.randomUUID(),
    name: bp.name || "AI Generated Template",
    description: bp.description || "",
    mode: "uiux",
    width: 1440,
    height: 1024,
    layers,
    tags: [],
  };
}

function convertComponent(c, parentId, idx = 0) {
  if (!c?.type) return null;

  if (c.type === "text") {
    const role = c.role || "body";
    const fontSize = role === "heading" ? 36 : role === "subheading" ? 20 : 16;
    const fontWeight = role === "heading" ? 700 : role === "subheading" ? 500 : 400;

    return {
      id: "txt_" + crypto.randomUUID(),
      type: "text",
      parentId,
      x: 0,
      y: idx * 60,
      width: 800,
      height: Math.max(32, fontSize + 12),
      props: {
        text: c.content || "Sample text",
        fontSize,
        fontWeight,
        color: "#0f172a",
      },
    };
  }

  if (c.type === "button") {
    const btnId = "btn_" + crypto.randomUUID();
    const textId = "txt_" + crypto.randomUUID();
    return {
      id: btnId,
      type: "frame",
      parentId,
      x: 0,
      y: idx * 70,
      width: 180,
      height: 48,
      autoLayout: {
        enabled: true,
        direction: "horizontal",
        gap: 8,
        padding: 14,
        align: "center",
      },
      props: {
        fill: "#2563eb",
        borderRadius: 10,
      },
      children: [textId],
      variant: c.variant || "primary",
      variantId: c.variant || "primary",
      componentId: null,
      overrides: c.props || {},
      nodes: [
        {
          id: textId,
          type: "text",
          parentId: btnId,
          x: 0,
          y: 0,
          width: 120,
          height: 20,
          props: {
            text: c.props?.text || "Button",
            fontSize: 16,
            fontWeight: 600,
            color: "#ffffff",
          },
        },
      ],
    };
  }

  if (c.type === "image") {
    return {
      id: "img_" + crypto.randomUUID(),
      type: "image",
      parentId,
      x: 0,
      y: idx * 140,
      width: c.width ?? 400,
      height: c.height ?? 260,
      url: c.src || c.url || "",
      props: {},
    };
  }

  if (c.type === "component") {
    return {
      id: "cmp_" + crypto.randomUUID(),
      type: "component-instance",
      parentId,
      x: 0,
      y: idx * 90,
      width: c.width ?? 240,
      height: c.height ?? 120,
      componentId: c.componentId || null,
      variantId: c.variant || null,
      overrides: c.props || {},
      nodes: [],
      componentNodes: [],
      componentVariants: [],
    };
  }

  return null;
}
