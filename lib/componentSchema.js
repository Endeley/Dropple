// Universal Component Schema for Dropple (CE-1)
// Provides a reference shape and a lightweight validator.

export const componentSchemaSpec = {
  id: "string",
  name: "string",
  type: "component",
  metadata: "object", // description, category, tags, version
  tokens: "object", // color/radius/spacing/font tokens
  slots: "array", // [{ id, type, default, optional }]
  nodes: "array", // node tree with layout/style/children/slotId
  variants: "object", // { default: {...}, hover: {...}, ... }
  interactions: "array", // triggers and actions
  motion: "object", // initial/animate/whileHover/whileTap bindings
};

export const componentSchemaExample = {
  id: "component_button_primary",
  name: "Button",
  type: "component",
  metadata: {
    description: "Primary button component",
    category: "interaction",
    tags: ["button", "cta", "primary"],
    version: "1.0.0",
  },
  tokens: {
    color: "brand.primary",
    radius: "md",
    spacing: "md",
    font: "body.bold",
  },
  slots: [
    { id: "label", type: "text", default: "Button Text" },
    { id: "icon", type: "icon", optional: true },
  ],
  nodes: [
    {
      id: "root",
      type: "frame",
      layout: { direction: "row", padding: 16, gap: 8, align: "center", justify: "center" },
      style: { fill: "{color}", radius: "{radius}" },
      children: ["icon_node", "label_node"],
    },
    {
      id: "label_node",
      type: "text",
      style: { color: "white", font: "{font}", fontSize: 16 },
      slotId: "label",
    },
    {
      id: "icon_node",
      type: "icon",
      style: { size: 16, color: "white" },
      slotId: "icon",
    },
  ],
  variants: {
    default: { styleOverrides: { root: { fill: "{color}" } } },
    hover: {
      styleOverrides: { root: { fill: "darken({color}, 8%)" } },
      motion: { scale: 1.02, transition: { duration: 0.2 } },
    },
    pressed: {
      styleOverrides: { root: { fill: "darken({color}, 16%)" } },
      motion: { scale: 0.96, transition: { duration: 0.1 } },
    },
    disabled: {
      styleOverrides: { root: { fill: "gray.400" }, label_node: { color: "gray.600" } },
      interaction: { pointerEvents: "none" },
    },
  },
  interactions: [{ trigger: "onClick", action: "emit", payload: { event: "button_click" } }],
  motion: { initial: "default", animate: "default", whileHover: "hover", whileTap: "pressed" },
};

export function validateComponentDefinition(comp = {}) {
  const errors = [];
  if (!comp.id) errors.push("id is required");
  if (!comp.name) errors.push("name is required");
  if (comp.type && comp.type !== "component") errors.push("type should be 'component'");
  if (!Array.isArray(comp.nodes)) errors.push("nodes must be an array");
  if (comp.slots && !Array.isArray(comp.slots)) errors.push("slots must be an array");
  if (comp.variants && typeof comp.variants !== "object") errors.push("variants must be an object");
  if (comp.interactions && !Array.isArray(comp.interactions)) errors.push("interactions must be an array");
  if (comp.motion && typeof comp.motion !== "object") errors.push("motion must be an object");
  return { valid: errors.length === 0, errors };
}
