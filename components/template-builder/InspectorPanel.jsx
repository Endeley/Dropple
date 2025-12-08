"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import SizePanel from "./inspector/SizePanel";
import PositionPanel from "./inspector/PositionPanel";
import TypographyPanel from "./inspector/TypographyPanel";
import ColorPanel from "./inspector/ColorPanel";
import BorderPanel from "./inspector/BorderPanel";
import RadiusPanel from "./inspector/RadiusPanel";
import EffectsPanel from "./inspector/EffectsPanel";
import ConstraintsPanel from "./inspector/ConstraintsPanel";
import StylePicker from "./inspector/styles/StylePicker";
import PrototypePanel from "./inspector/PrototypePanel";
import ResponsivePanel from "./inspector/ResponsivePanel";
import TimelinePanel from "./TimelinePanel";
import MotionPanel from "./inspector/MotionPanel";

export default function InspectorPanel() {
  const {
    currentTemplate,
    selectedLayerId,
    isEditingComponent,
    editingComponentId,
    editingVariantId,
    components,
    enterComponentEdit,
    setExportModalOpen,
  } = useTemplateBuilderStore();

  let layer = currentTemplate.layers.find((l) => l.id === selectedLayerId);
  let componentForInstance = null;

  if (isEditingComponent && editingComponentId) {
    const comp = components.find((c) => c._id === editingComponentId);
    const nodes = editingVariantId
      ? comp?.variants?.find((v) => v.id === editingVariantId)?.nodes
      : comp?.nodes;
    layer = nodes?.find((n) => n.id === selectedLayerId);
  }

  if (layer?.type === "component-instance") {
    componentForInstance =
      components.find((c) => c._id === layer.componentId) || null;
  }

  if (!layer) {
    return (
      <div className="p-4 text-gray-500">
        Select a layer to edit its properties.
      </div>
    );
  }

  const title =
    layer.type.charAt(0).toUpperCase() + layer.type.slice(1) + " Properties";

  return (
    <div className="p-2 space-y-6 overflow-y-auto h-full">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="flex gap-2">
        <button
          className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 text-sm"
          onClick={() => setExportModalOpen(true)}
        >
          Export Code
        </button>
      </div>

      {layer.type === "component-instance" && (
        <button
          className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={() =>
            enterComponentEdit(layer.componentId, layer.variantId, {
              name: componentForInstance?.name || "Component",
              nodes: componentForInstance?.nodes || layer.componentNodes || layer.nodes || [],
              variants: componentForInstance?.variants || layer.componentVariants || [],
            })
          }
        >
          Edit Component
        </button>
      )}

      <PositionPanel layer={layer} />
      <SizePanel layer={layer} />
      <ConstraintsPanel layer={layer} />
      <StylePicker layer={layer} />
      <MotionPanel layer={layer} />
      <ResponsivePanel layer={layer} />
      <PrototypePanel layer={layer} />
      {layer.animations?.length ? <TimelinePanel layer={layer} /> : null}

      {layer.type === "text" && (
        <>
          <TypographyPanel layer={layer} />
          <ColorPanel layer={layer} />
        </>
      )}

      {layer.type !== "text" && <ColorPanel layer={layer} />}

      <BorderPanel layer={layer} />
      <RadiusPanel layer={layer} />
      <EffectsPanel layer={layer} />
    </div>
  );
}
