"use client";

export default function UIUXPrototypePanel() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-300">Prototype</h2>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">On Click</label>
        <select className="w-full bg-neutral-800 p-2 rounded">
          <option>None</option>
          <option>Navigate To → Frame 1</option>
          <option>Navigate To → Frame 2</option>
          <option>Open Overlay</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Transition</label>
        <select className="w-full bg-neutral-800 p-2 rounded">
          <option>None</option>
          <option>Smart Animate</option>
          <option>Slide Right</option>
          <option>Slide Up</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Duration</label>
        <input type="number" placeholder="300ms" className="w-full bg-neutral-800 p-2 rounded" />
      </div>
    </div>
  );
}
