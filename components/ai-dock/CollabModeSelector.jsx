"use client";

import { useAgentStore } from "@/store/useAgentStore";

const MODES = [
  { value: "assist", label: "🤝 Assist" },
  { value: "cocreate", label: "✍️ Co-Create" },
  { value: "autofix", label: "🛠 Auto-Fix" },
  { value: "shadow", label: "🕶 Shadow" },
];

export default function CollabModeSelector() {
  const collabMode = useAgentStore((s) => s.collabMode);
  const setCollabMode = useAgentStore((s) => s.setCollabMode);

  return (
    <div className="flex flex-wrap gap-2">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setCollabMode(mode.value)}
          className={`px-2 py-1 text-xs rounded-full border ${
            collabMode === mode.value
              ? "bg-purple-600 text-white border-purple-600"
              : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
