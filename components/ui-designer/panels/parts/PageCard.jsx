'use client';

import { Edit2, Copy, Trash2 } from 'lucide-react';

export default function PageCard({ screen, isActive, onSelect, onRename, onDuplicate, onDelete }) {
    const handleKey = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect?.(screen.id);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect?.(screen.id)}
            onKeyDown={handleKey}
            className={`rounded-lg border px-3 py-2 text-xs transition focus:outline-none ${
                isActive
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/60'
            }`}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{screen.name ?? 'Untitled'}</span>
                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                    {screen.kind ?? 'Page'}
                </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px]">
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onRename?.(screen);
                    }}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700"
                >
                    <Edit2 className="h-3 w-3" /> Rename
                </button>
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onDuplicate?.(screen.id);
                    }}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700"
                >
                    <Copy className="h-3 w-3" /> Duplicate
                </button>
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete?.(screen.id);
                    }}
                    className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600"
                >
                    <Trash2 className="h-3 w-3" /> Delete
                </button>
            </div>
        </div>
    );
}
