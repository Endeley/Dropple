"use client";

import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";
import { useTokenStore } from "@/runtime/stores/tokenStore";

export default function SlotsPanel({ layer, component }) {
  const updateInstanceSlots = useTemplateBuilderStore((s) => s.updateInstanceSlots);
  const setInstanceVariant = useTemplateBuilderStore((s) => s.setInstanceVariant);
  const detachInstance = useTemplateBuilderStore((s) => s.detachInstance);
  const resetInstanceOverrides = useTemplateBuilderStore((s) => s.resetInstanceOverrides);
  const updateMasterFromInstance = useTemplateBuilderStore((s) => s.updateMasterFromInstance);
  const setInstanceUseMasterMotion = useTemplateBuilderStore((s) => s.setInstanceUseMasterMotion);
  const registry = useTemplateBuilderStore((s) => s.instanceRegistry || {});
  const tokens = useTokenStore((s) => s.tokens);
  const resolveToken = useTokenStore((s) => s.getTokenValue);
  const instance = registry[layer.id];
  const slots = component?.slots || [];
  const variants = component?.variants || [];

  if (!instance) return null;

  const handleSlotChange = (slotId, value) => {
    updateInstanceSlots(layer.id, { [slotId]: value });
  };

  const colorOptions = Object.keys(tokens?.colors || {});

  return (
    <div className="space-y-3 border-b pb-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Component Instance</h3>
        <button
          onClick={() => detachInstance(layer.id)}
          className="text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50"
        >
          Detach
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => resetInstanceOverrides(layer.id)}
          className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Reset Overrides
        </button>
        <button
          onClick={() => updateMasterFromInstance(layer.id)}
          className="text-xs px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          Update Master
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="use-master-motion"
          type="checkbox"
          checked={instance.useMasterMotion !== false}
          onChange={(e) => setInstanceUseMasterMotion(layer.id, e.target.checked)}
        />
        <label htmlFor="use-master-motion" className="text-xs text-slate-600">
          Use master motion/variants
        </label>
      </div>

      {variants?.length ? (
        <div className="space-y-1">
          <div className="text-xs text-slate-500">Variant</div>
          <select
            className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
            value={instance.variant || "default"}
            onChange={(e) => setInstanceVariant(layer.id, e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id || v.name} value={v.id || v.name || "default"}>
                {v.name || v.id}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {slots.length ? (
        <div className="space-y-2">
          <div className="text-xs text-slate-500">Slots</div>
          {slots.map((slot) => (
            <div key={slot.id} className="space-y-1">
              <div className="text-xs font-semibold text-slate-700">{slot.id}</div>
              <input
                className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
                value={instance.slotData?.[slot.id] ?? slot.default ?? ""}
                onChange={(e) => handleSlotChange(slot.id, e.target.value)}
                placeholder={slot.type || "text"}
              />
              {colorOptions.length > 0 && (
                <select
                  className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-slate-600"
                  onChange={(e) => {
                    const val = resolveToken(`colors.${e.target.value}`);
                    if (val) handleSlotChange(slot.id, val);
                  }}
                  defaultValue=""
                >
                  <option value="">Apply color token…</option>
                  {colorOptions.map((c) => (
                    <option key={c} value={c}>
                      colors.{c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
