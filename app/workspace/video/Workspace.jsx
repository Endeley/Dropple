"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import VideoTools from "./components/VideoTools";
import VideoCanvas from "./components/VideoCanvas";
import VideoInspector from "./components/VideoInspector";
import VideoTimeline from "./components/VideoTimeline";
import VideoTopBar from "./components/VideoTopBar";

export default function VideoWorkspace() {
  return (
    <WorkspaceShell
      top={<VideoTopBar />}
      left={<VideoTools />}
      canvas={<VideoCanvas />}
      right={<VideoInspector />}
      bottom={<VideoTimeline />}
    />
  );
}
