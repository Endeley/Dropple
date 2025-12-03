"use client";

export default function TemplatePreviewCard({ template = {} }) {
  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition">
      <div className="w-full h-40 bg-gray-100 overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt="Template preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="p-4">
        <p className="font-medium">{template.name || "Template Name"}</p>
        <p className="text-sm text-gray-500">{template.mode || "UI/UX"}</p>
      </div>
    </div>
  );
}
