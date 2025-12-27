"use client";

import { useAgentStore } from "@/runtime/stores/useAgentStore";

const PIPELINE = [
  "Product Manager Agent",
  "Product Strategy Agent",
  "Research Persona Agent",
  "Competitor Analysis Agent",
  "Brand Agent",
  "UX Agent",
  "Layout Agent",
  "UI Agent",
  "Interaction Designer Agent",
  "Motion Agent",
  "Animation Critique Agent",
  "Content Design Agent",
  "Marketing Copy Agent",
  "Accessibility Agent",
  "Style Consistency Agent",
  "QA Design Agent",
  "Iconography Agent",
  "Code Agent",
  "Code Quality Agent",
  "Performance Agent",
  "SEO Agent",
  "Product Manager Agent",
];

export default function PipelineViewer() {
  const tasks = useAgentStore((s) => s.tasks);

  const getStatus = (agent) => {
    const task = tasks.find((t) => t.agent === agent);
    return task ? task.status : "pending";
  };

  return (
    <div className="bg-white border rounded-lg p-3 h-48 overflow-auto space-y-2">
      <p className="font-semibold text-sm">AI Pipeline</p>

      {PIPELINE.map((agent, idx) => (
        <div key={`${agent}-${idx}`} className="flex items-center space-x-3">
          <span className="text-xs w-[160px]">{agent}</span>
          <span
            className={`px-2 py-1 text-xs rounded ${
              getStatus(agent) === "completed"
                ? "bg-green-200"
                : getStatus(agent) === "running"
                  ? "bg-yellow-200"
                  : "bg-gray-200"
            }`}
          >
            {getStatus(agent)}
          </span>
        </div>
      ))}
    </div>
  );
}
