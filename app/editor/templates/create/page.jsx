"use client";

import BuilderHeader from "@/components/template-builder/BuilderHeader";
import TemplateToolbar from "@/components/template-builder/TemplateToolbar";
import BuilderSidebar from "@/components/template-builder/BuilderSidebar";
import BuilderCanvas from "@/components/template-builder/BuilderCanvas";
import BuilderRightPanel from "@/components/template-builder/BuilderRightPanel";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { useEffect } from "react";

export default function CreateTemplatePage() {
  const { currentTemplate, setEditingMode } = useTemplateBuilderStore();

  useEffect(() => {
    if (!currentTemplate.id) {
      const newId = crypto.randomUUID();
      useTemplateBuilderStore.setState({
        currentTemplate: { ...currentTemplate, id: newId },
      });
    }
    setEditingMode(false);
  }, [currentTemplate, setEditingMode]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <BuilderHeader />

      {/* Toolbar */}
      <TemplateToolbar />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Layers / Assets) */}
        <BuilderSidebar />

        {/* Canvas */}
        <BuilderCanvas />

        {/* Right Panel (Inspector / Properties) */}
        <BuilderRightPanel />
      </div>
    </div>
  );
}
