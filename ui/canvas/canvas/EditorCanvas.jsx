"use client";

import { useWorkspaceStore } from "@/runtime/stores/useWorkspaceStore";
import { useWorkspaceSync } from "@/runtime/sync/useWorkspaceSync";
import { usePresenceStore } from "@/runtime/stores/usePresenceStore";
import CursorsOverlay from "@/components/collaboration/CursorsOverlay";
import RenderLayer from "./RenderLayer";

export default function EditorCanvas({ projectId }) {
  useWorkspaceSync();
  const workspace = useWorkspaceStore((s) => s.workspace);
  const cursors = usePresenceStore((s) => s.cursors);

  const page = workspace?.pages?.[0];
  if (!page) return <div className="p-4 text-sm text-gray-500">No page</div>;

  return (
    <div className="relative w-full h-full bg-white">
      {page.layers?.map((layer) => (
        <RenderLayer key={layer.id} layer={layer} />
      ))}
      <CursorsOverlay projectId={projectId} />
      {Object.entries(cursors).map(([id, pos]) => (
        <div
          key={id}
          className="absolute pointer-events-none"
          style={{ top: pos.y, left: pos.x }}
        >
          <div className="px-2 py-1 bg-black text-white text-xs rounded shadow">
            {id}
          </div>
        </div>
      ))}
    </div>
  );
}
