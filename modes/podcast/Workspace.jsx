"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import LeftSidebar from "@/components/workspace/LeftSidebar";
import RightSidebar from "@/components/workspace/RightSidebar";
import CanvasArea from "@/components/workspace/CanvasArea";
import CanvasAudio from "@/components/canvas/CanvasAudio";

export default function PodcastWorkspace() {
  return (
    <WorkspaceShell
      top={<ModeSwitcher />}
      left={
        <LeftSidebar>
          <div className="text-sm font-semibold text-neutral-300">Podcast Tools</div>
          <div className="text-xs text-neutral-500">Waveforms, captions, episode kits</div>
        </LeftSidebar>
      }
      canvas={
        <CanvasArea>
          <CanvasAudio>
            <div className="text-sm text-neutral-400">Podcast / Audiogram Canvas</div>
          </CanvasAudio>
        </CanvasArea>
      }
      right={
        <RightSidebar title="Properties">
          <div className="text-xs text-neutral-500">Audio & artwork inspector</div>
        </RightSidebar>
      }
      bottom={null}
    />
  );
}
