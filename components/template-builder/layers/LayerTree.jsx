"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import LayerTreeItem from "./LayerTreeItem";

export default function LayerTree() {
  const { currentTemplate } = useTemplateBuilderStore();
  const layers = currentTemplate.layers || [];

  const rootLayers = layers.filter((l) => !l.parentId);

  return (
    <div className="p-3 space-y-1 overflow-y-auto h-full">
      {rootLayers.map((layer) => (
        <LayerTreeItem key={layer.id} layer={layer} />
      ))}
    </div>
  );
}
