"use client";

import WorkspaceShell from "./WorkspaceShell";
import ModeSwitcher from "./ModeSwitcher";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import CanvasArea from "./CanvasArea";
import ModeBottomPanel from "./ModeBottomPanel";
import Canvas2D from "../canvas/Canvas2D";

export default function BaseModeWorkspace({ modeKey, title, subtitle }) {
  const top = <ModeSwitcher />;
  const left = (
    <LeftSidebar>
      <div className="text-sm text-neutral-300 font-semibold">Tools</div>
      <div className="text-xs text-neutral-500">Customize per mode</div>
    </LeftSidebar>
  );
  const canvas = (
    <CanvasArea>
      <Canvas2D>
        <div className="text-sm text-neutral-400">Canvas placeholder for {modeKey}</div>
      </Canvas2D>
    </CanvasArea>
  );
  const right = (
    <RightSidebar title={title || "Workspace"}>
      <div className="text-xs text-neutral-500">{subtitle || "Inspector placeholder"}</div>
    </RightSidebar>
  );
  const bottom = <ModeBottomPanel modeKey={modeKey} />;

  return <WorkspaceShell top={top} left={left} canvas={canvas} right={right} bottom={bottom} />;
}
