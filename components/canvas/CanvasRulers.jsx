"use client";

export default function CanvasRulers() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-6 bg-neutral-950 border-b border-neutral-800 text-[10px] text-neutral-500 flex items-center px-2">
        Ruler X
      </div>
      <div className="absolute top-0 bottom-0 left-0 w-6 bg-neutral-950 border-r border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-center">
        Ruler Y
      </div>
    </>
  );
}
