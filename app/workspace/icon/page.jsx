"use client";
import ModeLoader from "@/components/workspace/ModeLoader";
import BaseModeWorkspace from "@/components/workspace/BaseModeWorkspace";

export default function IconWorkspacePage() {
  // Icon mode not wired yet; show placeholder via BaseModeWorkspace.
  return <ModeLoader mode="icon" />;
}
