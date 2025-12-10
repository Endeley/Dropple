/**
 * Dropple Template JSON v1 spec (lightweight).
 * This is a runtime validator (no external deps) to ensure templates are well-formed.
 */

export const droppleTemplateSpecV1 = {
  version: "1",
  fields: {
    id: "string (optional, auto-generated if missing)",
    name: "string",
    description: "string (optional)",
    category: "string (industry/category)",
    tags: "string[]",
    styleId: "string (optional)",
    componentId: "string (optional)",
    motionThemeId: "string (optional)",
    width: "number",
    height: "number",
    assets: "array of {id,type,url,prompt?,license,source}",
    nodes:
      "array of {id,type,x,y,width,height,rotation?,content?,props?,children?,parentId?,blendMode?,filters?,styleId?,animations?}",
    animations:
      "array of {id,nodeId,variants?,triggers?,tracks?,scroll?,playTimelineOnLoad?,timelineLoop?,timelineLoopCount?}",
    pageTransitions: "object (optional)",
    theme: "object (optional tokens/colors/typography)",
  },
};

export function validateDroppleTemplate(template = {}) {
  // Normalize layers -> nodes so older payloads pass validation.
  const tpl = {
    ...template,
    nodes: Array.isArray(template.nodes)
      ? template.nodes
      : Array.isArray(template.layers)
        ? template.layers
        : [],
  };
  const errors = [];
  const reqString = (key) => {
    if (typeof tpl[key] !== "string" || !tpl[key].trim()) errors.push(`Missing or invalid ${key}`);
  };
  const optString = (key) => {
    if (tpl[key] !== undefined && typeof tpl[key] !== "string") errors.push(`Invalid ${key}`);
  };
  const reqNumber = (key) => {
    if (typeof tpl[key] !== "number" || Number.isNaN(tpl[key])) errors.push(`Missing or invalid ${key}`);
  };

  reqString("name");
  reqNumber("width");
  reqNumber("height");
  optString("category");
  optString("styleId");
  optString("componentId");
  optString("motionThemeId");

  if (tpl.tags && !Array.isArray(tpl.tags)) errors.push("tags must be an array");
  if (tpl.tags?.some((t) => typeof t !== "string")) errors.push("tags must be strings");

  if (!Array.isArray(tpl.nodes)) {
    errors.push("nodes must be an array");
  } else {
    tpl.nodes.forEach((n, idx) => {
      if (!n || typeof n !== "object") errors.push(`nodes[${idx}] must be an object`);
      if (!n.id || typeof n.id !== "string") errors.push(`nodes[${idx}].id is required`);
      if (!n.type || typeof n.type !== "string") errors.push(`nodes[${idx}].type is required`);
      ["x", "y", "width", "height"].forEach((k) => {
        if (typeof n[k] !== "number" || Number.isNaN(n[k])) errors.push(`nodes[${idx}].${k} is required number`);
      });
      if (n.parentId !== undefined && typeof n.parentId !== "string") errors.push(`nodes[${idx}].parentId must be string`);
    });
  }

  if (tpl.assets) {
    if (!Array.isArray(tpl.assets)) errors.push("assets must be an array");
    else {
      tpl.assets.forEach((a, idx) => {
        if (!a || typeof a !== "object") errors.push(`assets[${idx}] must be an object`);
        if (!a.id || typeof a.id !== "string") errors.push(`assets[${idx}].id is required`);
        if (!a.type || typeof a.type !== "string") errors.push(`assets[${idx}].type is required`);
        if (!a.url || typeof a.url !== "string") errors.push(`assets[${idx}].url is required`);
        if (!a.source || typeof a.source !== "string") errors.push(`assets[${idx}].source is required`);
        if (!a.license || typeof a.license !== "string") errors.push(`assets[${idx}].license is required`);
      });
    }
  }

  if (tpl.animations) {
    if (!Array.isArray(tpl.animations)) errors.push("animations must be an array");
    else {
      tpl.animations.forEach((a, idx) => {
        if (!a || typeof a !== "object") errors.push(`animations[${idx}] must be an object`);
        if (!a.id || typeof a.id !== "string") errors.push(`animations[${idx}].id is required`);
        if (!a.nodeId || typeof a.nodeId !== "string") errors.push(`animations[${idx}].nodeId is required`);
      });
    }
  }

  const valid = errors.length === 0;
  return { valid, errors };
}

// JSON Schema-ish object (for external validators if needed)
export const droppleTemplateJsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Dropple Template",
  type: "object",
  required: ["name", "width", "height", "nodes"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    category: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    styleId: { type: "string" },
    componentId: { type: "string" },
    motionThemeId: { type: "string" },
    width: { type: "number" },
    height: { type: "number" },
    assets: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "type", "url"],
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          url: { type: "string" },
          prompt: { type: "string" },
          source: { type: "string" },
          license: { type: "string" },
        },
      },
    },
    nodes: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "type", "x", "y", "width", "height"],
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
          rotation: { type: "number" },
          parentId: { type: "string" },
          content: { type: "string" },
          props: { type: "object" },
          children: { type: "array", items: { type: "string" } },
          blendMode: { type: "string" },
          filters: { type: "array" },
          styleId: { type: "string" },
          animations: { type: "array" },
        },
      },
    },
    animations: { type: "array" },
    pageTransitions: { type: "object" },
    theme: { type: "object" },
  },
};
