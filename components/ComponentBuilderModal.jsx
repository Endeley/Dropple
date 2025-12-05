"use client";

import { useState, useMemo } from "react";
import { useEditorStore } from "@/app/editor/[templateId]/hooks/useEditorStore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ComponentBuilderModal({ isOpen, onClose }) {
  const selectedIds = useEditorStore((s) => s.selectedNodeIds);
  const nodes = useEditorStore((s) => s.nodes);
  const createComponent = useMutation(api.components.createComponent);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("button");

  const selectedNodes = useMemo(
    () => nodes.filter((n) => selectedIds.includes(n.id)),
    [nodes, selectedIds],
  );

  if (!isOpen) return null;

  async function handleCreate() {
    if (selectedNodes.length === 0) return;
    await createComponent({
      name: name || "Component",
      category,
      authorId: "demo-user",
      tags: [],
      nodes: selectedNodes,
      props: extractProps(selectedNodes),
    });
    onClose?.();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded shadow-lg space-y-4">
        <h2 className="text-lg font-semibold">Create Component</h2>
        <input
          type="text"
          placeholder="Component Name"
          className="border w-full p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border w-full p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="button">Button</option>
          <option value="card">Card</option>
          <option value="hero">Hero Section</option>
          <option value="navbar">Navbar</option>
          <option value="form">Form</option>
        </select>

        <div className="text-xs p-2 bg-gray-50 border rounded max-h-32 overflow-auto whitespace-pre-wrap">
          {JSON.stringify(selectedNodes, null, 2)}
        </div>

        <button className="w-full bg-blue-600 text-white p-2 rounded" onClick={handleCreate}>
          Save Component
        </button>
        <button className="w-full mt-2 text-gray-500" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function extractProps(nodes) {
  return {
    text: nodes.find((n) => n.type === "text")?.content ?? "",
    background:
      nodes.find((n) => n.fill)?.fill ||
      nodes.find((n) => n.type === "shape")?.fill ||
      "#fff",
  };
}
