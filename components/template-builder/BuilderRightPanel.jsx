"use client";
import InspectorPanel from "./InspectorPanel";

export default function BuilderRightPanel() {
  return (
    <div className="w-72 border-l border-slate-200 bg-white shadow-sm h-full p-4 overflow-auto text-gray-900">
      <InspectorPanel />
    </div>
  );
}
