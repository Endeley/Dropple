"use client";

import { useEffect } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

import BuilderHeader from "@/components/template-builder/BuilderHeader";
import TemplateToolbar from "@/components/template-builder/TemplateToolbar";
import BuilderSidebar from "@/components/template-builder/BuilderSidebar";
import BuilderCanvas from "@/components/template-builder/BuilderCanvas";
import BuilderRightPanel from "@/components/template-builder/BuilderRightPanel";

export default function EditTemplatePage({ params }) {
  const { templateId } = params;

  const {
    loadTemplateFromDB,
    currentTemplate,
    setEditingMode,
  } = useTemplateBuilderStore();

  // Load template once on page mount
  useEffect(() => {
    if (!templateId) return;
    loadTemplateFromDB(templateId);
  }, [templateId, loadTemplateFromDB]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 text-gray-900">
      {/* Header */}
      <BuilderHeader />

      {/* Toolbar */}
      <TemplateToolbar />

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <BuilderSidebar />

        {/* Canvas */}
        <BuilderCanvas />

        {/* Right Inspector Panel */}
        <BuilderRightPanel />
      </div>
    </div>
  );
}
