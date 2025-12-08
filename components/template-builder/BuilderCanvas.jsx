"use client";

import { useRef } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import CanvasLayer from "./CanvasLayer";
import SmartGuides from "./SmartGuides";
import MarqueeSelect from "./MarqueeSelect";
import ComponentEditorCanvas from "./ComponentEditorCanvas";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ExportCodeModal from "./ExportCodeModal";
import PageSwitcher from "./PageSwitcher";
import PrototypeConnections from "./PrototypeConnections";
import DevicePreviewBar from "./DevicePreviewBar";
import MultiplayerCursors from "./MultiplayerCursors";
import { useTimelinePlayer } from "@/zustand/useTimelinePlayer";

export default function BuilderCanvas() {
  const { currentTemplate, isEditingComponent, addLayer } = useTemplateBuilderStore();
  const containerRef = useRef(null);
  useTimelinePlayer();

  if (isEditingComponent) {
    return (
      <>
        <KeyboardShortcuts />
        <ExportCodeModal />
        <ComponentEditorCanvas />
      </>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 bg-slate-100 flex items-center justify-center overflow-auto relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const assetUrl = e.dataTransfer.getData("asset-url");
          if (assetUrl) {
            const width = Number(e.dataTransfer.getData("asset-width")) || 300;
            const height = Number(e.dataTransfer.getData("asset-height")) || 200;
            addLayer({
              id: "img_" + crypto.randomUUID(),
              type: "image",
              url: assetUrl,
              x: e.clientX - 150,
              y: e.clientY - 100,
              width,
              height,
              props: {},
            });
            return;
          }
          const file = e.dataTransfer.files?.[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/assets/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data?.url) {
            useTemplateBuilderStore.getState().addImageLayer(data.url);
          }
        }}
      >
        <KeyboardShortcuts />
        <ExportCodeModal />
        <div className="absolute left-4 bottom-4 z-10">
          <DevicePreviewBar />
          <div className="mt-2">
            <PageSwitcher />
          </div>
        </div>
        <div
          id="dropple-canvas"
          className="relative rounded-md border border-slate-200 shadow-lg"
          style={{
            width: currentTemplate.width,
            height: currentTemplate.height,
            backgroundImage:
              "linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(180deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundColor: "#f8fafc",
          }}
        >
          <MultiplayerCursors />
          {currentTemplate.layers
            .filter((layer) => !layer.parentId)
            .map((layer) => (
              <CanvasLayer key={layer.id} layer={layer} offset={{ x: 0, y: 0 }} />
            ))}
          <SmartGuides />
          <PrototypeConnections layers={currentTemplate.layers} />
        </div>
        <MarqueeSelect containerRef={containerRef} layers={currentTemplate.layers} />
      </div>
    </>
  );
}
