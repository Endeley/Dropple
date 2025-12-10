"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import LeftSidebar from "@/components/workspace/LeftSidebar";
import RightSidebar from "@/components/workspace/RightSidebar";
import CanvasArea from "@/components/workspace/CanvasArea";
import Canvas2D from "@/components/canvas/Canvas2D";

export default function BrandingWorkspace() {
  return (
    <WorkspaceShell
      top={<ModeSwitcher />}
      left={
        <LeftSidebar>
          <div className="text-sm font-semibold text-neutral-300">Branding Tools</div>
          <div className="text-xs text-neutral-500">Logos, tokens, assets</div>
        </LeftSidebar>
      }
      canvas={
        <CanvasArea>
          <Canvas2D>
            <div className="text-sm text-neutral-400">Branding Canvas</div>
          </Canvas2D>
        </CanvasArea>
      }
      right={
        <RightSidebar title="Properties">
          <div className="text-xs text-neutral-500">Brand kit inspector</div>
        </RightSidebar>
      }
      bottom={null}
    />
  );
}
