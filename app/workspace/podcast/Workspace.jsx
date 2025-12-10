"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import PodcastTools from "./components/PodcastTools";
import PodcastCanvas from "./components/PodcastCanvas";
import PodcastInspector from "./components/PodcastInspector";
import PodcastTimeline from "./components/PodcastTimeline";
import PodcastTopBar from "./components/PodcastTopBar";

export default function PodcastWorkspace() {
  return (
    <WorkspaceShell
      top={<PodcastTopBar />}
      left={<PodcastTools />}
      canvas={<PodcastCanvas />}
      right={<PodcastInspector />}
      bottom={<PodcastTimeline />}
    />
  );
}
