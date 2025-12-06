"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import LeftSidebar from "@/components/workspace/LeftSidebar";
import RightSidebar from "@/components/workspace/RightSidebar";
import CanvasArea from "@/components/workspace/CanvasArea";
import CanvasVideo from "@/components/canvas/CanvasVideo";

export default function VideoWorkspace() {
  return (
    <WorkspaceShell
      top={<ModeSwitcher />}
      left={
        <LeftSidebar>
          <div className="text-sm font-semibold text-neutral-300">Video Tools</div>
          <div className="text-xs text-neutral-500">Cuts, transitions, LUTs</div>
        </LeftSidebar>
      }
      canvas={
        <CanvasArea>
          <CanvasVideo>
            <div className="text-sm text-neutral-400">Video Editor Canvas</div>
          </CanvasVideo>
        </CanvasArea>
      }
      right={
        <RightSidebar title="Properties">
          <div className="text-xs text-neutral-500">Clip & effect inspector</div>
        </RightSidebar>
      }
      bottom={null}
    />
  );
}
