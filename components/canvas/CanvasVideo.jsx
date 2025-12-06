"use client";

import CanvasHost from "./CanvasHost";

export default function CanvasVideo() {
  return (
    <CanvasHost>
      <video id="dropple-video-preview" className="absolute" controls={false} />
    </CanvasHost>
  );
}
