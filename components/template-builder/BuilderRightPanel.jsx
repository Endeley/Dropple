"use client";
import TemplateProperties from "./TemplateProperties";

export default function BuilderRightPanel() {
  return (
    <div className="w-72 border-l bg-white h-full p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <TemplateProperties />
    </div>
  );
}
