"use client";

import { useState } from "react";
import TemplatePublishModal from "./TemplatePublishModal";

export default function BuilderHeader() {
  const [showPublish, setShowPublish] = useState(false);

  return (
    <>
      <div className="h-14 w-full border-b border-slate-200 bg-white/95 backdrop-blur flex items-center justify-between px-4 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Untitled Template</h1>

          <button className="px-3 py-1 text-sm rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100">
            Rename
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100">
            Save
          </button>

          <button
            onClick={() => setShowPublish(true)}
            className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow"
          >
            Publish
          </button>
        </div>
      </div>

      {showPublish && <TemplatePublishModal onClose={() => setShowPublish(false)} />}
    </>
  );
}
