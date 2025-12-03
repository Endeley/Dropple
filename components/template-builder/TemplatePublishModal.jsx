"use client";

import { useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function TemplatePublishModal({ onClose }) {
  const { publishTemplate, generateThumbnail } = useTemplateBuilderStore();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("UI/UX");
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);

    await generateThumbnail(2);

    await publishTemplate({
      title,
      description: desc,
      price,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      category,
    });

    setLoading(false);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">Publish Template</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Template Name"
          className="w-full border p-2 rounded"
        />

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="w-full border p-2 rounded h-24"
        />

        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option>UI/UX</option>
            <option>Graphic Design</option>
            <option>Branding</option>
            <option>Documents</option>
            <option>Video</option>
            <option>Animation</option>
            <option>Education</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="dashboard, app ui, minimal"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          onClick={handlePublish}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 text-center p-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
