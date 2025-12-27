"use client";

import WorkspaceShell from "@/ui/shell/WorkspaceShell";
import UIUXTools from "./components/UIUXTools";
import UIUXCanvas from "./components/UIUXCanvas";
import UIUXProperties from "./components/UIUXProperties";
import UIUXTopBar from "./components/UIUXTopBar";
import UIUXBottomBar from "./components/UIUXBottomBar";
import AssetBrowser from "./components/AssetBrowser";
import { useRealtimeClient } from "@/lib/realtime/useRealtimeClient";
import { usePageStore } from "@/runtime/stores/pageStore";
import { useState } from "react";
import { TemplateSaveModal } from "./components/TemplateSaveModal";
import { TemplateAIGeneratorModal } from "./components/TemplateAIGeneratorModal";

export default function UIUXWorkspace() {
  const currentPageId = usePageStore((s) => s.currentPageId);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  useRealtimeClient("project_local", currentPageId);

  return (
    <>
      <WorkspaceShell
        top={
          <UIUXTopBar
            onSaveTemplate={() => setShowSaveModal(true)}
            onPublishTemplate={() => setShowPublishModal(true)}
            onAIGenerate={() => setShowAIGenerate(true)}
          />
        }
        left={<UIUXTools />}
        canvas={<UIUXCanvas />}
        right={<UIUXProperties />}
        bottom={<UIUXBottomBar />}
      />
      <AssetBrowser />
      {showSaveModal ? <TemplateSaveModal open onClose={() => setShowSaveModal(false)} mode="save" /> : null}
      {showPublishModal ? <TemplateSaveModal open onClose={() => setShowPublishModal(false)} mode="publish" /> : null}
      {showAIGenerate ? <TemplateAIGeneratorModal open onClose={() => setShowAIGenerate(false)} /> : null}
    </>
  );
}
