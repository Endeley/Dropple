"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const colorMap = {
  "UX Agent": "#f97316",
  "UI Agent": "#22c55e",
  "Product Manager Agent": "#a855f7",
  "Code Agent": "#ef4444",
};

function cursorColor(id = "") {
  if (colorMap[id]) return colorMap[id];
  if (id.startsWith("AI:")) return "#a78bfa";
  return "#3b82f6"; // humans default blue
}

export default function CursorsOverlay({ projectId }) {
  const presence =
    useQuery(api.presence.getPresence, projectId ? { projectId } : undefined) ||
    [];

  if (!presence.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {presence.map((p) => (
        <div
          key={p._id}
          className="absolute"
          style={{ left: p.cursor.x, top: p.cursor.y }}
        >
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: cursorColor(p.agent || p.userId) }}
            />
            <span className="text-xs text-gray-800 bg-white/80 rounded px-1 py-[1px]">
              {p.agent || p.userId}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
