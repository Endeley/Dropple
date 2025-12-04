"use client";

export default function AgentCollabPanel({ messages = [] }) {
  return (
    <div className="p-3 border rounded h-64 overflow-auto bg-gray-50 space-y-2 shadow-sm">
      <h3 className="text-base font-semibold">AI Designer Chat</h3>
      {messages.length === 0 ? (
        <p className="text-xs text-gray-500">No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="p-2 bg-white rounded shadow">
            <p className="text-[11px] text-gray-500">{msg.agent}</p>
            <p className="text-sm text-gray-800">{msg.content}</p>
            {msg.references?.length ? (
              <p className="text-[11px] text-gray-500 mt-1">
                Refs: {msg.references.join(", ")}
              </p>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
