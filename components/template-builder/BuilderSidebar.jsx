"use client";
import LayerItem from "./LayerItem";
import AssetItem from "./AssetItem";
import AssetLibrary from "./AssetLibrary";
import ComponentLibrary from "./ComponentLibrary";

export default function BuilderSidebar() {
  return (
    <div className="w-64 h-full border-r bg-white flex flex-col">
      {/* Tabs */}
      <div className="flex">
        <button className="w-1/2 py-2 border-b text-center hover:bg-gray-50">
          Layers
        </button>
        <button className="w-1/2 py-2 border-b text-center hover:bg-gray-50">
          Assets
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Layers</p>
          <div className="mt-2 space-y-2">
            <LayerItem />
            <LayerItem />
            <LayerItem />
          </div>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">Upload Image</span>
            <input
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);

                await fetch("/api/assets/upload", {
                  method: "POST",
                  body: formData,
                });
              }}
            />
          </label>
          <AssetLibrary />
          <ComponentLibrary />
        </div>
      </div>
    </div>
  );
}
