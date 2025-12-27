"use client";
import InspectorPanel from "./InspectorPanel";
import ExportCodePanel from "@/ui/panels/export/ExportCodePanel";
import AgentCollabPanel from "@/ui/ai/AgentCollabPanel";
import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function BuilderRightPanel() {
  const messages = useTemplateBuilderStore((s) => s.agentMessages || []);

  return (
    <div className="w-72 border-l border-slate-200 bg-white shadow-sm h-full p-4 overflow-auto text-gray-900">
      <ExportCodePanel />
      <div className="h-4" />
      <AgentCollabPanel messages={messages} />
      <div className="h-4" />
      <InspectorPanel />
    </div>
  );
}
