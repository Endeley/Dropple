"use client";

import { useAgentStore } from "@/store/useAgentStore";

const AGENTS = [
  "Product Manager Agent",
  "Brand Agent",
  "UX Agent",
  "Layout Agent",
  "UI Agent",
  "Motion Agent",
  "Code Agent",
  "Accessibility Agent",
  "Marketing Copy Agent",
  "Animation Critique Agent",
  "Iconography Agent",
  "Research Persona Agent",
  "Competitor Analysis Agent",
  "Product Strategy Agent",
  "Style Consistency Agent",
  "QA Design Agent",
  "Content Design Agent",
  "Interaction Designer Agent",
  "Performance Agent",
  "Code Quality Agent",
  "SEO Agent",
];

export default function AgentSelector() {
  const selected = useAgentStore((s) => s.selectedAgent);
  const setAgent = useAgentStore((s) => s.setAgent);

  return (
    <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
      {AGENTS.map((agent, idx) => (
        <button
          key={`${agent}-${idx}`}
          onClick={() => setAgent(agent)}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selected === agent ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          {agent.replace(" Agent", "")}
        </button>
      ))}
    </div>
  );
}
