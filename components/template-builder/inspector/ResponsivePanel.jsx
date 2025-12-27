"use client";

import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function ResponsivePanel({ layer }) {
  const { activeBreakpoint, updateLayer } = useTemplateBuilderStore();

  const overrides = layer.responsive?.[activeBreakpoint] || {};

  function updateOverride(field, value) {
    updateLayer(layer.id, {
      responsive: {
        ...layer.responsive,
        [activeBreakpoint]: {
          ...overrides,
          [field]: value,
        },
      },
    });
  }

  return (
    <div className="border-b pb-4 space-y-3">
      <h3 className="font-medium">Responsive ({activeBreakpoint})</h3>

      <label className="block text-xs">Width</label>
      <input
        type="number"
        className="p-1 border rounded w-full text-sm"
        value={overrides.width ?? ""}
        onChange={(e) => updateOverride("width", Number(e.target.value))}
        placeholder="Inherit"
      />

      <label className="block text-xs">Direction</label>
      <select
        className="p-1 border rounded w-full text-sm"
        value={overrides.autoLayout?.direction ?? ""}
        onChange={(e) =>
          updateOverride("autoLayout", {
            ...overrides.autoLayout,
            direction: e.target.value,
          })
        }
      >
        <option value="">Use Base</option>
        <option value="horizontal">Row</option>
        <option value="vertical">Column</option>
      </select>

      <label className="block text-xs">Visibility</label>
      <select
        className="p-1 border rounded w-full text-sm"
        value={overrides.visibility ?? "inherit"}
        onChange={(e) => updateOverride("visibility", e.target.value)}
      >
        <option value="inherit">Inherit</option>
        <option value="visible">Visible</option>
        <option value="hidden">Hidden</option>
      </select>
    </div>
  );
}
