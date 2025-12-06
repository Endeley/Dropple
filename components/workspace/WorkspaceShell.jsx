"use client";

import KeyboardShortcuts from "@/components/keyboard/KeyboardShortcuts";

export default function WorkspaceShell({ top, left, canvas, right, bottom }) {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#f5f7fa] text-neutral-900">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-400" />
      {/* Top Bar */}
      <div className="h-12 border-b border-neutral-200 bg-white flex items-center overflow-hidden">
        {top}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-60 min-w-[240px] border-r border-neutral-200 bg-[#f8f9fb] overflow-y-auto">
          {left}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#f1f3f6] relative overflow-hidden">
          <KeyboardShortcuts />
          {canvas}
        </div>

        {/* Right Sidebar */}
        <div className="w-72 min-w-[280px] border-l border-neutral-200 bg-[#f8f9fb] overflow-y-auto">
          {right}
        </div>
      </div>

      {/* Bottom Panel */}
      {bottom && (
        <div className="h-48 border-t border-neutral-200 bg-[#f8f9fb] overflow-hidden">
          {bottom}
        </div>
      )}
    </div>
  );
}
