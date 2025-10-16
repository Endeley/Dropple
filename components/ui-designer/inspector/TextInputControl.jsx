'use client';

export default function TextInputControl({ label, value, onChange, type = 'text' }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
        </label>
    );
}
