"use client";

import CanvasHost from "./CanvasHost";

export default function CanvasPreview() {
  return (
    <CanvasHost>
      <div className="absolute inset-0 flex items-center justify-center">
        <div id="preview-container" className="bg-white shadow-xl rounded-lg p-6">
          {/* Render preview */}
        </div>
      </div>
    </CanvasHost>
  );
}
