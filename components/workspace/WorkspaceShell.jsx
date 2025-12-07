"use client";

import KeyboardShortcuts from "@/components/keyboard/KeyboardShortcuts";

export default function WorkspaceShell({ top, left, canvas, right, bottom }) {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#f3f4f6] text-neutral-900">
      <div className="h-1 bg-violet-500/90" />
      {/* Top Bar */}
      <div className="h-12 border-b border-neutral-200 bg-white/90 backdrop-blur flex items-center overflow-hidden shadow-sm">
        {top}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-60 min-w-[240px] border-r border-neutral-200 bg-white overflow-y-auto">
          {left}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#eef0f3] relative overflow-hidden">
          <KeyboardShortcuts />
          {canvas}
        </div>

        {/* Right Sidebar */}
        <div className="w-72 min-w-[280px] border-l border-neutral-200 bg-white overflow-y-auto">
          {right}
        </div>
      </div>

      {/* Bottom Panel */}
      {bottom && (
        <div className="h-16 border-t border-neutral-200 bg-white/95 backdrop-blur-sm shadow-sm">
          {bottom}
        </div>
      )}
    </div>
  );
}
