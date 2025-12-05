"use client";

export default function ComponentDocsPanel({ docs = {} }) {
  const entries = Object.entries(docs);
  if (!entries.length) return null;

  return (
    <div className="bg-white border rounded p-4 h-96 overflow-auto space-y-3">
      <p className="font-semibold text-lg">Component Docs</p>
      {entries.map(([name, content]) => (
        <div key={name} className="border rounded p-2">
          <p className="font-semibold text-sm mb-1">{name}</p>
          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded border">
            {content}
          </pre>
        </div>
      ))}
    </div>
  );
}
