"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import GraphicTools from "./components/GraphicTools";
import GraphicCanvas from "./components/GraphicCanvas";
import GraphicProperties from "./components/GraphicProperties";
import GraphicLayers from "./components/GraphicLayers";
import GraphicTopBar from "./components/GraphicTopBar";

export default function GraphicWorkspace() {
  return (
    <WorkspaceShell
      top={<GraphicTopBar />}
      left={<GraphicTools />}
      canvas={<GraphicCanvas />}
      right={<GraphicProperties />}
      bottom={<GraphicLayers />}
    />
  );
}
