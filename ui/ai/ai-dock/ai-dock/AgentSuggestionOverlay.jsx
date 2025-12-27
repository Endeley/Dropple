"use client";

import { useWorkspaceStore } from "@/runtime/stores/useWorkspaceStore";

export default function AgentSuggestionOverlay({ suggestions }) {
  const updateLayer = useWorkspaceStore((s) => s.updateLayer);
  const syncToBackend = useWorkspaceStore((s) => s.syncToBackend);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {suggestions.map((s) => (
        <div
          key={s.id}
          className="absolute pointer-events-auto bg-white border shadow-lg rounded-md p-2 text-xs"
          style={{
            top: s.position?.y ?? 0,
            left: s.position?.x ?? 0,
          }}
        >
          <p className="font-medium">{s.agent}</p>
          <p>{s.message}</p>

          {s.fix ? (
            <button
              className="mt-1 text-blue-600 underline pointer-events-auto"
              onClick={s.fix}
            >
              Apply Fix
            </button>
          ) : s.layerId && s.property ? (
            <button
              className="mt-1 text-blue-600 underline pointer-events-auto"
              onClick={() => {
                updateLayer(s.layerId, { [s.property]: s.value }, "agent");
                syncToBackend();
              }}
            >
              Apply Fix
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
