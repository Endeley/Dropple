"use client";

export default function TemplatePublishModal() {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white w-96 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Publish Template</h2>

        <input className="w-full border p-2 rounded" placeholder="Template Title" />
        <input className="w-full border p-2 rounded" placeholder="Tags (comma separated)" />
        
        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Publish to Marketplace
        </button>
      </div>
    </div>
  );
}
