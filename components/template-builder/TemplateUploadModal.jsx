"use client";

export default function TemplateUploadModal() {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white w-96 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Upload Thumbnail</h2>
        <input type="file" className="w-full border p-2 rounded" />
        <button className="w-full mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Upload
        </button>
      </div>
    </div>
  );
}
