export function importTemplate(data) {
  if (!data) return { width: 1080, height: 1080, background: "#ffffff", nodes: [] };
  return {
    width: data.width ?? 1080,
    height: data.height ?? 1080,
    background: data.background?.value || data.background || "#ffffff",
    nodes: data.nodes || [],
  };
}
