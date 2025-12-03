"use client";
import InspectorPanel from "./InspectorPanel";

export default function BuilderRightPanel() {
  return (
    <div className="w-72 border-l bg-white h-full p-4 overflow-auto">
      <InspectorPanel />
    </div>
  );
}
