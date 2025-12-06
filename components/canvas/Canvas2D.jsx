"use client";

import CanvasHost from "./CanvasHost";
import TransformControls from "./TransformControls";

export default function Canvas2D() {
  return (
    <CanvasHost>
      <div className="absolute top-0 left-0 w-full h-full">{/* 2D elements will render here */}</div>
      <TransformControls />
    </CanvasHost>
  );
}
