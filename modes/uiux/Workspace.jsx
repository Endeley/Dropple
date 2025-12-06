"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import UIUXTools from "./components/UIUXTools";
import UIUXCanvas from "./components/UIUXCanvas";
import UIUXProperties from "./components/UIUXProperties";
import UIUXPrototypePanel from "./components/UIUXPrototypePanel";

export default function UIUXWorkspace() {
  return (
    <WorkspaceShell
      top={<ModeSwitcher />}
      left={<UIUXTools />}
      canvas={<UIUXCanvas />}
      right={<UIUXProperties />}
      bottom={<UIUXPrototypePanel />}
    />
  );
}
