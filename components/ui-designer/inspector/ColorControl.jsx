'use client';

export default function ColorControl({ label, value, onChange }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
            {label}
            <input
                type="color"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-8 w-full cursor-pointer rounded border border-slate-200"
            />
        </label>
    );
}
