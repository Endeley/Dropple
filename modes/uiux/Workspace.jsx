"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import UIUXTools from "./components/UIUXTools";
import UIUXCanvas from "./components/UIUXCanvas";
import UIUXProperties from "./components/UIUXProperties";
import UIUXTopBar from "./components/UIUXTopBar";
import UIUXBottomBar from "./components/UIUXBottomBar";

export default function UIUXWorkspace() {
  return (
    <WorkspaceShell
      top={<UIUXTopBar />}
      left={<UIUXTools />}
      canvas={<UIUXCanvas />}
      right={<UIUXProperties />}
      bottom={<UIUXBottomBar />}
    />
  );
}
