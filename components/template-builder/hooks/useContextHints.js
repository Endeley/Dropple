"use client";

import { useMemo } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

const hasCTA = (layers = []) =>
  layers.some(
    (l) =>
      l.type === "text" &&
      typeof l.content === "string" &&
      /cta|call to action|get started|sign up|buy now/i.test(l.content || ""),
  );

const findFooter = (layers = [], canvasHeight = 1200) =>
  layers.find(
    (l) =>
      (l.name && /footer/i.test(l.name)) ||
      (l.y || 0) > canvasHeight * 0.65,
  );

const findNav = (layers = []) => layers.find((l) => l.name && /nav|navbar|header/i.test(l.name));

const findTwoCardRow = (layers = []) => {
  return layers.find((l) => {
    const children = l.children || [];
    if (children.length === 2) return true;
    return false;
  });
};

export function useContextHints() {
  const { currentTemplate, selectedLayers } = useTemplateBuilderStore();
  const layers = currentTemplate.layers || [];

  const hints = useMemo(() => {
    const results = [];
    const canvasHeight = currentTemplate.height || 1200;

    if (!hasCTA(layers)) {
      results.push("Add a clear CTA (e.g., Get Started) to guide users.");
    }

    if (!findNav(layers)) {
      results.push("Add a navigation/header to improve discoverability.");
    }

    if (!findFooter(layers, canvasHeight)) {
      results.push("Add a footer with links/social/legal for completeness.");
    }

    const twoCardParent = findTwoCardRow(layers);
    if (twoCardParent) {
      results.push("Grid has 2 items — consider adding a third for balance.");
    }

    if (selectedLayers?.length) {
      const selected = layers.find((l) => l.id === selectedLayers[0]);
      if (selected && selected.type === "text" && (selected.content || "").length < 12) {
        results.push("Selected text is short — add supporting copy for clarity.");
      }
      if (selected && selected.autoLayout?.enabled && (selected.autoLayout.gap || 0) < 8) {
        results.push("Increase spacing in this auto-layout group for readability.");
      }
    }

    return results;
  }, [layers, currentTemplate.height, selectedLayers]);

  return hints;
}

