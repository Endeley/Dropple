"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SprintBoard() {
  const sprint = useQuery(api.sprints.getActiveSprint) || null;

  if (!sprint) return <p className="text-sm text-gray-500">No active sprint</p>;

  return (
    <div className="bg-white p-4 rounded shadow-xl h-96 overflow-auto">
      <p className="font-bold">Sprint {sprint.number}</p>
      <p className="text-sm text-gray-500">
        {(sprint.goals || []).join(", ")}
      </p>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Column
          title="To Do"
          items={(sprint.tasks || []).filter((t) => t.status === "queued")}
        />
        <Column
          title="In Progress"
          items={(sprint.tasks || []).filter((t) => t.status === "running")}
        />
        <Column
          title="Done"
          items={(sprint.tasks || []).filter((t) => t.status === "completed")}
        />
      </div>
    </div>
  );
}

function Column({ title, items }) {
  return (
    <div className="bg-gray-50 border rounded p-3">
      <p className="font-semibold text-sm mb-2">{title}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white border rounded p-2 text-xs">
            <p className="font-semibold">{item.title || item.prompt}</p>
            <p className="text-gray-600">{item.description}</p>
            <p className="text-gray-500">
              {item.assignedTo || item.agent || "Unassigned"}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[11px] text-gray-400">No items</p>
        )}
      </div>
    </div>
  );
}
