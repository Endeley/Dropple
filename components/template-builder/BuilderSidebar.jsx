"use client";
import LayerItem from "./LayerItem";
import AssetItem from "./AssetItem";

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
        <LayerItem />
        <LayerItem />
        <LayerItem />
      </div>
    </div>
  );
}
