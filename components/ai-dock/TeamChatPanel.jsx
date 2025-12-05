"use client";

import { useAgentStore } from "@/store/useAgentStore";
import { formatTimestamp } from "@/utils/formatTimestamp";

export default function TeamChatPanel() {
  const messages = useAgentStore((s) => s.messages);
  const teamMessages = messages.filter(
    (m) => m.type === "request" || m.type === "response",
  );

  if (teamMessages.length === 0) return null;

  return (
    <div className="bg-white border rounded p-3 h-56 overflow-auto">
      <p className="font-semibold text-sm">AI Team Discussion</p>

      {teamMessages.map((m) => (
        <div
          key={m._id || m.id}
          className="mt-2 p-2 bg-gray-50 border rounded"
        >
          <p className="text-xs text-gray-600">
            {m.from} → {m.to}
          </p>
          <p className="text-sm">{m.question || m.answer}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {formatTimestamp(m.timestamp || m._creationTime || Date.now())}
          </p>
        </div>
      ))}
    </div>
  );
}
