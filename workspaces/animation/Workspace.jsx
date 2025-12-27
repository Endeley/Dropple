"use client";

import WorkspaceShell from "@/ui/shell/WorkspaceShell";
import ModeSwitcher from "@/ui/shell/ModeSwitcher";
import LeftSidebar from "@/ui/shell/LeftSidebar";
import RightSidebar from "@/ui/shell/RightSidebar";
import CanvasArea from "@/ui/shell/CanvasArea";
import Canvas3D from "@/ui/canvas/Canvas3D";

export default function CartoonWorkspace() {
  return (
    <WorkspaceShell
      top={<ModeSwitcher />}
      left={
        <LeftSidebar>
          <div className="text-sm font-semibold text-neutral-300">Animation Tools</div>
          <div className="text-xs text-neutral-500">Rigging, timeline, camera</div>
        </LeftSidebar>
      }
      canvas={
        <CanvasArea>
          <Canvas3D>
            <div className="text-sm text-neutral-400">Cartoon / Animation Canvas</div>
          </Canvas3D>
        </CanvasArea>
      }
      right={
        <RightSidebar title="Properties">
          <div className="text-xs text-neutral-500">Rig & timeline inspector</div>
        </RightSidebar>
      }
      bottom={null}
    />
  );
}
