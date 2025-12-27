"use client";

import { useAgentStore } from "@/runtime/stores/useAgentStore";

export default function ProductManagerPanel() {
  const messages = useAgentStore((s) => s.messages);
  const pmMessages = messages.filter(
    (m) => m.agent === "Product Manager Agent",
  );

  if (pmMessages.length === 0) return null;

  return (
    <div className="bg-white border rounded p-3 h-40 overflow-auto">
      <p className="font-semibold text-sm">AT — Product Manager</p>
      {pmMessages.map((m) => (
        <div
          key={m._id || m.id}
          className="mt-2 p-2 bg-gray-50 border rounded"
        >
          <p className="text-xs">{m.content}</p>
        </div>
      ))}
    </div>
  );
}
