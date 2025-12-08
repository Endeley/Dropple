// Converts AI-generated icon JSON (paths/viewBox/motion) into a Dropple vector node
export function convertIconToNode(icon = {}) {
  const width = 48;
  const height = 48;
  return {
    id: icon.id || "icon_" + crypto.randomUUID(),
    type: "vector",
    x: 0,
    y: 0,
    width,
    height,
    viewBox: icon.viewBox || "0 0 24 24",
    paths: icon.paths || [],
    style: {
      fill: icon.style === "solid" ? icon.paths?.[0]?.fill || "#000" : "none",
      stroke: icon.style === "outline" || icon.style === "duotone" ? icon.paths?.[0]?.stroke || "#000" : undefined,
    },
    motion: icon.motion || null,
    defs: icon.defs || null,
  };
}
