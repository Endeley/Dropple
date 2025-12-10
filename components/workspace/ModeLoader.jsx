"use client";

import GraphicWorkspace from "@/app/workspace/graphic-design/Workspace";
import UIUXWorkspace from "@/app/workspace/uiux/Workspace";
import PodcastWorkspace from "@/app/workspace/podcast/Workspace";
import VideoWorkspace from "@/app/workspace/video/Workspace";
import AISuiteWorkspace from "@/app/workspace/ai-suite/Workspace";
import CartoonWorkspace from "@/app/workspace/cartoon-animation/Workspace";
import MaterialWorkspace from "@/app/workspace/material-ui/Workspace";
import DevWorkspace from "@/app/workspace/dev/Workspace";
import BrandingWorkspace from "@/app/workspace/branding-kit/Workspace";
import DocumentsWorkspace from "@/app/workspace/documents/Workspace";
import EducationWorkspace from "@/app/workspace/education/Workspace";
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
