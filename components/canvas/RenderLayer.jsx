"use client";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function RenderLayer({ layer }) {
  const setSelected = useWorkspaceStore((s) => s.setSelectedLayer);
  const updateLayer = useWorkspaceStore((s) => s.updateLayer);
  const syncToBackend = useWorkspaceStore((s) => s.syncToBackend);

  const style = {
    position: "absolute",
    top: layer.y,
    left: layer.x,
    width: layer.width,
    height: layer.height,
    background: layer.fill ?? "transparent",
    ...layer.customCSS,
  };

  function handleDrag(e) {
    updateLayer(layer.id, { x: e.clientX, y: e.clientY }, "human");
    syncToBackend();
  }

  return (
    <div
      className="layer-node border cursor-pointer"
      style={style}
      onClick={() => setSelected(layer.id)}
      onMouseDown={handleDrag}
    >
      {layer.text}
      {layer.children?.map((child) => (
        <RenderLayer key={child.id} layer={child} />
      ))}
    </div>
  );
}
