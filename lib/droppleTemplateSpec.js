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
    assets: "array of {id,type,url,prompt?,license?,source?}",
    nodes:
      "array of {id,type,x,y,width,height,rotation?,content?,props?,children?,parentId?,blendMode?,filters?,styleId?,animations?}",
    animations:
      "array of {id,nodeId,variants?,triggers?,tracks?,scroll?,playTimelineOnLoad?,timelineLoop?,timelineLoopCount?}",
    pageTransitions: "object (optional)",
    theme: "object (optional tokens/colors/typography)",
  },
};

export function validateDroppleTemplate(template = {}) {
  const errors = [];
  const reqString = (key) => {
    if (typeof template[key] !== "string" || !template[key].trim()) errors.push(`Missing or invalid ${key}`);
  };
  const optString = (key) => {
    if (template[key] !== undefined && typeof template[key] !== "string") errors.push(`Invalid ${key}`);
  };
  const reqNumber = (key) => {
    if (typeof template[key] !== "number" || Number.isNaN(template[key])) errors.push(`Missing or invalid ${key}`);
  };

  reqString("name");
  reqNumber("width");
  reqNumber("height");
  optString("category");
  optString("styleId");
  optString("componentId");
  optString("motionThemeId");

  if (template.tags && !Array.isArray(template.tags)) errors.push("tags must be an array");
  if (template.tags?.some((t) => typeof t !== "string")) errors.push("tags must be strings");

  if (!Array.isArray(template.nodes)) {
    errors.push("nodes must be an array");
  } else {
    template.nodes.forEach((n, idx) => {
      if (!n || typeof n !== "object") errors.push(`nodes[${idx}] must be an object`);
      if (!n.id || typeof n.id !== "string") errors.push(`nodes[${idx}].id is required`);
      if (!n.type || typeof n.type !== "string") errors.push(`nodes[${idx}].type is required`);
      ["x", "y", "width", "height"].forEach((k) => {
        if (typeof n[k] !== "number" || Number.isNaN(n[k])) errors.push(`nodes[${idx}].${k} is required number`);
      });
      if (n.parentId !== undefined && typeof n.parentId !== "string") errors.push(`nodes[${idx}].parentId must be string`);
    });
  }

  if (template.assets) {
    if (!Array.isArray(template.assets)) errors.push("assets must be an array");
    else {
      template.assets.forEach((a, idx) => {
        if (!a || typeof a !== "object") errors.push(`assets[${idx}] must be an object`);
        if (!a.id || typeof a.id !== "string") errors.push(`assets[${idx}].id is required`);
        if (!a.type || typeof a.type !== "string") errors.push(`assets[${idx}].type is required`);
        if (!a.url || typeof a.url !== "string") errors.push(`assets[${idx}].url is required`);
      });
    }
  }

  if (template.animations) {
    if (!Array.isArray(template.animations)) errors.push("animations must be an array");
    else {
      template.animations.forEach((a, idx) => {
        if (!a || typeof a !== "object") errors.push(`animations[${idx}] must be an object`);
        if (!a.id || typeof a.id !== "string") errors.push(`animations[${idx}].id is required`);
        if (!a.nodeId || typeof a.nodeId !== "string") errors.push(`animations[${idx}].nodeId is required`);
      });
    }
  }

  const valid = errors.length === 0;
  return { valid, errors };
}
