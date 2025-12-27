"use client";

export default function CanvasRulers() {
  return (
    <>
      <div className="pointer-events-none select-none absolute top-0 left-0 right-0 h-6 bg-violet-50 border-b border-violet-200 text-[10px] text-violet-700 flex items-center px-2">
        Ruler X
      </div>
      <div className="pointer-events-none select-none absolute top-0 bottom-0 left-0 w-6 bg-violet-50 border-r border-violet-200 text-[10px] text-violet-700 flex items-center justify-center">
        Ruler Y
      </div>
    </>
  );
}
