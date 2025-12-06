"use client";

import { Canvas } from "@react-three/fiber";
import CanvasHost from "./CanvasHost";

export default function Canvas3D() {
  return (
    <CanvasHost>
      <Canvas camera={{ position: [0, 0, 5] }}>{/* 3D scene here */}</Canvas>
    </CanvasHost>
  );
}
