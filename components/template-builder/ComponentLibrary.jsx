"use client";

import { useCallback, useEffect, useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function ComponentLibrary() {
  const [components, setComponents] = useState([]);
  const { setComponents: setComponentsInStore } = useTemplateBuilderStore();

  const fetchComponents = useCallback(async () => {
    const res = await fetch("/api/components/list", { method: "GET" });
    const data = await res.json();
    const list = data.components || [];
    setComponents(list);
    setComponentsInStore(list);
  }, [setComponentsInStore]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetch("/api/components/list", { method: "GET" });
      const data = await res.json();
      const list = data.components || [];
      if (mounted) {
        setComponents(list);
        setComponentsInStore(list);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [setComponentsInStore]);

  const insertInstance = (component, variantId = null) => {
    useTemplateBuilderStore.getState().addComponentInstance(component, variantId);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Components</h3>

      <div className="grid grid-cols-1 gap-3">
        {components.map((comp) => (
          <div key={comp._id} className="space-y-2 rounded border p-2">
            <div className="font-medium">{comp.name}</div>

            {comp.variants?.length ? (
              <div className="flex flex-wrap gap-2">
                {comp.variants.map((v) => (
                  <div
                    key={v.id}
                    className="border px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => insertInstance(comp, v.id)}
                  >
                    {v.name}
                  </div>
                ))}
              </div>
            ) : null}

            <div
              className="border px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => insertInstance(comp, null)}
            >
              Default
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
