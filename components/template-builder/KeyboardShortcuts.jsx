"use client";

import { useEffect } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function KeyboardShortcuts() {
  const {
    selectedLayers,
    copyLayers,
    pasteLayers,
    duplicateSelection,
    copyStyle,
    pasteStyle,
  } = useTemplateBuilderStore();

  useEffect(() => {
    const handle = (e) => {
      // Copy
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        if (e.altKey && selectedLayers?.length) {
          copyStyle(selectedLayers[0]);
        } else {
          copyLayers(selectedLayers || []);
        }
        e.preventDefault();
      }

      // Paste
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        if (e.altKey) {
          pasteStyle(selectedLayers || []);
        } else {
          pasteLayers();
        }
        e.preventDefault();
      }

      // Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        duplicateSelection();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [
    copyLayers,
    copyStyle,
    duplicateSelection,
    pasteLayers,
    pasteStyle,
    selectedLayers,
  ]);

  return null;
}
