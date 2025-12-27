"use client";

import WorkspaceShell from "@/ui/shell/WorkspaceShell";
import ModeSwitcher from "@/ui/shell/ModeSwitcher";
import LeftSidebar from "@/ui/shell/LeftSidebar";
import RightSidebar from "@/ui/shell/RightSidebar";
import CanvasArea from "@/ui/shell/CanvasArea";
import Canvas2D from "@/ui/canvas/Canvas2D";

export default function AISuiteWorkspace() {
  return (
    <WorkspaceShell
      top={<ModeSwitcher />}
      left={
        <LeftSidebar>
          <div className="text-sm font-semibold text-neutral-300">AI Tools</div>
          <div className="text-xs text-neutral-500">Generate, upscale, edit</div>
        </LeftSidebar>
      }
      canvas={
        <CanvasArea>
          <Canvas2D>
            <div className="text-sm text-neutral-400">AI Suite Canvas</div>
          </Canvas2D>
        </CanvasArea>
      }
      right={
        <RightSidebar title="Properties">
          <div className="text-xs text-neutral-500">Prompt & output inspector</div>
        </RightSidebar>
      }
      bottom={null}
    />
  );
}
