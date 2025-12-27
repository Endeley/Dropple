"use client";

import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function DevicePreviewBar({
  onSelect,
  addArtboard,
}) {
  const tbStore = useTemplateBuilderStore();
  const setActiveBreakpoint = onSelect || tbStore?.setActiveBreakpoint;
  const addDeviceArtboard = addArtboard || tbStore?.addDeviceArtboard;

  return (
    <div className="flex flex-row gap-2 border border-slate-200 p-2 bg-white/90 backdrop-blur rounded-md shadow-sm">
      <button
        className="px-3 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm"
        onClick={() => {
          setActiveBreakpoint?.("base");
          addDeviceArtboard?.("mobile");
        }}
      >
        📱 Mobile
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm"
        onClick={() => {
          setActiveBreakpoint?.("tablet");
          addDeviceArtboard?.("tablet");
        }}
      >
        📱 Tablet
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm"
        onClick={() => {
          setActiveBreakpoint?.("desktop");
          addDeviceArtboard?.("desktop");
        }}
      >
        💻 Desktop
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm"
        onClick={() => {
          setActiveBreakpoint?.("large");
          addDeviceArtboard?.("large");
        }}
      >
        🖥️ Large
      </button>
    </div>
  );
}
