"use client";

import { useAgentStore } from "@/runtime/stores/useAgentStore";

export default function AgentTaskPanel() {
  const tasks = useAgentStore((s) => s.tasks);

  return (
    <div className="bg-white border rounded-lg p-3 h-32 overflow-auto space-y-2">
      <p className="font-medium text-sm">Agent Tasks</p>

      {tasks.map((t) => (
        <div
          key={t._id || t.id}
          className="border bg-gray-100 rounded p-2 text-xs space-y-1"
        >
          <p className="font-semibold">{t.agent}</p>
          <p>Status: {t.status || "queued"}</p>
        </div>
      ))}

      {tasks.length === 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          No active tasks.
        </p>
      )}
    </div>
  );
}
