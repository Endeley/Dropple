"use client";

import GraphicWorkspace from "@/modes/graphic/Workspace";
import UIUXWorkspace from "@/modes/uiux/Workspace";
import PodcastWorkspace from "@/modes/podcast/Workspace";
import VideoWorkspace from "@/modes/video/Workspace";
import AISuiteWorkspace from "@/modes/ai/Workspace";
import CartoonWorkspace from "@/modes/cartoon/Workspace";
import MaterialWorkspace from "@/modes/material/Workspace";
import DevWorkspace from "@/modes/dev/Workspace";
import BrandingWorkspace from "@/modes/branding/Workspace";
import DocumentsWorkspace from "@/modes/documents/Workspace";
import EducationWorkspace from "@/modes/education/Workspace";
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
