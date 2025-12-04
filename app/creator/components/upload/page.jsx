"use client";

import { useState } from "react";

export default function UploadComponentPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Buttons");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [componentJSON, setComponentJSON] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleUpload() {
    setIsSubmitting(true);
    try {
      await fetch("/api/components/upload", {
        method: "POST",
        body: JSON.stringify({
          title,
          category,
          description,
          tags: tags
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          previewImage,
          componentJSON: componentJSON || localStorage.getItem("CURRENT_COMPONENT_JSON") || "",
          isPremium: false,
        }),
      });
      alert("Component uploaded!");
      setTitle("");
      setDescription("");
      setTags("");
      setPreviewImage("");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload Component</h1>

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

      <select
        className="w-full border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>Buttons</option>
        <option>Cards</option>
        <option>Navigation</option>
        <option>Forms</option>
        <option>UI Kits</option>
        <option>Dashboards</option>
      </select>

      <input
        className="w-full border p-2 rounded"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Preview image URL"
        value={previewImage}
        onChange={(e) => setPreviewImage(e.target.value)}
      />

      <textarea
        className="w-full border p-2 rounded h-24"
        placeholder="Component JSON (optional: falls back to CURRENT_COMPONENT_JSON in localStorage)"
        value={componentJSON}
        onChange={(e) => setComponentJSON(e.target.value)}
      />

      <button
        className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:bg-gray-300"
        onClick={handleUpload}
        disabled={isSubmitting || !title}
      >
        {isSubmitting ? "Uploading..." : "Upload Component"}
      </button>
    </div>
  );
}
