"use client";

export default function TemplateProperties() {
  return (
    <div className="space-y-4">
      {/* Position */}
      <div>
        <h3 className="font-medium mb-2">Position</h3>
        <div className="grid grid-cols-2 gap-2">
          <input className="border p-2 rounded" placeholder="X" />
          <input className="border p-2 rounded" placeholder="Y" />
          <input className="border p-2 rounded" placeholder="W" />
          <input className="border p-2 rounded" placeholder="H" />
        </div>
      </div>

      {/* Fill */}
      <div>
        <h3 className="font-medium mb-2">Fill</h3>
        <input type="color" className="w-full h-10 border rounded" />
      </div>

      {/* Text */}
      <div>
        <h3 className="font-medium mb-2">Typography</h3>
        <input className="w-full border p-2 rounded" placeholder="Font Size" />
        <input className="w-full border p-2 rounded mt-2" placeholder="Font Weight" />
      </div>
    </div>
  );
}
