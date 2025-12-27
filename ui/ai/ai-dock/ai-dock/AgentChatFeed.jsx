"use client";

import { useState } from "react";
import { useAgentStore } from "@/runtime/stores/useAgentStore";
import { formatTimestamp } from "@/utils/formatTimestamp";

export default function AgentChatFeed() {
  const messages = useAgentStore((s) => s.messages);
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const typing = useAgentStore((s) => s.typing);
  const [now] = useState(() => Date.now());

  const filtered = selectedAgent
    ? messages.filter((m) => m.agent === selectedAgent || m.agent === "System")
    : messages;

  return (
    <div className="flex-1 bg-gray-50 rounded-lg p-3 overflow-auto space-y-3">
      {filtered.map((m) => (
        <div
          key={m._id || m.id}
          className="bg-white border rounded-lg p-3 shadow-sm"
        >
          <p className="text-xs text-gray-500">{m.agent}</p>
          <p className="text-sm mt-1">{m.content}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {formatTimestamp(m.timestamp || m._creationTime || now)}
          </p>
          {typing[m.agent] ? (
            <p className="text-[10px] text-purple-500 mt-1">typing…</p>
          ) : null}
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          No messages yet.
        </p>
      )}
    </div>
  );
}
