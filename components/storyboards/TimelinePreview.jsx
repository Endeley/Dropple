"use client";

export default function TimelinePreview({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="p-4 bg-white border rounded h-40 overflow-auto">
      <p className="font-semibold text-sm">Timeline Preview</p>
      {timeline.map((scene) => (
        <div key={scene.sceneId} className="mt-2">
          <p className="text-xs font-semibold">{scene.sceneId}</p>
          <div className="flex gap-2 mt-1 text-[10px] flex-wrap">
            {(scene.animations || []).map((anim, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded bg-purple-100 text-purple-700 border border-purple-200"
              >
                {anim.type} ({anim.duration ?? "?"}s)
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
