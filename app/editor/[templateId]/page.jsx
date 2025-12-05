"use client";

import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import LayersPanel from "./components/LayersPanel";
import PropertiesPanel from "./components/PropertiesPanel";
import AssetUploadPanel from "./components/AssetUploadPanel";
import ComponentLibrary from "./components/ComponentLibrary";
import AutoLayoutControls from "./components/AutoLayoutControls";
import EditorHeader from "@/components/global/EditorHeader";
import EditorSidebar from "@/components/global/EditorSidebar";
import EditorFooter from "@/components/global/EditorFooter";
import { useEditorStore } from "./hooks/useEditorStore";
import { useEffect } from "react";
import { importTemplate } from "./utils/importTemplate";

export default function TemplateEditorPage({ params }) {
  const { templateId } = params;
  const { loadTemplate } = useEditorStore();

  useEffect(() => {
    // placeholder: fetch from API/Convex and load
    async function fetchTemplate() {
      // TODO: replace with real fetch
      const data = await Promise.resolve(null);
      if (data) loadTemplate(importTemplate(data));
    }
    fetchTemplate();

    const onKeyDown = (e) => {
      if (e.shiftKey && e.key === "A") {
        // Figma-style auto layout shortcut
        import("../hooks/useEditorStore").then(({ useEditorStore }) => {
          useEditorStore.getState().wrapSelectedInAutoLayout();
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [templateId, loadTemplate]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 text-gray-900">
      <EditorHeader />
      <Toolbar templateId={templateId} />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 border-r bg-white">
            <LayersPanel />
            <AssetUploadPanel />
            <ComponentLibrary />
            <AutoLayoutControls />
          </div>
          <div className="flex-1 relative bg-gray-100">
            <Canvas />
          </div>
          <div className="w-80 border-l bg-white">
            <PropertiesPanel />
          </div>
        </div>
      </div>
      <EditorFooter />
    </div>
  );
}
