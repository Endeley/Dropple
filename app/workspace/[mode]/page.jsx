"use client";

import ModeLoader from "@/components/workspace/ModeLoader";

export default function WorkspacePage({ params }) {
  return <ModeLoader mode={params.mode} />;
}
