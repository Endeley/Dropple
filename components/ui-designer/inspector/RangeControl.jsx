'use client';

export default function RangeControl({ label, value, min = 0, max = 100, step = 1, onChange }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
            {label}
            <input
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(event) => onChange(Number(event.target.value))}
                className="w-full cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] text-slate-400">{value}</span>
        </label>
    );
}
