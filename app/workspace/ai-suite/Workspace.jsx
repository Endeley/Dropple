"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import LeftSidebar from "@/components/workspace/LeftSidebar";
import RightSidebar from "@/components/workspace/RightSidebar";
import CanvasArea from "@/components/workspace/CanvasArea";
import Canvas2D from "@/components/canvas/Canvas2D";

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
