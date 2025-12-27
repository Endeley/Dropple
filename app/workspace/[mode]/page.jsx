"use client";

import ModeLoader from "@/ui/shell/ModeLoader";
import { use } from "react";

export default function WorkspacePage({ params }) {
  const resolvedParams = use(params);
  return <ModeLoader mode={resolvedParams.mode} />;
}
