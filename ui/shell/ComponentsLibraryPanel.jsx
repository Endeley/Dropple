"use client";

import { useComponentStore } from "@/runtime/stores/componentStore";
import { useNodeTreeStore } from "@/runtime/stores/nodeTreeStore";
import { useToolStore } from "@/runtime/stores/toolStore";
import { useSelectionStore } from "@/runtime/stores/selectionStore";

export default function ComponentsLibraryPanel() {
  const components = useComponentStore((s) => s.components);
  const createInstance = useNodeTreeStore((s) => s.createInstance);
  const setTool = useToolStore((s) => s.setTool);
  const setDraggingComponent = useComponentStore((s) => s.setDraggingComponent);
  const clearDraggingComponent = useComponentStore((s) => s.clearDraggingComponent);
  const updateComponent = useComponentStore((s) => s.updateComponent);
  const removeComponent = useComponentStore((s) => s.removeComponent);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const nodes = useNodeTreeStore((s) => s.nodes);

  const selectedInstanceId = selectedIds.find((id) => nodes[id]?.type === "component-instance");
  const selectedInstance = selectedInstanceId ? nodes[selectedInstanceId] : null;

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
              <div className="flex items-center gap-1">
                <button
                  className="text-[11px] text-neutral-600 hover:text-violet-700 px-2 py-1 border border-neutral-200 rounded"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-component-id", comp.id);
                    setDraggingComponent(comp.id);
                  }}
                  onDragEnd={() => {
                    clearDraggingComponent();
                  }}
                  onClick={() => {
                    createInstance(comp.id, 120, 120);
                    setTool("select");
                  }}
                >
                  Insert
                </button>
                <button
                  className="text-[11px] text-neutral-500 hover:text-neutral-800 px-2 py-1 border border-neutral-200 rounded"
                  onClick={() => {
                    const name = prompt("Rename component", comp.name || comp.id);
                    if (name) updateComponent(comp.id, { name });
                  }}
                  title="Rename"
                >
                  Ren
                </button>
                <button
                  className="text-[11px] text-red-600 hover:text-red-700 px-2 py-1 border border-red-200 rounded"
                  onClick={() => {
                    const inUse = Object.values(nodes || {}).some(
                      (n) => n.type === "component-instance" && n.componentId === comp.id,
                    );
                    if (inUse && !confirm("This component has instances. Delete anyway?")) return;
                    removeComponent(comp.id);
                  }}
                  title="Delete"
                >
                  Del
                </button>
                <button
                  className={`text-[11px] px-2 py-1 border rounded ${selectedInstance ? "border-neutral-200 text-neutral-700 hover:text-violet-700" : "border-neutral-100 text-neutral-400 cursor-not-allowed"}`}
                  disabled={!selectedInstance}
                  onClick={() => {
                    if (!selectedInstance) return;
                    useNodeTreeStore.getState().updateNode(selectedInstance.id, {
                      componentId: comp.id,
                      nodeOverrides: {},
                      propOverrides: {},
                    });
                  }}
                  title="Swap into selected instance"
                >
                  Swap
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
