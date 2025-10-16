'use client';

import { LayoutGrid } from 'lucide-react';

export default function TemplateMenu({ templates, onUseTemplate }) {
    return (
        <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <LayoutGrid className="h-4 w-4" /> Templates
            </div>
            <div className="grid gap-2">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onUseTemplate?.(template)}
                        className="rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/60"
                    >
                        <div className="text-sm font-semibold text-slate-800">{template.label}</div>
                        <div className="text-xs text-slate-500">{template.description ?? 'Starter layout'}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
