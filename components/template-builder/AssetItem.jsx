"use client";

export default function AssetItem() {
  return (
    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-200 rounded" />
      <p className="text-sm">Asset</p>
    </div>
  );
}
