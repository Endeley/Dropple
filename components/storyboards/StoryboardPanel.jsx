"use client";

export default function StoryboardPanel({ storyboard }) {
  if (!storyboard?.scenes) return null;

  return (
    <div className="p-4 bg-white border rounded h-96 overflow-auto">
      <p className="font-bold text-lg">AI Storyboard</p>
      {storyboard.scenes.map((s) => (
        <div key={s.id} className="border rounded p-2 mt-3">
          <p className="font-semibold">{s.title}</p>
          <p className="text-xs">{s.description}</p>
          <p className="text-xs mt-1 text-gray-400">
            Duration: {s.duration ?? "—"}s
          </p>
        </div>
      ))}
    </div>
  );
}
