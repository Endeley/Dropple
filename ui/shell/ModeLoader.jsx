"use client";

import GraphicWorkspace from "@/workspaces/graphic/Workspace";
import UIUXWorkspace from "@/workspaces/uiux/Workspace";
import PodcastWorkspace from "@/workspaces/podcast/Workspace";
import VideoWorkspace from "@/workspaces/video/Workspace";
import AISuiteWorkspace from "@/workspaces/ai/Workspace";
import CartoonWorkspace from "@/workspaces/animation/Workspace";
import MaterialWorkspace from "@/workspaces/material/Workspace";
import DevWorkspace from "@/workspaces/dev/Workspace";
import BrandingWorkspace from "@/workspaces/branding/Workspace";
import DocumentsWorkspace from "@/workspaces/documents/Workspace";
import EducationWorkspace from "@/workspaces/education/Workspace";
import BaseModeWorkspace from "./BaseModeWorkspace";

const MODES = {
  graphic: GraphicWorkspace,
  uiux: UIUXWorkspace,
  podcast: PodcastWorkspace,
  video: VideoWorkspace,
  ai: AISuiteWorkspace,
  cartoon: CartoonWorkspace,
  material: MaterialWorkspace,
  dev: DevWorkspace,
  branding: BrandingWorkspace,
  documents: DocumentsWorkspace,
  education: EducationWorkspace,
  // Placeholder until icon mode is implemented.
  icon: () => (
    <BaseModeWorkspace
      modeKey="icon"
      title="Icon Mode"
      subtitle="Icon workspace is coming soon."
    />
  ),
};

export default function ModeLoader({ mode }) {
  const ModeComponent = MODES[mode];
  if (!ModeComponent) {
    return (
      <BaseModeWorkspace
        modeKey="not-found"
        title="Mode Not Found"
        subtitle="Select a valid workspace mode."
      />
    );
  }
  return <ModeComponent />;
}
