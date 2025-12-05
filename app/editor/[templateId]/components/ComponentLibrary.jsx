"use client";

import { useEditorStore } from "../hooks/useEditorStore";
import { componentLibrary } from "./library";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ComponentLibrary() {
  const addNode = useEditorStore((s) => s.addNode);
  const remoteComponents = useQuery(api.components.listComponents) || [];
  const components = [...componentLibrary, ...remoteComponents];

  return (
    <div className="w-full bg-white p-4 space-y-4 overflow-y-auto border-b">
      <h2 className="text-sm font-semibold">Component Library</h2>
      {components.map((comp) => (
        <div
          key={comp.id}
          className="p-2 border rounded cursor-pointer hover:bg-gray-100"
          onClick={() => addComponentToCanvas(comp)}
        >
          {comp.preview ? (
            <img src={comp.preview} className="w-full rounded mb-2" alt={comp.name} />
          ) : (
            <div className="w-full h-14 rounded mb-2 bg-gray-100" />
          )}
          <p className="text-xs">{comp.name}</p>
        </div>
      ))}
    </div>
  );

  function addComponentToCanvas(comp) {
    addNode({
      type: "component-node",
      componentId: comp.id,
      overrides: comp.props || {},
      width: comp.width || 200,
      height: comp.height || 60,
      x: 200 + Math.random() * 50,
      y: 200 + Math.random() * 50,
    });
  }
}
