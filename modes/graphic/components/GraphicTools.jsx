"use client";

import { useRef } from "react";
import { useToolStore } from "@/zustand/toolStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";

export default function GraphicTools() {
  const { tool, setTool } = useToolStore();
  const addNode = useNodeTreeStore((s) => s.addNode);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const fileRef = useRef(null);

  const set = (t) => setTool(t);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const id = crypto.randomUUID();
      addNode({
        id,
        type: "image",
        name: file.name,
        x: 100,
        y: 100,
        width: img.width / 2,
        height: img.height / 2,
        src: url,
        rotation: 0,
        parent: null,
        children: [],
      });
      setSelectedManual([id]);
      setTool("select");
    };
    img.src = url;
  };

  const buttonClass = (id) =>
    `w-full px-3 py-2 text-left rounded text-sm transition ${
      tool === id ? "bg-neutral-800 text-white" : "hover:bg-neutral-800 text-neutral-200"
    }`;

  return (
    <div className="p-4 space-y-2">
      <div className="text-sm font-semibold text-neutral-300">Tools</div>
      <button className={buttonClass("select")} onClick={() => set("select")}>
        Select
      </button>
      <button className={buttonClass("rectangle")} onClick={() => set("rectangle")}>
        Rectangle
      </button>
      <button className={buttonClass("text")} onClick={() => set("text")}>
        Text
      </button>
      <button className={buttonClass("image")} onClick={() => fileRef.current?.click()}>
        Image
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
    </div>
  );
}
