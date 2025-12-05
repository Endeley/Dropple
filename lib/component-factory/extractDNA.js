export function extractComponentDNA(layer) {
  return {
    type: layer.type,
    shape: layer.radius ? `rounded-[${layer.radius}px]` : "rounded-md",
    padding: computePadding(layer),
    color: extractColor(layer),
    typography: extractTypography(layer),
    interaction: extractInteraction(layer),
    variants: guessVariants(layer),
  };
}

function computePadding(layer) {
  if (layer.padding) return layer.padding;
  return "px-4 py-2";
}

function extractColor(layer) {
  return {
    bg: layer.fill || "bg-primary",
    border: layer.borderColor || "border-primary",
    text: layer.color || "text-white",
    bgSoft: layer.fillSoft || "bg-primary/10",
  };
}

function extractTypography(layer) {
  return {
    font: layer.font || "font-semibold",
    size: layer.fontSize || "text-base",
  };
}

function extractInteraction(layer) {
  return layer.interaction || ["hover", "active", "focus"];
}

function guessVariants(layer) {
  const variants = ["solid", "outline", "ghost"];
  if (layer.type === "badge") variants.push("soft");
  return variants;
}
