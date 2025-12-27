"use client";

import WorkspaceShell from "@/ui/shell/WorkspaceShell";
import ModeSwitcher from "@/ui/shell/ModeSwitcher";
import LeftSidebar from "@/ui/shell/LeftSidebar";
import RightSidebar from "@/ui/shell/RightSidebar";
import CanvasArea from "@/ui/shell/CanvasArea";
import Canvas2D from "@/ui/canvas/Canvas2D";

export default function DevWorkspace() {
  return (
    <WorkspaceShell
      top={<ModeSwitcher />}
      left={
        <LeftSidebar>
          <div className="text-sm font-semibold text-neutral-300">Dev Tools</div>
          <div className="text-xs text-neutral-500">Code preview, components</div>
        </LeftSidebar>
      }
      canvas={
        <CanvasArea>
          <Canvas2D>
            <div className="text-sm text-neutral-400">Dev Mode Canvas</div>
          </Canvas2D>
        </CanvasArea>
      }
      right={
        <RightSidebar title="Properties">
          <div className="text-xs text-neutral-500">Props & code inspector</div>
        </RightSidebar>
      }
      bottom={null}
    />
  );
}
