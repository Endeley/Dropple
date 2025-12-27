"use client";

import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function PrototypePanel({ layer }) {
  const { pages, updateInteraction, addInteraction, removeInteraction } =
    useTemplateBuilderStore();

  const interactions = layer.interactions || [];

  const artboards = pages
    .flatMap((p) => p.layers)
    .filter((l) => l.type === "artboard");

  return (
    <div className="border-b pb-4 space-y-3">
      <h3 className="font-medium">Prototype</h3>

      {interactions.map((intObj) => (
        <div key={intObj.id} className="border rounded p-2 space-y-2">
          <label className="block text-xs">Trigger</label>
          <select
            className="p-1 border rounded w-full text-sm"
            value={intObj.trigger}
            onChange={(e) =>
              updateInteraction(layer.id, intObj.id, {
                trigger: e.target.value,
              })
            }
          >
            <option value="onClick">On Click</option>
            <option value="onHover">On Hover</option>
            <option value="onTap">On Tap</option>
            <option value="onDrag">On Drag</option>
          </select>

          <label className="block text-xs">Action</label>
          <select
            className="p-1 border rounded w-full text-sm"
            value={intObj.action}
            onChange={(e) =>
              updateInteraction(layer.id, intObj.id, {
                action: e.target.value,
              })
            }
          >
            <option value="navigate">Navigate To</option>
            <option value="openOverlay">Open Overlay</option>
            <option value="closeOverlay">Close Overlay</option>
            <option value="changeStyle">Change Style</option>
            <option value="animation">Play Animation</option>
          </select>

          {intObj.action === "navigate" && (
            <>
              <label className="block text-xs">Destination</label>
              <select
                className="p-1 border rounded w-full text-sm"
                value={intObj.target || ""}
                onChange={(e) =>
                  updateInteraction(layer.id, intObj.id, {
                    target: e.target.value,
                  })
                }
              >
                <option value="">Select Artboard</option>
                {artboards.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <label className="block text-xs">Transition</label>
              <select
                className="p-1 border rounded w-full text-sm"
                value={intObj.transition || "instant"}
                onChange={(e) =>
                  updateInteraction(layer.id, intObj.id, {
                    transition: e.target.value,
                  })
                }
              >
                <option value="instant">Instant</option>
                <option value="dissolve">Dissolve</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="push-left">Push Left</option>
                <option value="smart-animate">Smart Animate</option>
              </select>
            </>
          )}

          <button
            className="text-red-600 text-xs"
            onClick={() => removeInteraction(layer.id, intObj.id)}
          >
            Remove Interaction
          </button>
        </div>
      ))}

      <button
        className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
        onClick={() =>
          addInteraction(layer.id, {
            trigger: "onClick",
            action: "navigate",
            target: null,
            transition: "instant",
            duration: 300,
            easing: "ease-in-out",
          })
        }
      >
        + Add Interaction
      </button>
    </div>
  );
}
