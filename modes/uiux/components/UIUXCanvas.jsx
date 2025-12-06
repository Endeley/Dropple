"use client";

import CanvasHost from "@/components/canvas/CanvasHost";

export default function UIUXCanvas() {
  return (
    <CanvasHost enablePanZoom nodeMap={{}}>
      <div className="w-full h-full flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
        <div
          className="bg-white rounded-xl shadow-2xl relative"
          style={{
            width: "400px",
            height: "800px",
          }}
        >
          {/* UI nodes will go here */}
        </div>
      </div>
    </CanvasHost>
  );
}
