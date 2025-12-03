"use client";

export default function TemplatePreviewCard() {
  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition">
      <div className="h-40 bg-gray-200"></div>
      <div className="p-4">
        <p className="font-medium">Template Name</p>
        <p className="text-sm text-gray-500">UI/UX</p>
      </div>
    </div>
  );
}
