"use client";

import { useState } from "react";

export default function UploadAssetPage() {
  const [type, setType] = useState("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [fileMeta, setFileMeta] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFileUpload(file) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/assets/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setFileMeta(data);
  }

  async function handleSubmit() {
    if (!fileMeta) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/asset-library/create", {
        method: "POST",
        body: JSON.stringify({
          type,
          title,
          description,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          fileUrl: fileMeta.url || fileMeta.fileUrl,
          previewUrl: fileMeta.url || fileMeta.previewUrl,
          fileType: fileMeta.type || fileMeta.fileType,
          size: fileMeta.size,
          width: fileMeta.width,
          height: fileMeta.height,
          isPremium: false,
          price: 0,
        }),
      });
      alert("Asset uploaded!");
      setTitle("");
      setDescription("");
      setTags("");
      setFileMeta(null);
    } catch (err) {
      console.error("Failed to create asset", err);
      alert("Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload Asset</h1>

      <select
        className="w-full border p-2 rounded"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="image">Image</option>
        <option value="icon">Icon</option>
        <option value="svg">SVG</option>
        <option value="illustration">Illustration</option>
        <option value="3d">3D Model</option>
        <option value="texture">Texture</option>
        <option value="lottie">Lottie</option>
      </select>

      <input
        className="w-full border p-2 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2 rounded h-20"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <input
        type="file"
        className="w-full border p-2 rounded"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {fileMeta && (
        <div className="text-xs text-gray-600">
          <div>File: {fileMeta.url || fileMeta.fileUrl}</div>
          <div>Size: {Math.round((fileMeta.size || 0) / 1024)} KB</div>
        </div>
      )}

      <button
        className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:bg-gray-300"
        onClick={handleSubmit}
        disabled={isSubmitting || !title || !fileMeta}
      >
        {isSubmitting ? "Uploading..." : "Publish Asset"}
      </button>
    </div>
  );
}
