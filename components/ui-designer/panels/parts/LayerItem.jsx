'use client';

import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';

export default function LayerItem({ node, depth, isSelected, onSelectLayer, onToggleVisibility, onToggleLock }) {
    const label = node.name ?? node.props?.name ?? node.type;
    return (
        <div
            key={node.id}
            className={`flex items-center justify-between rounded-lg border px-2 py-1 text-xs transition ${
                isSelected
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/60'
            }`}
            style={{ paddingLeft: depth > 0 ? 8 + depth * 8 : undefined }}
        >
            <button
                type="button"
                onClick={(event) => onSelectLayer?.(node.id, event)}
                className="flex flex-1 items-center gap-2 text-left"
            >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-500/10 text-[10px] font-semibold uppercase text-indigo-600">
                    {node.type.slice(0, 2)}
                </span>
                <span className="truncate">{label}</span>
            </button>
            <div className="ml-2 flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onToggleVisibility?.(node.id)}
                    className={`rounded border border-transparent p-1 transition hover:border-slate-200 ${
                        node.visible === false ? 'text-slate-400' : 'text-slate-600'
                    }`}
                >
                    {node.visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                    type="button"
                    onClick={() => onToggleLock?.(node.id)}
                    className={`rounded border border-transparent p-1 transition hover:border-slate-200 ${
                        node.locked ? 'text-slate-400' : 'text-slate-600'
                    }`}
                >
                    {node.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </button>
            </div>
        </div>
    );
}
