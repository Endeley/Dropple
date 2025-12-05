"use client";

import { useEditorStore } from "../hooks/useEditorStore";
import { nodeDefaults } from "../utils/nodeDefaults";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import dynamic from "next/dynamic";
const ComponentBuilderModal = dynamic(() => import("@/components/ComponentBuilderModal"), { ssr: false });

export default function Toolbar({ templateId }) {
  const { addNode, exportTemplate, wrapSelectedInAutoLayout } = useEditorStore();
  const saveTemplate = useMutation(api.templates.saveTemplate);
  const publishTemplate = useMutation(api.templates.publishTemplate);
  const [showComponentModal, setShowComponentModal] = useState(false);

  async function handleSave() {
    const data = exportTemplate();
    await saveTemplate({
      id: templateId,
      name: data.name || "Untitled Template",
      category: data.category || "graphic",
      tags: data.tags || [],
      authorId: "demo-user",
      templateData: data,
      mode: data.mode || "graphic",
    });
  }

  async function handlePublish() {
    if (!templateId) return;
    await publishTemplate({ id: templateId });
  }

  return (
    <div className="w-full border-b bg-white px-4 py-2 flex gap-2 text-sm items-center">
      <button
        className="px-3 py-1 rounded border hover:bg-gray-100"
        onClick={() => addNode(nodeDefaults.text())}
      >
        Text
      </button>
      <button
        className="px-3 py-1 rounded border hover:bg-gray-100"
        onClick={() => addNode(nodeDefaults.image())}
      >
        Image
      </button>
      <button
        className="px-3 py-1 rounded border hover:bg-gray-100"
        onClick={() => addNode(nodeDefaults.shape("rectangle"))}
      >
        Rectangle
      </button>
      <button
        className="px-3 py-1 rounded border hover:bg-gray-100"
        onClick={() => addNode(nodeDefaults.shape("circle"))}
      >
        Circle
      </button>
      <button
        className="px-3 py-1 rounded border hover:bg-gray-100"
        onClick={() => addNode(nodeDefaults.frame())}
      >
        + Frame (Auto Layout)
      </button>
      <button
        className="px-3 py-1 rounded border hover:bg-gray-100 bg-purple-100 text-purple-800"
        onClick={() => wrapSelectedInAutoLayout()}
      >
        Auto Layout (Shift + A)
      </button>
      <button
        className="px-3 py-1 rounded border hover:bg-gray-100 bg-orange-100 text-orange-800"
        onClick={() => setShowComponentModal(true)}
      >
        Create Component
      </button>

      <div className="flex-1" />

      <button onClick={handleSave} className="px-3 py-1 rounded bg-blue-600 text-white">
        Save Template
      </button>
      <button onClick={handlePublish} className="px-3 py-1 rounded bg-green-600 text-white">
        Publish
      </button>

      {showComponentModal && <ComponentBuilderModal isOpen={showComponentModal} onClose={() => setShowComponentModal(false)} />}
    </div>
  );
}
