"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function SmartGuides() {
  const { activeGuides } = useTemplateBuilderStore();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {activeGuides.map((guide, i) => (
        <div
          key={i}
          className="absolute bg-blue-500/70"
          style={{
            left: guide.x1,
            top: guide.y1,
            width: guide.width,
            height: guide.height,
          }}
        />
      ))}
    </div>
  );
}
