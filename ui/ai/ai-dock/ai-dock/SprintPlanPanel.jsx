"use client";

import { useWorkspaceStore } from "@/runtime/stores/useWorkspaceStore";

export default function SprintPlanPanel() {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const plan = workspace?.productManagerAgent?.sprintPlan;

  if (!plan || plan.length === 0) return null;

  return (
    <div className="bg-white p-3 border rounded h-40 overflow-auto">
      <p className="text-sm font-semibold">Sprint Plan</p>
      <ul className="list-disc ml-4 text-xs mt-2">
        {plan.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
