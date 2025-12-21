export function assembleWorkspace({
  brand,
  structure,
  ui,
  assets,
  prototype,
  animations,
  messages = [],
}) {
  return {
    id: "workspace_" + crypto.randomUUID(),
    brand,
    structure,
    ui,
    assets,
    prototype,
    animations,
    messages,
    pages: ui?.pages || [],
  };
}
