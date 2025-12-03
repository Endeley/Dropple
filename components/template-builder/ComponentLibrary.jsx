"use client";

import { useEffect, useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function ComponentLibrary() {
  const [components, setComponents] = useState([]);

  useEffect(() => {
    fetchComponents();
  }, []);

  async function fetchComponents() {
    const res = await fetch("/api/components/list", { method: "GET" });
    const data = await res.json();
    setComponents(data.components || []);
  }

  const insertInstance = (component) => {
    useTemplateBuilderStore.getState().addComponentInstance(component);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Components</h3>

      <div className="grid grid-cols-1 gap-2">
        {components.map((comp) => (
          <div
            key={comp._id}
            className="p-2 border rounded cursor-pointer hover:bg-gray-100"
            onClick={() => insertInstance(comp)}
          >
            {comp.name}
          </div>
        ))}
      </div>
    </div>
  );
}
