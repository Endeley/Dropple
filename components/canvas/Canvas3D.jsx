"use client";

import CanvasHost from "./CanvasHost";

// Placeholder to avoid requiring @react-three/fiber until installed.
export default function Canvas3D() {
  return (
    <CanvasHost>
      <div className="flex items-center justify-center w-full h-full text-neutral-400">
        3D canvas placeholder (install @react-three/fiber to enable)
      </div>
    </CanvasHost>
  );
}
