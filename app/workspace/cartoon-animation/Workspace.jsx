"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import LeftSidebar from "@/components/workspace/LeftSidebar";
import RightSidebar from "@/components/workspace/RightSidebar";
import CanvasArea from "@/components/workspace/CanvasArea";
import Canvas3D from "@/components/canvas/Canvas3D";

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
