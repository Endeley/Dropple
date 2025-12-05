"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PresenceSidebar({ projectId }) {
  const presence =
    useQuery(api.presence.getPresence, projectId ? { projectId } : undefined) ||
    [];

  if (!presence.length) return null;

  return (
    <div className="w-52 bg-white border-r h-full p-3 space-y-2">
      <p className="text-sm font-semibold">Team Presence</p>
      <div className="space-y-2">
        {presence.map((p) => (
          <div
            key={p._id}
            className="flex items-center justify-between text-xs border rounded px-2 py-1"
          >
            <span className="truncate">{p.agent || p.userId}</span>
            <span className="text-[10px] text-gray-500">
              {p.status || "active"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
