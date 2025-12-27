"use client";

export default function RightSidebar({ title, children }) {
  return (
    <div className="p-4 space-y-4">
      {title ? <h2 className="text-lg font-semibold text-neutral-300">{title}</h2> : null}
      {children}
    </div>
  );
}
