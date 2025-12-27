"use client";

import CanvasHost from "./CanvasHost";

export default function CanvasAudio() {
  return (
    <CanvasHost>
      <div className="absolute w-full h-full p-4">{/* Waveforms rendered here */}</div>
    </CanvasHost>
  );
}
