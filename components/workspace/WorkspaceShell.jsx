"use client";

export default function WorkspaceShell({ top, left, canvas, right, bottom }) {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#0f0f0f] text-white">
      {/* Top Bar */}
      <div className="h-12 border-b border-neutral-800 bg-[#1a1a1a] flex items-center overflow-hidden">
        {top}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-60 min-w-[240px] border-r border-neutral-800 bg-[#111] overflow-y-auto">
          {left}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#0f0f0f] relative overflow-hidden">{canvas}</div>

        {/* Right Sidebar */}
        <div className="w-72 min-w-[280px] border-l border-neutral-800 bg-[#111] overflow-y-auto">
          {right}
        </div>
      </div>

      {/* Bottom Panel */}
      {bottom && (
        <div className="h-48 border-t border-neutral-800 bg-[#111] overflow-hidden">
          {bottom}
        </div>
      )}
    </div>
  );
}
