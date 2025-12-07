"use client";

export default function UIUXPrototypePanel() {
  const labelClass = "text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500";
  const inputClass =
    "w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition";

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-neutral-700">Prototype</h2>
        <p className="text-xs text-neutral-500">Define interactions for your flow.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
        <div className="space-y-2">
          <label className={labelClass}>On Click</label>
          <select className={inputClass}>
            <option>None</option>
            <option>Navigate To → Frame 1</option>
            <option>Navigate To → Frame 2</option>
            <option>Open Overlay</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Transition</label>
          <select className={inputClass}>
            <option>None</option>
            <option>Smart Animate</option>
            <option>Slide Right</option>
            <option>Slide Up</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Duration</label>
          <input type="number" placeholder="300ms" className={inputClass} />
        </div>
      </div>
    </div>
  );
}
