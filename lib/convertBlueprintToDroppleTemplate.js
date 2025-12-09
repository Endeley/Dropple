export function convertBlueprintToDroppleTemplate(bp = {}) {
  // Universal node-based blueprint (preferred)
  if (bp.nodes && Array.isArray(bp.nodes)) {
    return convertNodesBlueprint(bp);
  }

  // Legacy section-based blueprint
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
    width: bp.width || 1440,
    height: bp.height || 1024,
    layers,
    assets: (bp.images || []).map((img, idx) => ({
      id: img.id || `asset_${idx}`,
      type: "image",
      url: img.url || img.src || placeholderImage(img.id || idx),
      prompt: img.prompt,
      source: img.source,
      license: img.license,
    })),
    tags: [],
  };
}

function convertNodesBlueprint(bp = {}) {
  const layers = [];
  const width = bp.width || 1080;
  const height = bp.height || 1350;
  const fonts = bp.fonts || [];
  const primaryFont = fonts[0] || "Inter";
  const animations = bp.animations || [];
  const imagesMap = buildImageMap(bp.images || []);

  // Background base
  layers.push({
    id: "bg_" + crypto.randomUUID(),
    type: "frame",
    x: 0,
    y: 0,
    width,
    height,
    props: {
      fill: bp.background || "#ffffff",
    },
    locked: true,
    name: "Background",
  });

  const idMap = {};

  (bp.nodes || []).forEach((n, idx) => {
    const id = n.id || `node_${idx}_${crypto.randomUUID()}`;
    idMap[n.id || id] = id;
    if (n.type === "text") {
      layers.push({
        id,
        type: "text",
        x: n.x ?? 100,
        y: n.y ?? 100 + idx * 40,
        width: n.width ?? 600,
        height: n.height ?? Math.max(32, (n.fontSize || 16) + 12),
        content: n.content || n.text || "Text",
        props: {
          text: n.content || n.text || "Text",
          fontSize: n.fontSize || 24,
          fontWeight: n.fontWeight || 600,
          color: n.color || "#0f172a",
          fontFamily: n.font || primaryFont,
        },
      });
    } else if (n.type === "image") {
      layers.push({
        id,
        type: "image",
        x: n.x ?? 0,
        y: n.y ?? 0,
        width: n.width ?? width,
        height: n.height ?? Math.round(height * 0.5),
        url: resolveImageUrl(n, imagesMap, idx),
        props: {
          fit: n.fit || "cover",
        },
      });
    } else if (n.type === "shape") {
      layers.push({
        id,
        type: "frame",
        x: n.x ?? 80,
        y: n.y ?? 80 + idx * 60,
        width: n.width ?? width - 160,
        height: n.height ?? 240,
        props: {
          fill: n.fill || "#e5e7eb",
          borderRadius: n.radius ?? n.cornerRadius ?? 0,
        },
      });
    } else {
      layers.push({
        id,
        type: "frame",
        x: n.x ?? 80,
        y: n.y ?? 80 + idx * 60,
        width: n.width ?? 400,
        height: n.height ?? 240,
        props: {
          fill: n.fill || "#f3f4f6",
        },
      });
    }
  });

  const timelineAnimations = convertTimelinesToAnimations(bp.timelines || [], idMap);
  const layersWithAnim = attachAnimationsToLayers(layers, [...timelineAnimations, ...animations], idMap);

  return {
    id: "tmpl_" + crypto.randomUUID(),
    name: bp.name || "AI Generated Template",
    description: bp.description || "",
    mode: "uiux",
    width,
    height,
    layers: layersWithAnim,
    animations,
    pageTransitions: bp.pageTransitions || null,
    tags: [],
  };
}

function placeholderImage(seed = "") {
  const suffix = typeof seed === "string" ? seed.slice(-6) : Math.random().toString(36).slice(2, 8);
  return `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80&sat=-10&sig=${suffix}`;
}

function attachAnimationsToLayers(layers = [], animations = [], idMap = {}) {
  if (!animations?.length) return layers;
  const map = new Map(layers.map((l) => [l.id, { ...l, animations: l.animations || [] }]));
  animations.forEach((rawAnim) => {
    const anim = normalizeAnimation(rawAnim);
    const targetId = anim.nodeId && idMap[anim.nodeId] ? idMap[anim.nodeId] : anim.nodeId;
    if (!targetId || !map.has(targetId)) return;
    const entry = map.get(targetId);
    entry.animations = [...(entry.animations || []), { ...anim, id: anim.id || "anim_" + crypto.randomUUID() }];
    map.set(targetId, entry);
  });
  return Array.from(map.values());
}

function normalizeAnimation(anim) {
  if (!anim) return {};
  if (anim.variants) return anim;
  if (anim.states) return { ...anim, variants: anim.states };
  return anim;
}

function convertTimelinesToAnimations(timelines = [], idMap = {}) {
  const result = [];
  const toMs = (t) => {
    if (t === undefined || t === null) return 0;
    // If t looks like seconds (<= 10), scale to ms; otherwise assume already ms
    return t <= 10 ? Math.round(t * 1000) : t;
  };

  timelines.forEach((timeline) => {
    (timeline.tracks || []).forEach((track, idx) => {
      const nodeId = track.nodeId && idMap[track.nodeId] ? idMap[track.nodeId] : track.nodeId;
      if (!nodeId) return;
      const properties = track.properties || {};
      const tracks = Object.entries(properties).map(([prop, keyframes = []]) => ({
        property: prop,
        keyframes: keyframes.map((kf) => ({
          time: toMs(kf.t ?? kf.time ?? 0),
          value: kf.value !== undefined ? kf.value : kf.val,
          easing: kf.easing || kf.ease,
          duration: kf.duration !== undefined ? toMs(kf.duration) : undefined,
        })),
      }));
      result.push({
        id: timeline.id ? `${timeline.id}_${idx}` : "timeline_" + crypto.randomUUID(),
        nodeId,
        tracks,
        playTimelineOnLoad: timeline.playOn ? timeline.playOn === "onLoad" : true,
        timelineLoop: timeline.loop === true,
        timelineLoopCount: timeline.loopCount,
        triggers: timeline.playOn === "onView" ? ["onView"] : ["onLoad"],
      });
    });
  });

  return result;
}

function buildImageMap(images = []) {
  const map = {};
  images.forEach((img, idx) => {
    const key = img.id || `img_${idx}`;
    if (img.url || img.src) {
      map[key] = img.url || img.src;
    } else if (img.prompt) {
      map[key] = promptToUnsplash(img.prompt, idx);
    }
  });
  return map;
}

function resolveImageUrl(node = {}, imagesMap = {}, seed = "") {
  const direct = node.url || node.imageUrl || node.src;
  if (direct) return direct;
  if (node.imageId && imagesMap[node.imageId]) return imagesMap[node.imageId];
  return placeholderImage(node.imageId || seed);
}

function promptToUnsplash(prompt = "", seed = "") {
  const encoded = encodeURIComponent(String(prompt || "").slice(0, 120) || `creative-${seed}`);
  return `https://source.unsplash.com/1600x900/?${encoded}`;
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
