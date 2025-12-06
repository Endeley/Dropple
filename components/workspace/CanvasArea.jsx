"use client";

export default function CanvasArea({ children, onDropAsset }) {
  return (
    <div
      className="w-full h-full relative flex items-center justify-center overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("asset");
        if (data && onDropAsset) {
          try {
            const asset = JSON.parse(data);
            onDropAsset(asset);
          } catch (err) {
            // ignore malformed
          }
        }
      }}
    >
      {children}
    </div>
  );
}
