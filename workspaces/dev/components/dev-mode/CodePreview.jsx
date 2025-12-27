"use client";

export default function CodePreview({ files = {} }) {
  const entries = Object.entries(files);
  if (!entries.length) {
    return (
      <div className="bg-white border rounded p-4 text-sm text-gray-500">
        No code generated yet.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4 h-96 overflow-auto space-y-4">
      <p className="font-semibold text-lg">AI Code Preview</p>
      {entries.map(([path, content]) => (
        <div key={path} className="border rounded p-3">
          <p className="font-semibold text-sm mb-2">{path}</p>
          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded border">
            {content}
          </pre>
        </div>
      ))}
    </div>
  );
}
