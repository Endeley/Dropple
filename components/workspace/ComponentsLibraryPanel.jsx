"use client";

import { useComponentStore } from "@/zustand/componentStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useToolStore } from "@/zustand/toolStore";

export default function ComponentsLibraryPanel() {
  const components = useComponentStore((s) => s.components);
  const createInstance = useNodeTreeStore((s) => s.createInstance);
  const setTool = useToolStore((s) => s.setTool);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="px-3 py-2 border-b border-neutral-100 text-[11px] uppercase tracking-[0.08em] text-neutral-500 font-semibold">
        Components Library
      </div>
      <div className="max-h-64 overflow-auto divide-y divide-neutral-100">
        {Object.values(components || {}).length === 0 ? (
          <div className="px-3 py-2 text-xs text-neutral-500">No components yet.</div>
        ) : (
          Object.values(components).map((comp) => (
            <div key={comp.id} className="px-3 py-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-800 truncate">{comp.name || comp.id}</span>
                <span className="text-[11px] text-neutral-500">{comp.id.slice(0, 6)}</span>
              </div>
              <button
                className="text-[11px] text-neutral-600 hover:text-violet-700 px-2 py-1 border border-neutral-200 rounded"
                onClick={() => {
                  createInstance(comp.id, 120, 120);
                  setTool("select");
                }}
              >
                Insert
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
