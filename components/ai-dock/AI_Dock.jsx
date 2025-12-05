"use client";

import { useAgentStore } from "@/store/useAgentStore";
import { useConvexSync } from "@/store/useConvexSync";
import AgentSelector from "./AgentSelector";
import AgentChatFeed from "./AgentChatFeed";
import AgentTaskPanel from "./AgentTaskPanel";
import PipelineViewer from "./PipelineViewer";
import ProductManagerPanel from "./ProductManagerPanel";
import SprintPlanPanel from "./SprintPlanPanel";
import TeamChatPanel from "./TeamChatPanel";
import CollabModeSelector from "./CollabModeSelector";

export default function AI_Dock() {
  useConvexSync();

  const dockOpen = useAgentStore((s) => s.dockOpen);
  const toggleDock = useAgentStore((s) => s.toggleDock);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        onClick={toggleDock}
        className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
      >
        {dockOpen ? "✕" : "🤖"}
      </button>

      {dockOpen && (
        <div className="w-[400px] h-[880px] bg-white shadow-2xl rounded-xl mt-4 p-4 flex flex-col space-y-3 border">
          <div className="space-y-2">
            <AgentSelector />
            <CollabModeSelector />
          </div>
          <ProductManagerPanel />
          <PipelineViewer />
          <SprintPlanPanel />
          <TeamChatPanel />
          <AgentChatFeed />
          <AgentTaskPanel />
        </div>
      )}
    </div>
  );
}
